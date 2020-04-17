import { path_ensure } from './path';
import { ICommandOptions } from '../interface/ICommandOptions';
import { IShellParams } from '../interface/IProcessParams';

export function command_parseAll(
    commands, 
    $params: IShellParams
): ICommandOptions[] {
    let cwdAll = $params.cwd ?? process.cwd()
    
    cwdAll = path_ensure(cwdAll, process.cwd());
    
    return commands.reduce(function (out, command: string | ICommandOptions, index) {

        // var detached = detachedAll || false,
        //     //cwd = cwdAll || process.cwd(),
        //     matchReady = rgxReadyAll,
        //     extract = null;

        let opts: ICommandOptions = typeof command === 'string' ? <any> { exec: command } : command;
        
        if (opts.cwd) {
            opts.cwd = path_ensure(opts.cwd, cwdAll ?? process.cwd());
        }
        // if (typeof command === 'string') {
        //     exec = command;
        // }
        // else if (command != null) {
        //     var obj = command;
        //     exec = obj.command;
        //     if (obj.cwd) {
                
        //     }
        //     if (obj.detached) {
        //         detached = obj.detached;
        //     }
        //     if (obj.matchReady) {
        //         matchReady = obj.matchReady;
        //     }
        //     if (obj.extract) {
        //         extract = obj.extract;
        //     }
        //     if ('fork' in obj) {
        //         fork = obj.fork;
        //     }
        // }

        let exec = opts.exec;
        if (exec == null || exec === '') {
            console.warn('Command Object is not valid. Should be at least {command: string}');
            return out;
        }

        let args = command_parse(exec);
        out.push({
            exec: args.shift(),
            args: args,
            cwd: opts.cwd ?? cwdAll ?? process.cwd(),
            //stdio: 'pipe',
            detached: opts.detached ?? $params.detached ?? false,
            command: exec,
            matchReady: opts.matchReady ?? $params.matchReady,
            extract: opts.extract,
            fork: opts.fork ?? $params.fork ?? false
        });
        return out;

    }, []);
}

function command_parse(command: string) {
    var parts = command.trim().split(/\s+/);
    var imax = parts.length, i = -1, c, arg;
    while (++i < imax) {
        arg = parts[i];
        if (arg.length === 0)
            continue;
        c = arg[0];
        if (c !== '"' && c !== "'")
            continue;
        var start = i;
        for (; i < imax; i++) {
            arg = parts[i];
            if (arg[arg.length - 1] === c) {
                var str = parts
                    .splice(start, i - start + 1)
                    .join(' ')
                    .slice(1, -1);
                parts.splice(start, 0, str);
                imax = parts.length;
                break;
            }
        }
    }
    return parts;
}
