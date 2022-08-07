import { clearTimeout } from 'timers';
import { IShellParams } from '../interface/IProcessParams';
import type { Shell } from '../Shell';

export class ShellStalledOutputHandler {

    private _timeout;
    private _ms: number;
    private _lastOutput: number;

    constructor (private params: IShellParams, public shell: Shell) {

    }

    init () {
        let { shell, params } = this;

        this._ms = params.restartOnStalledOutput?.emptyOutputInterval;
        if (typeof this._ms !== 'number') {
            return;
        }

        shell
            .on('process_start', (data) => this.onProcessStarted(data))
            .on('process_exit', (data) => this.onProcessExit(data))
            .on('process_stderr', (data) => this.onProcessStd('stderr', data))
            .on('process_stdout', (data) => this.onProcessStd('stdout', data))
            ;
    }


    private onProcessStarted (data: { command }) {
        this._lastOutput = Date.now();
        this.stop();
        this.defer(this._ms);
    }

    private onProcessExit (data) {
        this.stop();
    }

    private onProcessStd (output: 'stderr' | 'stdout', data) {
        this._lastOutput = Date.now();
    }

    private stop () {
        clearTimeout(this._timeout);
    }
    private defer (ms) {
        this._timeout = setTimeout(() => this.onTimer(), ms);
    }
    private async onTimer () {
        let ms = Date.now() - this._lastOutput;
        if (ms >= this._ms) {
            await this.restart();
            return;
        }

        // otherwise check again after (TIMEOUT_MS - LAST_OUTPUT_MS)
        this.defer(this._ms - ms);
    }

    private async restart () {
        console.log(`Restarting the process, as there was not output for ${this._ms}ms`);
        await this.shell.restart();
    }
}
