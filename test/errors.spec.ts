import { Shell } from '../src/Shell';

UTest({
    async 'should error on syntax exception' () {
        let shell = await Shell.run({
            command: 'node test/fixtures/errors/simple.js',
            silent: true,
        });

        eq_(shell.errors.length, 1);
        has_(shell.errors[0].error.toString(), 'foo is not defined');
    },
    async 'should error on syntax exception in timer' () {
        let shell = await Shell.run({
            command: 'node test/fixtures/errors/timer.js',
            silent: true,
        });

        eq_(shell.errors.length, 1);
        has_(shell.errors[0].error.toString(), 'qux is not defined');
    },
    async 'should error on unhandled reject' () {
        let shell = await Shell.run({
            command: 'node test/fixtures/errors/reject.js',
            silent: true,
        });
        eq_(shell.errors.length, 1);
        has_(shell.errors[0].error.toString(), 'ERR_UNHANDLED_REJECTION');
    },
    async 'should error if no script found' () {
        let shell = await Shell.run({
            command: 'node test/fixtures/errors/no.js',
            silent: true,
        });

        eq_(shell.errors.length, 1);
        has_(shell.errors[0].error.toString(), 'MODULE_NOT_FOUND');
    },
    async 'should run action' () {
        let shell = await Shell.run({
            command: './node_modules/.bin/atma act test/fixtures/errors/actions.act.ts',
            silent: true,
        });
        eq_(shell.errors.length, 1);
        has_(shell.errors[0].error.toString(), 'Exit code: 1');
    },

    async '//long runner' () {
        let shell = await Shell.run({
            command: 'node test/fixtures/errors/long.js',
            silent: true,
        });

        eq_(shell.errors.length, 1);
        has_(shell.errors[0].error.toString(), 'MODULE_NOT_FOUND');
    }
})
