import { Shell } from '../src/Shell';


UTest({
    async 'should fork an echo process' () {
        let shell = new Shell({
            command: 'test/fixtures/fork.js',
            fork: true
        });

        shell.run();
        let result = await shell.channel.call('echo', 'bar');
        eq_(result, 'echo:bar');
    },
    async 'should fail to fork' (done) {
        let shell = new Shell({
            command: 'test/fixtures/forks.js',
            silent: true,
            fork: true
        });

        shell.onExit(<any> assert.await(async data => {
            eq_(data.code, 1);
        }));
        shell.run();

        try {
            await shell.channel.call('echo', 'bar');
            eq_(true, false);
        } catch (error) {
            has_(error.message, 'Cannot find module');
        }
    },
    async 'forked script throws exception' (done) {
        let shell = new Shell({
            command: 'test/fixtures/fork.js',
            silent: true,
            fork: true
        });

        shell.run();
        let cb = assert.await();
        try {
            let result = await shell.channel.call('exception');
            eq_(true, false);
        } catch (error) {
            cb();
            has_(error.message, 'willThrow is not defined');
            shell.kill();
        }
    },
    async 'down after errored exit' () {
        let shell = new Shell({
            command: 'test/fixtures/fork.js',
            silent: true,
            fork: true
        });

        shell.run();
        let cb = assert.await();
        try {
            await shell.channel.call('exit-error');
            eq_(true, false);
        } catch (error) {
            cb();
            has_(error.message, 'Exit code: 1');
        }

        try {
            await shell.channel.call('echo', 'g');
            eq_(true, false);
        } catch (error) {
            cb();
            has_(error.message, 'Channel closed');
        }
    },
    async 'up after errored exit' () {
        let shell = new Shell({
            command: 'test/fixtures/fork.js',
            silent: true,
            fork: true,
            restartOnErrorExit: true,
        });

        shell.run();
        let cb = assert.await();
        try {
            await shell.channel.call('exit-error');
            eq_(true, false);
        } catch (error) {
            cb();
            has_(error.message, 'Exit code: 1');
        }

        
        let result = await shell.channel.call('echo', 'g');
        eq_(result, 'echo:g');
    }
})