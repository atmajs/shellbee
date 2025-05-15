import { class_EventEmitter, class_Dfr, class_Uri } from 'atma-utils';
import { File, Directory } from 'atma-io';
import * as child_process from 'child_process';
import { command_parseAll } from './util/command';
import { IShellParams } from './interface/IProcessParams';
import { ICommandOptions } from './interface/ICommandOptions';
import { ValueExtractor } from './ValueExtractor';
import { CommunicationChannel } from './CommunicationChannel';
import { events_someOnce } from './util/events';
import * as treeKill from 'tree-kill';
import { ShellParamsUtil } from './util/ShellParamsUtil';
import { ShellErrorExitsHandler } from './util/ShellErrorExitsHandler';
import { ShellStalledOutputHandler } from './util/ShellStalledOutputHandler';


export type ProcessEventType =
    'process_start' |
    'process_exception' |
    'process_exit' |
    'process_ready' |
    'process_stdout' |
    'process_stderr';

export interface IProcessEvents {
    process_start(data: { command: string })
    process_exception(data: {
        command: string
        error: Error | string
    })
    process_exit(data: {
        command: string
        code: number
        result: ProcessResult
    })
    process_ready(data: { command: string })
    process_stdout(data: {
        command: string
        buffer: Buffer | string
    })
    process_stderr(data: {
        command: string
        buffer: Buffer | string
    })
    channel_closed(data: {
        channel: CommunicationChannel
    })
    channel_created(data: {
        channel: CommunicationChannel
    })
}

export class Shell extends class_EventEmitter<IProcessEvents> {

    private errorsHandler: ShellErrorExitsHandler;
    private stalledOutputHandler: ShellStalledOutputHandler;

    static ipc = CommunicationChannel.ipc;

    children = [] as {
        process: child_process.ChildProcess
        options: ICommandOptions
    }[];

    errors = [] as { command: string, error: Error }[]
    lastCode: number = 0

    currentOptions: ICommandOptions
    commands: ICommandOptions[]
    commandsQueue: ICommandOptions[]

    results = [] as ProcessResult[]
    extracted = {}
    state = ShellState.Initial
    promise: Promise<Shell> = <any>new class_Dfr();

    std: string[] = [];
    stderr: string[] = [];
    stdout: string[] = [];

    start: Date
    end: Date
    isBusy = false
    isReady = false;
    channel: CommunicationChannel
    params: IShellParams;

    constructor(params: IShellParams) {
        super();

        this.params = ShellParamsUtil.normalize(params);
        this.errorsHandler = new ShellErrorExitsHandler(this.params);
        this.stalledOutputHandler = new ShellStalledOutputHandler(this.params, this);
        this.stalledOutputHandler.init();

        this.commands = command_parseAll(
            params.commands,
            params
        );
        this.commandsQueue = this.commands.slice();

        this.on('process_start', () => {
            this.state = ShellState.Started;
        });
    }

    /**
     * Static "run" intializes the Shell instance and calls "run" instance method.
     * @return Returns a promise, which is resolved after all commands exit.
     */
    static run (command: string): Promise<Shell>
    static run (commands: string[]): Promise<Shell>
    static run (params: IShellParams): Promise<Shell>
    static run (mix: string | string[] | IShellParams): Promise<Shell> {
        let params: IShellParams;
        if (typeof mix === 'string') {
            params = { command: mix }
        } else if (Array.isArray(mix)) {
            params = { commands: mix }
        } else {
            params = mix;
        }
        return new Shell(params).run();
    }

    /**
     * "Run" starts the command
     * @returns Promise, which is resolved after the executables are completed.
     */
    run(): Promise<Shell> {
        if (this.isBusy === false) {
            this.next();
            return this.promise as any;
        }
        return this.promise as any;
    }

    static factory(config: IShellParams): Pick<typeof Shell, 'run'> {
        return {
            run (mix: string | string[] | IShellParams) {
                let params: IShellParams;
                if (typeof mix === 'string') {
                    params = { command: mix }
                } else if (Array.isArray(mix)) {
                    params = { commands: mix }
                } else {
                    params = mix;
                }
                return Shell.run({
                    ...config,
                    ...params,
                });
            }
        };
    }

    onStart(cb: (data: { command: string }) => void): this {
        return this.on('process_start', cb);
    }
    onStdout(cb: (data: { command: string, buffer: string }) => void): this {
        return this.on('process_stdout', cb);
    }
    onStderr(cb: (data: { command: string, buffer: string }) => void): this {
        return this.on('process_stderr', cb);
    }
    onExit(cb: (data: { command: string, code: number, result: ProcessResult }) => void): this {
        return this.on('process_exit', cb);
    }
    /** When rgxReady is specified the event will be called */
    onReady(cb: (result: { command: string }) => void): this {
        let isAlreadyCompleted = this.isBusy === false && this.lastCode != null;
        let isReady = this.isReady;
        if (isReady || isAlreadyCompleted) {
            cb({ command: this.currentOptions?.command });
            return;
        }

        if (!this.currentOptions?.matchReady && this.commandsQueue.some(x => x.matchReady) === false) {
            console.error('Ready Matcher Regex is not defined', this.currentOptions?.command ?? this.commands?.[0]?.command);
        }
        return this.on('process_ready', cb);
    }
    onReadyAsync (): Promise<{ command: string}> {
        return new Promise(resolve => {
            this.onReady(resolve);
        });
    }
    onComplete(cb: (shell: Shell) => void): this {
        (this.promise as any).always(() => cb(this));
        return this;
    }
    onCompleteAsync (): Promise<this> {
        return new Promise((resolve) => {
            this.onComplete(resolve as any)
        });
    }

