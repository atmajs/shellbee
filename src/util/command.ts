import { path_ensure } from './path';
import { ICommandOptions } from '../interface/ICommandOptions';

export function command_parseAll(commands, detachedAll, cwdAll, rgxReadyAll): ICommandOptions[] {
    if (cwdAll != null) {
        cwdAll = path_ensure(cwdAll, process.cwd());
    }
    return commands.reduce(function (aggr, command, index) {

        var detached = detachedAll || false,
            cwd = cwdAll || process.cwd(),
            matchReady = rgxReadyAll,
            extract = null,
            exec;

        if (typeof command === 'string') {
            exec = command;
        }
        else if (command != null) {
            var obj = command;
            exec = obj.command;
            if (obj.cwd) {
                cwd = path_ensure(obj.cwd, cwd);
            }
            if (obj.detached) {
                detached = obj.detached;
            }
            if (obj.matchReady) {
                matchReady = obj.matchReady;
            }
            if (obj.extract) {
                extract = obj.extract;
            }
        }

        if (exec == null || exec === '') {
            console.warn('Command Object is not valid. Should be at least {command: string}');
            return aggr;
        }

        var args = command_parse(exec);
        aggr.push({
            exec: args.shift(),
            args: args,
            cwd: cwd,
            //stdio: 'pipe',
            detached: detached,
            command: exec,
            matchReady: matchReady,
            extract: extract
        });
        return aggr;

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
