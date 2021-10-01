import { IShellParams } from '../interface/IProcessParams';

const COMMAND_PLACEHOLDER = '%COMMAND%'

export namespace ShellWrapperUtil {
    export function prefix(args: string[], config: IShellParams): string[] {
        if (!config?.shell) {
            return args;
        }
        if (Array.isArray(config.shell) === false) {
            throw new Error(`We can prefix only array of strings(argumnets)`);
            return;
        }
        let [exec, ...rest] = config.shell as string[];

        return [ ...args, exec, ...rest ];
    }

    export function wrap(command: string, config: IShellParams): string {
        if (!config?.shell) {
            return command;
        }

        if (typeof config.shell !== 'string') {
            throw new Error(`We can wrap only as command template`);
            return;
        }
        if (command.includes('"') === false) {
            command = `"${command}"`
        } else if (command.includes("'") === false) {
            command = `'${command}'`
        } else {
            throw new Error(`Command can't be quoted, as both already present`);
        }
        return config.shell.replace(COMMAND_PLACEHOLDER, command);
    }

    // [cmd, /c, ...command]
    export function isPrefix(shell: string | string[]) {
        return shell != null && Array.isArray(shell);
    }

    // bash.exe -c %COMMAND%
    export function isWrapper(shell: string | string[]) {
        return shell != null && typeof shell === 'string' && shell.includes(COMMAND_PLACEHOLDER);
    }
}
