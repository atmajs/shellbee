import { class_Uri } from 'atma-utils';


export function path_ensure(cwd, base) {
    if (new class_Uri(cwd).isRelative()) {
        var x = require('path').normalize(class_Uri.combine(base, cwd));
        return x;
    }
    return cwd;
}
