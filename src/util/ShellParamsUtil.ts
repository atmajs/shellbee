import { IShellParams } from '../interface/IProcessParams';

export namespace ShellParamsUtil  {

    export function normalize (params: IShellParams): IShellParams {
        if (params.shell == null) {
            params.shell = DEFAULT.shell;
        }

        if (params.command != null) {
            params.commands = [ params.command ];
        }

        if (params.commands == null) {
            throw new Error(`shellbee: Command(s) are not defined`);
        }

        params.parallel ??= false;
        params.restartOnErrorExit ??= false;
        return params;
    }
}

const DEFAULT: IShellParams = {
    shell: global.process.platform === 'win32'
        ? ['cmd.exe', '/C']
        : null
}
