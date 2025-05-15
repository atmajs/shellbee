import { command_parseAll } from '../src/util/command'

UTest({
    'should parse command' () {
        let x = command_parseAll([ 'node foo --bar b --name "Lorem Ipsum"' ], {});

        eq_(x.length, 1);
        let command = x[0];

        eq_(command.exec, 'node');
        deepEq_(command.args, [ 'foo', '--bar', 'b', '--name', 'Lorem Ipsum']);
    },
    'should parse with whitespace' () {
        let x = command_parseAll([ '"c:/foo bar/qux.exec" "foo bar" "--name"' ], {});

        eq_(x.length, 1);
        let command = x[0];

        eq_(command.exec.replace(/\\/g, '/'), 'c:/foo bar/qux.exec');
        deepEq_(command.args, [ 'foo bar', '--name']);
    },
})
