export interface IShellParams {
    command?: string | IProcessSingleParams
    commands?: (string | IProcessSingleParams)[]
    detached?: boolean
    cwd?: string
    matchReady?: RegExp
    silent?: boolean
    parallel?: boolean
}

export interface IProcessSingleParams {
    command: string
    cwd?: string
    detached?: boolean
    matchReady?: RegExp
    extract: {[ key: string ]: (output: string) => any }
}