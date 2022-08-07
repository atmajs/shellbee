
export interface IShellParams {
    command?: string | IProcessSingleParams
    commands?: (string | IProcessSingleParams)[]
    detached?: boolean
    cwd?: string
    matchReady?: RegExp
    silent?: boolean
    parallel?: boolean
    fork?: boolean
    ipc?: boolean
    restartOnErrorExit?: boolean | {
        // delay before restart
        delayMs?: number
        maxRestartTimespanMs?: number
        maxRestartCount?: number
    }
    restartOnStalledOutput?: {
        emptyOutputInterval: number
    }
    restartOptions?: {
        // path to a script, which will be "required" and can handle and modify current restart intent
        beforeRestartHandler?: string
    }

    verbose?: boolean
    timeoutMs?: number

     /**
     * Command shell wrapper, e.g. ""c:\\Program Files\\Git\\bin\\bash.exe" -c "%COMMAND%"
     * or shell prefix like ["cmd.exe", "/C"]
     */
    shell?: string | string[]
}

export interface IProcessSingleParams {
    command: string
    cwd?: string
    detached?: boolean
    matchReady?: RegExp
    fork?: boolean
    ipc?: boolean
    restartOnError?: boolean
    extract: {[ key: string ]: (output: string) => any }
}
