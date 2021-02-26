import { class_EventEmitter, class_Dfr, class_Uri } from 'atma-utils';
import { File, Directory } from 'atma-io';
import * as child_process from 'child_process';
import { command_parseAll } from './util/command';
import { IShellParams } from './interface/IProcessParams';
import { ICommandOptions } from './interface/ICommandOptions';
import { ValueExtractor } from './ValueExtractor';
import { CommunicationChannel } from './CommunicationChannel';
import { events_someOnce } from './util/events';
import treeKill from 'tree-kill';

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

    static ipc = CommunicationChannel.ipc;

    children = [] as child_process.ChildProcess[]
    errors = [] as { command: string, error: Error }[]
    lastCode: number = 0
    silent: boolean
    parallel: boolean

    currentOptions: ICommandOptions
    commands: ICommandOptions[]
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
    restartOnErrorExit = false;
    channel: CommunicationChannel

    constructor(private params: IShellParams) {
        super();

        let command = params.command ?? params.commands;

        this.silent = params.silent;
        this.parallel = params.parallel ?? false;
        this.restartOnErrorExit = params.restartOnErrorExit ?? false;

        let commands = Array.isArray(command)
            ? command
            : [command]
            ;

        this.commands = command_parseAll(
            commands,
            params
        );

        this.on('process_start', () => {
            this.state = ShellState.Started;
        });
    }

    static run(params: IShellParams): Promise<Shell> {
        return new Shell(params).run();
    }
    run(): Promise<Shell> {
        if (this.isBusy === false) {
            this.next();
            return this.promise as any;
        }
        return this.promise as any;
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
    onReady(cb: ({ command: string }) => void): this {
        if (!this.currentOptions?.matchReady && this.commands.some(x => x.matchReady) === false) {
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

    kill(signal = 'SIGINT') {
        return new Promise(resolve => {
            let child = this.children.pop();
            if (child == null) {
                return resolve(null);
            }
            this.once('process_exit', resolve);
            child.kill(signal);
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
            treeKill(child.pid);
        });
    }

    send<TOut = any>(method: string, ...args: any[]): Promise<TOut> {
        return new Promise((resolve, reject) => {
            this.waitForChannel().then((channel: CommunicationChannel) => {
                channel.call(method, ...args).then(resolve, reject);
            }, reject)
        });
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
            if (this.commands.length !== 0 || (this.lastCode === 1 && this.restartOnErrorExit)) {
                this.channel = null;
            }
        }
        if (this.lastCode === 1 && this.restartOnErrorExit) {
            this.lastCode = 0;
            this.commands.push(this.currentOptions);
            this.next();
            return this.promise;
        }

        if (this.commands.length === 0) {
            if (this.state !== ShellState.Empty) {
                this.state = ShellState.Empty;
                this.end = new Date();
                this.isBusy = false;

                const promise = this.promise as any as class_Dfr;
                // Always resolve the promise, consumer should check for errors
                //if (this.errors.length === 0) {
                promise.resolve(this);
                // } else {
                //     let str = this.errors.map(error => {
                //         return `Command ${error.command} failed: ${error.error.message}`
                //     }).join('\n');
                //     promise.reject(new Error(str));
                // }
            }
            return this.promise as any;
        }

        let child = null;
        let options = this.commands.shift();
        let command: string = ValueExtractor.interpolateAny(options.command, this.extracted);
        let rgxReady = options.matchReady;
        let detached = options.detached === true;
        let silent = this.silent;
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

            let exec = ValueExtractor.interpolateAny(options.exec, this.extracted);
            let args = ValueExtractor.interpolateAny(options.args, this.extracted);
            let method = options.fork ? 'fork' : 'spawn';

            if (this.params.verbose) {
                this.print(`${method}: ${exec} ${args.join('')}`);
            }

            child = child_process[options.fork ? 'fork' : 'spawn'](exec, args, {
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
            this.children.push(child);
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
            result.resultCode = code;

            this.emit('process_exit', {
                command: command,
                code: code,
                result: result
            });
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

        if (this.parallel !== false) {
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
