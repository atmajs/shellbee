import { IShellParams } from '../interface/IProcessParams';

export class ShellErrorExitsHandler {

    private _params: IShellParams;
    private _errors: {
        time: number
    }[]

    private _active = false;

    private options = {
        delayMs: 200,
        maxRestartCount: 10,
        maxRestartTimespanMs: 30 * 1000,
    }

    constructor (params: IShellParams) {
        this._params = params;
        this._errors = [];

        this._active = params.restartOnErrorExit != null && params.restartOnErrorExit !== false;

        if (typeof params.restartOnErrorExit !== 'boolean') {
            let opts = params.restartOnErrorExit;
            this.options.delayMs = opts.delayMs ??  this.options.delayMs;

            this.options.maxRestartCount = opts.maxRestartCount ??  this.options.maxRestartCount;
            this.options.maxRestartTimespanMs = opts.maxRestartTimespanMs ??  this.options.maxRestartTimespanMs;
        }
    }


    delay (cb) {
        this._errors.push({ time: Date.now() })
        setTimeout(() => cb(), this.options.delayMs);
    }

    isActive () {
        if (this._active !== true) {
            return false;
        }

        let fromTimePoint = Date.now() - this.options.maxRestartTimespanMs;
        let errors = this._errors.filter(x => x.time > fromTimePoint);
        if (errors.length < this.options.maxRestartCount) {
            return true;
        }

        return false;
    }
}
