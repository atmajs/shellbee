import { Shell } from '../src/Shell';

UTest({
    async 'should fire events' () {
        let p = new Shell({
            command: 'node test/fixtures/logs'
        });

        p
            .on('process_start', assert.await())
            .on('process_stdout', assert.await(data => {
                eq_(data.buffer, 'foo stdout');
            }))
            .on('process_stderr', assert.await(data => {
                eq_(data.buffer, 'bar stderr');
            }))
            .on('process_exit', assert.await());

        let result = await p.run();

        deepEq_(result.std, ['foo stdout', 'bar stderr']);
        deepEq_(result.stdout, ['foo stdout']);
        deepEq_(result.stderr, ['bar stderr']);

        eq_(result.results.length, 1);

        deepEq_(result.results[0].std, ['foo stdout', 'bar stderr']);
        deepEq_(result.results[0].stdout, ['foo stdout']);
        deepEq_(result.results[0].stderr, ['bar stderr']);
    },
    async 'should get thrown error' () {
        let p = new Shell({
            command: 'node test/fixtures/error',
            silent: true
        });

        p
            .on('process_start', assert.await())
            .on('process_exit', assert.await(exit => {
                eq_(exit.code, 1);
            }));

        let result = await p.run();

        eq_(result.stderr.length, 1);
        has_(result.stderr[0], 'Some Error');
    },
    async 'should throw on failed command' () {
        let p = new Shell({
            command: 'foobar',
            silent: true
        });
        p
            .on('process_start', assert.await('start'))
            .on('process_exit', assert.await('exit', exit => {
                eq_(exit.code, 1);
            }));

        let result = await p.run();
        has_(result.stderr[0], 'foobar');
    }
})
