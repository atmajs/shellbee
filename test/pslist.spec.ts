import { PsList } from '../src/ps/PsList'

UTest({

    async 'should kill process' () {
        await PsList.kill(20976);
    },
    async 'should list process' () {
        let list = await PsList.read();
        let self = list.find(x => x.cmd.includes('atma'));
        notEq_(self, null, 'Self process not found');
    },
})
