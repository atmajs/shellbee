import { Shell } from '../src/Shell';

UTest({
    async 'should run with shell' () {
        let shell = await Shell.run({
            shell: 'node ./test/fixtures/wrapper/run.js -c %COMMAND% -b',
            command: 'write',
            silent: true
        });

        let { stdout } = await shell.onCompleteAsync();
        deepEq_(stdout, ['-c write -b']);
    }
});
