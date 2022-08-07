import { File } from 'atma-io';
import { Shell } from '../src/Shell';

UTest({
    async 'should override shell executor template' () {
        let shell = await Shell.run({
            shell: 'node ./test/fixtures/wrapper/run.js -c %COMMAND% -b',
            command: 'write',
            silent: true
        });

        let { stdout } = await shell.onCompleteAsync();
        deepEq_(stdout, ['-c write -b']);
    },
});
