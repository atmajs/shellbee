import { File } from 'atma-io';
import { Shell } from '../src/Shell';

const path = './test/tmp/restart.log';


UTest({
    async 'should restart running process' () {
        let path = './test/tmp/restart.log';
        await File.writeAsync(path, '');

        let shell = new Shell({
            command: 'node ./test/fixtures/restart/simple.js',
            matchReady: /started/i,
            silent: true
        });
        shell.run();

        await shell.onReadyAsync();
        await shell.restart();
        await shell.onReadyAsync();

        let content = await File.readAsync<string>(path);
        has_(content, `started\nstarted`);

        eq_(shell.results.length, 2);
        eq_(shell.results[0].resultCode, 0);
        eq_(shell.results[1].resultCode, null);
    },
    async 'should restart stalled process' () {
        let path = './test/tmp/restart.log';
        await File.writeAsync(path, '');

        let shell = new Shell({
            command: 'node ./test/fixtures/restart/stalled.js',
            matchReady: /started/i,
            silent: true,
            restartOnStalledOutput: {
                emptyOutputInterval: 1000
            }
        });
        shell.run();

        await wait(2000);
        await shell.kill();

        let content = await File.readAsync<string>(path);
        has_(content, `started\nstarted`);
    }
});


function wait (ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    })
}