    kill(signal?: number | NodeJS.Signals)
    kill(options?: TKillOptions)
    kill(mix: number | NodeJS.Signals | TKillOptions) {

        let signal: number | NodeJS.Signals = 'SIGINT';
        let commandIdx: number  = 0;
        let terminateAfterMs: number = null;

        if (mix != null) {

            signal = (typeof mix === 'object' ? mix.signal : mix) ?? signal;
            if (typeof mix === 'object') {
                commandIdx = mix.commandIdx ?? commandIdx;
                terminateAfterMs = mix.terminateAfter ?? terminateAfterMs;
            }
        }

        return new Promise(resolve => {
            let isCompleted = this.isBusy === false && this.lastCode != null;
            if (isCompleted) {
                return resolve(null);
            }
            let options = this.commands[commandIdx];
            let child = this.children.find(x => x.options === options);
            if (child == null) {
                return resolve(null);
            }
            let i = this.children.indexOf(child);
            this.children.splice(i, 1);

            let timeout;

            child.process.kill(signal);
            this.once('process_exit', () => {
                if (timeout != null) {
                    clearTimeout(timeout);
                }
                resolve(null);
            });
            if (terminateAfterMs != null) {
                timeout = setTimeout(() => {
                    (treeKill as any)(child.process.pid);
                }, terminateAfterMs);
            }
        });
    }
    /** Uses tree-kill to terminate the tree */
    terminate() {
        return new Promise(resolve => {
            let child = this.children.pop();
            if (child == null) {
                return resolve(null);
            }
            this.once('process_exit', resolve);
            (treeKill as any)(child.process.pid);
        });
    }

    send<TOut = any>(method: string, ...args: any[]): Promise<TOut> {
        return new Promise((resolve, reject) => {
            this.waitForChannel().then((channel: CommunicationChannel) => {
                channel.call(method, ...args).then(resolve, reject);
            }, reject)
        });
    }

    async restart (index?: number)
    async restart (command?: string)
    async restart (mix: number | string = 0) {
        let options: ICommandOptions;
        if (typeof mix === 'number') {
            options = this.commands[mix]
        } else {
            options = this.commands.find(x => x.command === mix);
        }
        if (options == null) {
            throw new Error(`Options undefined for ${mix}`);
        }

        this.commandsQueue.push(options);

        if (this.isBusy === false) {
            this.next();
            return;
        }
        // `next` will be called indirect (after the process exits)
        await this.kill({ terminateAfter: 10_000 })
    }

