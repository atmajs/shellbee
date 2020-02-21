import { class_EventEmitter, class_Dfr } from 'atma-utils';
import { File, Directory } from 'atma-io';
import * as child_process from 'child_process';
import { command_parseAll } from './util/command';
import { IShellParams } from './interface/IProcessParams';
import { ICommandOptions } from './interface/ICommandOptions';
import { ValueExtractor } from './ValueExtractor';

export type ProcessEventType =
    'process_start' |
    'process_exception' |
    'process_exit' |
    'process_ready' |
    'process_stdout' |
    'process_stderr';

export class Shell extends class_EventEmitter {

    children = [] as  child_process.ChildProcessWithoutNullStreams[]
    errors = []
    lastCode: number = 0
    silent: boolean
    parallel: boolean
    commands: ICommandOptions[]
    results = [] as ProcessResult[]
    extracted = {}
    state = 0
    promise: Promise<Shell> = <any> new class_Dfr();

    std: string[] = [];
    stderr: string[] = [];
    stdout: string[] = [];

    start: Date
    end: Date
    busy = false

    constructor(params: IShellParams) {
        super();

        let command = params.command || params.commands,
            detached = params.detached || false,
            cwd = params.cwd || process.cwd(),
            rgxReady = params.matchReady;

        this.silent = params.silent;
        this.parallel = params.parallel || false;

        let commands = Array.isArray(command)
            ?   command
            : [ command ]
            ;

        this.commands = command_parseAll(
            commands,
            detached,
            cwd,
            rgxReady
        );
    }

    static run (params: IShellParams): Promise<Shell> {
        return new Shell(params).run();
    }
    run (): Promise<Shell> {
        if (this.busy === false) {
            this.next();
        }
        return this.promise as any;
    }

    onStart (cb: (data: { command: string }) => void): this {
        return this.on('process_start', cb);
    }
    onStdout (cb: (data: { command: string, buffer: string }) => void): this {
        return this.on('process_stdout', cb);
    }
    onStderr (cb: (data: { command: string, buffer: string }) => void): this {
        return this.on('process_stderr', cb);
    }
    onExit (cb: (data: { command: string, code: number, result: ProcessResult }) => void): this {
        return this.on('process_exit', cb);
    }
    /** When rgxReady is specified the event will be called */
    onReady (cb: ({ command: string }) => void): this {
        if (this.commands.some(x => x.matchReady) === false) {
            console.error('Ready Matcher is not defined');
        }
        return this.on('process_ready', cb);
    }
    onComplete(cb: (shell: Shell) => void): this {
        (this.promise as any).always(() => cb(this));
        return this;
    }

    kill () {
        return new Promise(resolve => {
            var child = this.children.pop();
            if (child == null) {
                return resolve();
            }
            this.once('process_exit', resolve);
            child.kill('SIGINT');
        });
    }
    private next (): Promise<Shell> {
        if (this.busy === false) {
            this.start = new Date();
            this.busy = true;
        }
        if (this.commands.length === 0) {
            if (this.state !== -1) {
                this.state = -1;
                this.end = new Date();
                this.busy = false;
                (this.promise as any).resolve(this);
            }
            return this.promise as any;
        }

        let child = null;
        let options = this.commands.shift();
        let command = ValueExtractor.interpolateAny(options.command, this.extracted);
        let rgxReady = options.matchReady;
        let detached = options.detached === true;
        let silent = this.silent;
        let stdio = detached ? (void 0) : 'pipe';
        let extractor = options.extract ? new ValueExtractor(this.extracted, options.extract) : null;

        let result = new ProcessResult(options);
        this.results.push(result);

        if (global.process.platform === 'win32') {
            if (options.exec !== 'cmd') {

                options.args.unshift('/C', options.exec);
                options.exec = 'cmd';
            }
        }
        try {
            let cwd = options.cwd;
            if (cwd != null && Directory.exists(cwd + '/') === false) {
                throw Error('CWD Directory not exists: ' + cwd);
            }
            if (cwd == null) {
                cwd = process.cwd()
            }

            let exec = ValueExtractor.interpolateAny(options.exec, this.extracted);
            let args = ValueExtractor.interpolateAny(options.args, this.extracted);

            child = child_process.spawn(exec, args, {
                cwd: options.cwd || process.cwd(),
                env: process.env,
                stdio: stdio as any,
                detached: detached
            });
            this.children.push(child);
        } catch (error) {

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

        
        child.on('exit',  (code) => {
            result.resultCode = code;

            this.emit('process_exit', {
                command: command,
                code: code,
                result: result
            });
            this.lastCode = code;

            if (code > 0) {
                this.errors.push({
                    command: command,
                    error: new Error('Exit code: ' + code)
                });
            }
            extractor && extractor.complete();
            this.next();
        });

        child.stdout.on('data',  (buffer) => {
            if (detached !== true && silent !== true) {
                process.stdout.write(buffer);
            }
            if (rgxReady != null && rgxReady.test(buffer.toString())) {
                rgxReady = null;
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
        child.stderr.on('data',  (buffer) => {
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
};

export class ProcessResult {

    std: string[] = []
    stdout: string[] = []
    stderr: string[] = []

    resultCode: number = null

    error: Error = null

    constructor (public options: ICommandOptions) {

    }
}