import { Shell } from '../Shell';
import * as path from 'path';
import * as treeKill from 'tree-kill';

interface IProcess {
    /** ParentProcessId */
    pid: number
    /** ProcessId */
    ppid: number
    /** UserId (nix) */
    uid?: number
    /** GroupId (nix) */
    gid?: number

    /** ExecutablePath */
    bin: string
    /** Name */
    name: string
    /** Command  */
    cmd: string
}

export namespace PsList {

    export async function getAll(): Promise<IProcess[]> {
        return Platforms[process.platform]();
    }
    export async function kill(pid: number | string) {
        return (treeKill as any)(pid);
    }

    const ProcessListResolver = {
        async nix() {

            const shell = await Shell.run({
                silent: true,
                command: `ps ax -ww -o pid,ppid,uid,gid,args`
            });
            const stdout = shell.stdout?.join('');
            const data = utils.stripLine(stdout, 1)
            const columns = utils.extractColumns(data, [0, 1, 2, 3, 4], 5);

            let list = columns.map(column => {
                const cmd = String(column[4])
                const bin = fetchBin(cmd)
                return {
                    pid: parseInt(column[0], 10),
                    ppid: parseInt(column[1], 10),
                    uid: parseInt(column[2], 10),
                    gid: parseInt(column[3], 10),
                    name: fetchName(bin),
                    bin: bin,
                    cmd: column[4]
                }
            });
            return list;

        },
        async win32() {
            const shell = await Shell.run({
                silent: true,
                command: `powershell.exe /c "Get-CimInstance -className win32_process | select Name,ProcessId,ParentProcessId,CommandLine,ExecutablePath"`,
            });
            const std = shell.std?.join('');
            const list = utils
                .parseTable(std)
                .map(row => ({
                    pid: parseInt(row.ProcessId, 10),
                    ppid: parseInt(row.ParentProcessId, 10),
                    bin: row.ExecutablePath,
                    name: row.Name || '',
                    cmd: row.CommandLine
                }))


            return list;
        }
    };

    const Platforms = {
        darwin: ProcessListResolver.nix,
        linux: ProcessListResolver.nix,
        sunos: ProcessListResolver.nix,
        freebsd: ProcessListResolver.nix,
        win32: ProcessListResolver.win32,
    };


    function fetchBin(cmd) {
        const pieces = cmd.split(path.sep)
        const last = pieces[pieces.length - 1]
        if (last) {
            pieces[pieces.length - 1] = last.split(' ')[0]
        }
        const fixed = []
        for (const part of pieces) {
            const optIdx = part.indexOf(' -')
            if (optIdx >= 0) {
                // case: /aaa/bbb/ccc -c
                fixed.push(part.substring(0, optIdx).trim())
                break
            } else if (part.endsWith(' ')) {
                // case: node /aaa/bbb/ccc.js
                fixed.push(part.trim())
                break
            }
            fixed.push(part)
        }
        return fixed.join(path.sep)
    }

    function fetchName(fullpath) {
        if (process.platform === 'darwin') {
            const idx = fullpath.indexOf('.app/')
            if (idx >= 0) {
                return path.basename(fullpath.substring(0, idx))
            }
        }
        return path.basename(fullpath)
    }


    const utils = {

        /**
         * Strip top lines of text
         *
         * @param  {String} text
         * @param  {Number} num
         * @return {String}
         */
        stripLine(text, num) {
            let idx = 0

            while (num-- > 0) {
                const nIdx = text.indexOf('\n', idx)
                if (nIdx >= 0) {
                    idx = nIdx + 1
                }
            }

            return idx > 0 ? text.substring(idx) : text
        },

        /**
         * Split string and stop at max parts
         *
         * @param  {Number} line
         * @param  {Number} max
         * @return {Array}
         */
        split(line, max) {
            const cols = line.trim().split(/\s+/)

            if (cols.length > max) {
                cols[max - 1] = cols.slice(max - 1).join(' ')
            }

            return cols
        },

        /**
         * Extract columns from table text
         *
         * Example:
         *
         * ```
         * extractColumns(text, [0, 2], 3)
         * ```
         *
         * From:
         * ```
         * foo       bar        bar2
         * valx      valy       valz
         * ```
         *
         * To:
         * ```
         * [ ['foo', 'bar2'], ['valx', 'valz'] ]
         * ```
         *
         * @param  {String} text  raw table text
         * @param  {Array} idxes  the column index list to extract
         * @param  {Number} max   max column number of table
         * @return {Array}
         */
        extractColumns(text, idxes, max) {
            const lines = text.split(/(\r\n|\n|\r)/)
            const columns = []

            if (!max) {
                max = Math.max.apply(null, idxes) + 1
            }

            lines.forEach(line => {
                const cols = utils.split(line, max)
                const column = []

                idxes.forEach(idx => {
                    column.push(cols[idx] || '')
                })

                columns.push(column)
            })

            return columns
        },

        /**
         * parse table text to array
         *
         * From:
         * ```
         * Header1 : foo
         * Header2 : bar
         * Header3 : val
         *
         * Header1 : foo2
         * Header2 : bar2
         * Header3 : val2
         * ```
         *
         * To:
         * ```
         * [{ Header1: 'foo', Header2: 'bar', Header3: 'val' }, ...]
         * ```
         *
         * @param  {String} data raw table data
         * @return {Array}
         */
        parseTable(data) {
            const lines = data.split(/(\r\n\r\n|\r\n\n|\n\r\n)|\n\n/).filter(line => {
                return line.trim().length > 0
            }).map((e) => e.split(/(\r\n|\n|\r)/).filter(line => line.trim().length > 0))

            // Join multi-ligne value
            lines.forEach((line) => {
                for (let index = 0; line[index];) {
                    const entry = line[index]
                    if (entry.startsWith(' ')) {
                        line[index - 1] += entry.trimLeft()
                        line.splice(index, 1)
                    } else {
                        index += 1
                    }
                }
            })

            return lines.map(line => {
                const row = {}
                line.forEach((string) => {
                    const splitterIndex = string.indexOf(':')
                    const key = string.slice(0, splitterIndex).trim()
                    row[key] = string.slice(splitterIndex + 1).trim()
                });
                return row
            })
        }
    }
}
