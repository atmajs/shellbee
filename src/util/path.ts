import { class_Uri } from 'atma-utils';


export function path_ensure(cwd: string, base: string) {
    if (cwd[0] !== '/' && new class_Uri(cwd).isRelative()) {
        let x = require('path').normalize(class_Uri.combine(base, cwd));
        return x;
    }
    return cwd;
}
