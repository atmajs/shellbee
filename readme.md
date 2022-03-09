# Shellbee

<p align='center'>
    <img src='assets/background.jpg'/>
</p>

----
> Yet another shell command executor (**cmd**, **bash**) and NodeJS fork with Inter Process Communication (IPC).

----

[![Build Status](https://api.travis-ci.com/atmajs/shellbee.svg?branch=master)](https://app.travis-ci.com/github/atmajs/shellbee)
[![NPM version](https://badge.fury.io/js/shellbee.svg)](http://badge.fury.io/js/shellbee)



```ts
import { Shell } from 'shellbee'

// executes commmands and waits until they exit
let shell: Shell = await Shell.run(command: string | string[] | IShellParams);


// instatiate the new shell instance, attach all required event listeners, etc, and later call `run` to start executing
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

    // Defines if a child_process supports IPC
    ipc?: boolean

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


## Communication channel

#### Basic Configuration

```ts
// main.js
import { Shell } from 'shellbee'

let shell = new Shell({
    command: 'bar.js',
    fork: true,
    ipc: true
})
shell.run();
let result = await shell.send('doFoo', { foo: 1 });
```


```ts
// bar.js
import { Shell } from 'shellbee'

Shell.ipc({
    doFoo (...args) {
        console.log(args);
        return 'lorem';
    }
});
```


#### Advanced Configuration

1. Fork a process as usual.
```js

let shell = new Shell({ command: 'bar.js', fork: true });

shell.run();

```

2. In the worker listen for a message

```ts
{
    id: string,
    method: string
    args: any[]
}
```

The child process should process the work and sends a message with the `id` and result back to parent process:

```ts
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


----
