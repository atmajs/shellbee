import { Shell } from 'shellbee'
import { class_Uri } from 'atma-utils';
import { Commands } from './Commands';
import { CommandUtil } from '../util/CommandUtil';

export class Runner {
    async execute (params: string | string[]): Promise<Shell> {
        if (typeof params === 'string') {
            params = CommandUtil.split(params);
        }

        let task = params[0];
        if (task in Commands) {
            await Commands[task](params.slice(1));
            return;
        }
    }
    async runFromCli () {

        let args = process.argv.slice(2);
        await this.execute(args);
    }
}


namespace HandleArgs {
    function whitespaces (args: string[]) {
        for (let i = 0; i < args.length; i++) {
            let str = args[i];
            if (str.includes(' ') && /'"\(/.test(str)) {
                args[i] = `"${str}"`;
            }
        }
    }
    /** Serialize array of parameters into one single command line string */
    export function serialize (args: string[]) {
        whitespaces(args);
        return args.join(' ');
    }
    export function extractCwdIfAny (args: string[]) {
        for (let i = 0; i < args.length; i++) {
            let str = args[i];
            if (/[\-]{1,2}cwd/i.test(str)) {
                let cwd = args[i + 1];

                args.splice(i, 2);
                return cwd;
            }
        }
        return null;
    }
}
