import { PsList } from '../src/ps/PsList'
import * as http from 'http'
import { Net } from '../src/ps/Net';

UTest({

    async 'should kill process' () {
        await PsList.kill(20976);
    },
    async 'should list process' () {
        let list = await PsList.getAll();
        let self = list.find(x => x.cmd.includes('atma'));
        if (self == null) {
            console.log('PsList', list);
        }
        notEq_(self, null, 'Self process not found');
    },
    async 'find pid by port' () {
        let x = await Net.findByPort('9001');
        console.log('findByPort', x);

        let server = http.createServer().listen();
        let port = (server.address() as any).port;

        let processes = await Net.findByPort(port);
        console.log('processes', processes);
        gt_(processes.length, 0, `No found by port ${port}`);
        eq_(processes[0].pid, process.pid);

        await new Promise(cb => server.close(cb));

        processes = await Net.findByPort(port);
        eq_(processes.length, 0, `Found by port ${port} after server closed`);
    }
})
