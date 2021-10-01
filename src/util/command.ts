import { path_ensure } from './path';
import { ICommandOptions } from '../interface/ICommandOptions';
import { IShellParams } from '../interface/IProcessParams';
import { ShellWrapperUtil } from './ShellWrapperUtil';

export function command_parseAll(
    commands,
    params: IShellParams
): ICommandOptions[] {
    let cwdAll = params.cwd ?? process.cwd()

    cwdAll = path_ensure(cwdAll, process.cwd());

    return commands.map((command: string | ICommandOptions) => {

        let opts: ICommandOptions = typeof command === 'string' ? <any> {
            exec: command
        } : command;

        if (opts.cwd) {
            opts.cwd = path_ensure(opts.cwd, cwdAll ?? process.cwd());
        }

        let exec = opts.exec;
        if (exec == null || exec === '') {
            console.warn('Command Object is not valid. Should be at least {command: string}');
            return null;
        }

        let args = command_parse(exec, params);
        return {
            exec: args.shift(),
            args: args,
            cwd: opts.cwd ?? cwdAll ?? process.cwd(),
            //stdio: 'pipe',
            detached: opts.detached ?? params.detached ?? false,
            command: exec,
            matchReady: opts.matchReady ?? params.matchReady,
            extract: opts.extract,
            fork: opts.fork ?? params.fork ?? false,
            ipc: opts.ipc ?? params.ipc ?? false,
        };
    }).filter(x => x != null);
}

function command_parse(command: string, params: IShellParams) {
    if (ShellWrapperUtil.isWrapper(params.shell)) {
        command = ShellWrapperUtil.wrap(command, params);
    }

    let parts = command.trim().split(/\s+/);
    let imax = parts.length, i = -1, c, arg;
    while (++i < imax) {
        arg = parts[i];
        if (arg.length === 0)
            continue;
        c = arg[0];
        if (c !== '"' && c !== "'")
            continue;
        let start = i;
        for (; i < imax; i++) {
            arg = parts[i];
            if (arg[arg.length - 1] === c) {
                let str = parts
                    .splice(start, i - start + 1)
                    .join(' ')
                    .slice(1, -1);
                parts.splice(start, 0, str);
                imax = parts.length;
                break;
            }
        }
    }

    // On windows normalize executable command path to backward slashes
    if (global.process.platform === 'win32') {
        parts[0] = parts[0].replace(/\//g, '\\');
    }
    if (ShellWrapperUtil.isPrefix(params.shell)) {
        parts = ShellWrapperUtil.prefix(parts, params);
    }
    return parts;
}
