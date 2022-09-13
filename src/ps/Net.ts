import alot from 'alot';
import { Shell } from '../Shell';

export namespace Net {

    interface IProcess {
        pid: string
        status?: string
        protocol: 'tcp' | 'udp' | string
    }

    const PidResolver = {
        async nix(port: string | number) {
            /*
            COMMAND   PID    USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
            nc      20661 michael    3u  IPv4 0x3b190d9d07c2c3db      0t0  TCP *:8017 (LISTEN)
            nc      21145 michael    3u  IPv4 0x3b190d9d054773db      0t0  TCP *:8017 (LISTEN)
            Python  21221 michael    3u  IPv4 0x3b190d9ceb8dfd7b      0t0  UDP localhost:8017
            */

            const table = await exec(`lsof -i :${port}`);
            const iPid = 1;
            const iStatus = 9;
            const iProtocol = 7;

            return table.map(row => {
                const pid = Number(row[iPid]);
                const status = row[iStatus] ?? '';
                const protocol = row[iProtocol]?.toLowerCase() ?? 'tcp';
                return {
                    pid,
                    status,
                    protocol,
                };
            });

        },
        async win32(port: string | number) {
            /*
            TCP    0.0.0.0:9000           0.0.0.0:0              LISTENING       5220
            TCP    127.0.0.1:9000         127.0.0.1:62376        ESTABLISHED     5220
            TCP    127.0.0.1:62288        127.0.0.1:9000         TIME_WAIT       0
            TCP    127.0.0.1:62376        127.0.0.1:9000         ESTABLISHED     7604
            UDP    127.0.0.1:9000         *:*                                    1240
            */

            const table = await exec(`netstat -a -n -o | findstr :${port}`);
            const iPid = 4;
            const iStatus = 3;
            const iProtocol = 0;

            return table.map(row => {
                const pid = Number(row[iPid]);
                const status = row[iStatus];
                const protocol = row[iProtocol]?.toLowerCase()
                return {
                    pid,
                    status,
                    protocol,
                };
            });
        }
    }

    async function exec (command: string): Promise<string[][]> {
        const shell = await Shell.run({
            silent: true,
            command,
        });
        const std = shell.std?.join('');
        return std
            .split('\n')
            .map(x => x.trim())
            .filter(Boolean)
            .map(line => {
                return line.split(' ').map(x => x.trim()).filter(Boolean)
            })
            .filter(x => x.length > 0);
    }

    const Platforms = {
        darwin: PidResolver.nix,
        linux: PidResolver.nix,
        sunos: PidResolver.nix,
        freebsd: PidResolver.nix,
        win32: PidResolver.win32,
    };

    export async function findByPort(port: string | number): Promise<IProcess[]> {
        let arr: IProcess[] = await Platforms[process.platform](port);
        return alot(arr).distinctBy(x => x.pid).toArray();
    };
}