    private waitForChannel() {
        if (this.currentOptions.ipc && this.isReady === false) {
            return new Promise((resolve, reject) => {
                events_someOnce(this, {
                    'process_ready': () => {
                        this.waitForChannel().then(resolve, reject);
                    },
                    'exit': () => {
                        reject('Process exited');
                    }
                });
            })
        }
        return new Promise((resolve, reject) => {
            if (this.channel) {
                resolve(this.channel);
                return;
            }
            events_someOnce(this, {
                'channel_created': () => {
                    resolve(this.channel)
                },
                'exit': () => {
                    reject('Process exited');
                }
            });
        })
    }
    private next(): Promise<Shell> {
        if (this.isBusy === false) {
            this.start = new Date();
            this.isBusy = true;
            this.isReady = false;
        }
        if (this.channel) {
            this.emit('channel_closed', {
                channel: this.channel
            });
            if (this.commandsQueue.length !== 0 || (this.lastCode === 1 && this.errorsHandler.isActive())) {
                this.channel = null;
            }
        }
        if (this.lastCode === 1 && this.errorsHandler.isActive()) {
            this.lastCode = 0;
            this.commandsQueue.push(this.currentOptions);
            this.errorsHandler.delay(() => {
                this.next();
            });
            return this.promise;
        }

        if (this.commandsQueue.length === 0) {
            if (this.state !== ShellState.Empty) {
                this.state = ShellState.Empty;
                this.end = new Date();
                this.isBusy = false;

                const promise = this.promise as any as class_Dfr;
                // Always resolve the promise, consumer should check for errors
                promise.resolve(this);
            }
            return this.promise as any;
        }

        let child = null as child_process.ChildProcess;
        let options = this.commandsQueue.shift();
        let command: string = ValueExtractor.interpolateAny(options.command, this.extracted);
        let rgxReady = options.matchReady;
        let detached = options.detached === true;
        let silent = this.params.silent;
        let stdio = detached ? (void 0) : 'pipe';
        let extractor = options.extract ? new ValueExtractor(this.extracted, options.extract) : null;

        let result = new ProcessResult(options);
        this.results.push(result);
        this.currentOptions = options;

        if (!options.fork && global.process.platform === 'win32') {
            if (options.exec !== 'cmd') {

                options.args.unshift('/C', options.exec);
                options.exec = 'cmd';
            }
        }
        if (rgxReady == null && options.ipc) {
            rgxReady = /IPC Listening/i;
        }
        this.isReady = rgxReady == null;

        try {
            let cwd = options.cwd;
            if (cwd != null) {
                let hasFileProtocol = cwd.startsWith('file:')
                let cwdUri = hasFileProtocol ? cwd : 'file://' + cwd;
                if (Directory.exists(cwdUri + '/') === false) {
                    throw Error('CWD Directory not exists: ' + cwd);
                }
                if (hasFileProtocol) {
                    cwd = new class_Uri(cwd).toLocalDir();
                }
            }
            if (cwd == null) {
                cwd = process.cwd()
            }

            let exec = ValueExtractor.interpolateAny(options.exec, this.extracted, options);
            let args = ValueExtractor.interpolateAny(options.args, this.extracted, options);
            let method = options.fork ? 'fork' : 'spawn';

            if (this.params.verbose) {
                this.print(`${method}: ${exec} ${args.join('')}`);
            }

            child = options.fork
                ? child_process.fork(exec, args, {
                    cwd: options.cwd || process.cwd(),
                    env: process.env,
                    stdio: stdio as any,
                    detached: detached
                })
                : child_process.spawn(exec, args, {
                    cwd: options.cwd || process.cwd(),
                    env: process.env,
                    stdio: stdio as any,
                    detached: detached
                });

            if (options.fork) {
                this.channel = new CommunicationChannel(child, this.params.timeoutMs ?? 10000);
                this.emit('channel_created', {
                    channel: this.channel
                });
            }

            result.pid = child.pid;
            this.children.push({
                process: child,
                options: options,
            });
        } catch (error) {
            if (this.params.verbose) {
                this.print('on start exception:', error);
            }

            result.error = error;

            this.errors.push({
                command: command,
                error: error
            });
            this.emit('process_exception', {
                command: command,
                error: error
            });
            return this.next();
        }

        child.on('error', (error) => {
            if (this.params.verbose) {
                this.print('on error:', error);
            }
            this.channel?.onError(error);
        });

        child.on('exit', (code) => {
            if (this.params.verbose) {
                this.print('on exit:', code);
            }
            result.resultCode = code ?? 0;

            this.emit('process_exit', {
                command: command,
                code: code,
                result: result
            });
            this.isBusy = false;
            this.isReady = false;
            this.lastCode = code;

            if (code > 0) {
                let msg = result.stderr.slice(-20).join('');
                let err = new Error(`Exit code: ${code}. ${msg ?? ''}`)
                this.errors.push({
                    command: command,
                    error: err
                });
                this.channel?.onError(err);
            }
            extractor?.complete();
            this.next();
        });

        child.stdout.on('data', (buffer) => {
            if (detached !== true && silent !== true) {
                process.stdout.write(buffer);
            }
            if (rgxReady != null && rgxReady.test(buffer.toString())) {
                rgxReady = null;
                this.isReady = true;
                this.emit('process_ready', {
                    command: command
                });
            }
            if (extractor != null) {
                extractor.write(buffer);
            }

            let str = String(buffer);
            result.stdout.push(str);
            result.std.push(str);
            this.stdout.push(str);
            this.std.push(str);

            this.emit('process_stdout', {
                command: command,
                buffer: buffer
            });
        });
        child.stderr.on('data', (buffer) => {
            if (detached !== true && silent !== true) {
                process.stderr.write(buffer);
            }

            let str = String(buffer);
            result.stderr.push(str);
            result.std.push(str);
            this.stderr.push(str);
            this.std.push(str);


            this.emit('process_stderr', {
                command: command,
                buffer: buffer
            });

            if (str.includes('UnhandledPromiseRejectionWarning')) {
                this.channel?.onStdError(str);
            }
        });

        this.emit('process_start', {
            command: command
        });

        if (this.params.parallel !== false) {
            this.next();
        }
        if (rgxReady == null) {
            setTimeout(() => {
                this.emit('process_ready', {
                    command: command
                });
            }, 200);
        }
        return this.promise as any;
    }
    private print(...args) {
        console.log('Shellbee: ' + args.join(' '));
    }
};

export class ProcessResult {

    pid: number
    std: string[] = []
    stdout: string[] = []
    stderr: string[] = []

    resultCode: number = null

    error: Error = null

    constructor(public options: ICommandOptions) {

    }
}

enum ShellState {
    Empty = -1,
    Initial = 0,
    Started = 1
}


type TKillOptions = {
    signal?: number | NodeJS.Signals
    commandIdx?: number
    terminateAfter?: number
}
