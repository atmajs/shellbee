import { ChildProcess } from 'child_process';
import { class_Dfr } from 'atma-utils';

export class CommunicationChannel {

    awaiters: { [id: string]: { promise, timestamp } } = Object.create(null)

    constructor (public child: ChildProcess, private timeoutMs: number) {

        child.on('message', (resp: { id, data?, error? }) => {
            if (resp.id == null || resp.id in this.awaiters === false) {
                return;
            }
            let awaiter = this.awaiters[resp.id];
            delete this.awaiters[resp.id];
            if (resp.error) {
                awaiter.promise.reject(resp.error);
                return;
            }
            awaiter.promise.resolve(resp.data);
        });
    }

    call<T = any>(method: string, ...args): Promise<T> {
        let promise = new class_Dfr;
        let id = (Math.round(Math.random() * 10 ** 10)) + '' + Date.now();
        this.awaiters[id] = {
            timestamp: Date.now(),
            promise
        };
       
        this.child.send({
            id,
            method,
            args
        });
        if (this.timeoutMs) {
            setTimeout(() => this.checkTimeout(), this.timeoutMs);
        }
        return promise as any;
    }

    checkTimeout () {
        let now = Date.now();
        let keys = [];
        for (let key in this.awaiters) {
            let bin = this.awaiters[key];
            let ms = now - bin.timestamp;
            if (ms >= this.timeoutMs) {
                try {
                    bin.promise.reject(new Error('Timeouted'));
                } catch (error) { }
                keys.push(key);
            }
        }
        keys.forEach(key => delete this.awaiters[key]);
    }

    onError (error) {
        let obj = Object.create(this.awaiters);
        this.awaiters = {};

        for (let key in obj) {
            let bin = obj[key];
            try {
                bin.promise.reject(error);
            } catch (error) { }
        }
    }
    onStdError (str: string) {
        this.onError(new Error(str));
    }
}