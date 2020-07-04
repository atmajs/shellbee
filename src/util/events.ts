import { class_EventEmitter } from 'atma-utils';

export function events_someOnce (emitter: class_EventEmitter, events: { [event: string]: Function }) {

    let listeners = {};
    for (let event in events) {
        emitter.on(event, delegate(emitter, listeners, event, events[event]));
    }
}

function delegate (emitter: class_EventEmitter, listeners, event, cb) {
    function fn (...args) {

        for (let event in listeners) {
            emitter.off(event, listeners[event]);
        }

        cb?.(...args);
    }

    listeners[event] = fn;
    return fn;
}
