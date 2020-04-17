# Shellbee

> Yet another shell command executor (**cmd**, **bash**) and NodeJS fork with channel communication.

----
[![Build Status](https://travis-ci.org/atmajs/shellbee.svg?branch=master)](https://travis-ci.org/atmajs/shellbee)
[![NPM version](https://badge.fury.io/js/shellbee.svg)](http://badge.fury.io/js/shellbee)


```ts
import { Shell } from 'shellbee'

let shell: Shell = await Shell.run(command: IShellParams);

// with callbacks
let shell = new Shell({ command: `git commit -am "foo"` });

interface IShellParams {
    command?: string | IProcessSingleParams
    commands?: (string | IProcessSingleParams)[]
    detached?: boolean
    cwd?: string

    /** Watches the output and emits ready event when the child process prints expected text to the std */
    matchReady?: RegExp
    silent?: boolean
    parallel?: boolean

    // command should container js file to fork
    fork?: boolean

    timeoutsMs?: number

    restartOnErrorExit?: boolean
}

interface IProcessSingleParams {
    command: string
    cwd?: string
    detached?: boolean
    matchReady?: RegExp
    extract: {[ key: string ]: (output: string) => any }
}

interface IShell {
    commands: ICommandOptions[]
    results = [] as ProcessResult[]

    std: string[] = [];
    stderr: string[] = [];
    stdout: string[] = [];

    start: Date
    end: Date
    busy: boolean

    /** Resolves after the all commands are settled */
    promise: Promise<Shell>

    run (): Promise<Shell>
    kill()


    onStart (cb: (data: { command: string }) => void): this
    onStdout (cb: (data: { command: string, buffer: string }) => void): this
    onStderr (cb: (data: { command: string, buffer: string }) => void): this
    onExit (cb: (data: { command: string, code: number, result: ProcessResult }) => void): this
    /** When rgxReady is specified the event will be called */
    onReady (cb: ({ command: string }) => void): this
    onComplete(cb: (shell: Shell) => void): this
}
```


#### Communication channel

```js

let shell: Shell = await Shell.run({ command: 'bar.js', fork: true });

shell.channel: ICommunicationChannel

interface ICommunicationChannel {
    child: ChildProdcrss
    call <T> (method: string, ...args): Promise<T> 
}
```

`call` methods sends a message to the child process:

```
{
    id: string,
    method: string
    args: any[]
}
```

The child process should process the work and sends a message with the `id` and result back to parent process:

```
{
    id: string,
    data?: any,
    error?: Error
}
```

Simple Forked file example:

```js
// worker.js
process.on('message', async (message: { id, method, args }) => {
    let result = await MyWorker.doWork(message.method, ...message.args);
    process.send({
        id: message.id,
        data: result,
        error: null
    });
});
```