import alot from 'alot';
import appcfg from 'appcfg'
import { File } from 'atma-io';
import { Shell } from '../Shell';



export const Commands = {
    async run (args: string[]) {

        let command = Args.get(args, '-c')

        let shell = new Shell({
            command: command,
            restartOnErrorExit: {
                delayMs: Number(Args.get(args, '--delay', String(5 * 1000))),
                maxRestartCount: Number(Args.get(args, '--restart', String(10))),
                maxRestartTimespanMs: Number(Args.get(args, '--restart-window', String(30 * 1000))),
            }
        });
        await shell.run();
        await shell.onCompleteAsync();
    }
}

namespace Args {
    export function get(args: string[], argKey: string, $default?: string): string {
        let i = args.indexOf(argKey);
        if (i === -1) {
            if ($default != null) {
                return $default;
            }
            throw new Error(`Argument ${argKey} not found`);
        }
        let value = args[i + 1];
        if (!value) {
            if ($default != null) {
                return $default;
            }
            throw new Error(`Valud for ${argKey} expected`);
        }
        return value;
    }
}
