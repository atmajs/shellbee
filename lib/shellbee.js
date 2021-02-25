
// source ./RootModule.js
(function(){
	
	var _src_CommunicationChannel = {};
var _src_Shell = {};
var _src_ValueExtractor = {};
var _src_util_command = {};
var _src_util_events = {};
var _src_util_path = {};
var _src_util_serialize = {};

// source ./ModuleSimplified.js
var _src_util_path;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var atma_utils_1 = require("atma-utils");
function path_ensure(cwd, base) {
    if (new atma_utils_1.class_Uri(cwd).isRelative()) {
        var x = require('path').normalize(atma_utils_1.class_Uri.combine(base, cwd));
        return x;
    }
    return cwd;
}
exports.path_ensure = path_ensure;
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_util_path) && isObject(module.exports)) {
		Object.assign(_src_util_path, module.exports);
		return;
	}
	_src_util_path = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_util_command;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = _src_util_path;
function command_parseAll(commands, $params) {
    var _a;
    var cwdAll = (_a = $params.cwd) !== null && _a !== void 0 ? _a : process.cwd();
    cwdAll = path_1.path_ensure(cwdAll, process.cwd());
    return commands.reduce(function (out, command, index) {
        // var detached = detachedAll || false,
        //     //cwd = cwdAll || process.cwd(),
        //     matchReady = rgxReadyAll,
        //     extract = null;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var opts = typeof command === 'string' ? { exec: command } : command;
        if (opts.cwd) {
            opts.cwd = path_1.path_ensure(opts.cwd, cwdAll !== null && cwdAll !== void 0 ? cwdAll : process.cwd());
        }
        // if (typeof command === 'string') {
        //     exec = command;
        // }
        // else if (command != null) {
        //     var obj = command;
        //     exec = obj.command;
        //     if (obj.cwd) {
        //     }
        //     if (obj.detached) {
        //         detached = obj.detached;
        //     }
        //     if (obj.matchReady) {
        //         matchReady = obj.matchReady;
        //     }
        //     if (obj.extract) {
        //         extract = obj.extract;
        //     }
        //     if ('fork' in obj) {
        //         fork = obj.fork;
        //     }
        // }
        var exec = opts.exec;
        if (exec == null || exec === '') {
            console.warn('Command Object is not valid. Should be at least {command: string}');
            return out;
        }
        var args = command_parse(exec);
        out.push({
            exec: args.shift(),
            args: args,
            cwd: (_b = (_a = opts.cwd) !== null && _a !== void 0 ? _a : cwdAll) !== null && _b !== void 0 ? _b : process.cwd(),
            //stdio: 'pipe',
            detached: (_d = (_c = opts.detached) !== null && _c !== void 0 ? _c : $params.detached) !== null && _d !== void 0 ? _d : false,
            command: exec,
            matchReady: (_e = opts.matchReady) !== null && _e !== void 0 ? _e : $params.matchReady,
            extract: opts.extract,
            fork: (_g = (_f = opts.fork) !== null && _f !== void 0 ? _f : $params.fork) !== null && _g !== void 0 ? _g : false,
            ipc: (_j = (_h = opts.ipc) !== null && _h !== void 0 ? _h : $params.ipc) !== null && _j !== void 0 ? _j : false,
        });
        return out;
    }, []);
}
exports.command_parseAll = command_parseAll;
function command_parse(command) {
    var parts = command.trim().split(/\s+/);
    var imax = parts.length, i = -1, c, arg;
    while (++i < imax) {
        arg = parts[i];
        if (arg.length === 0)
            continue;
        c = arg[0];
        if (c !== '"' && c !== "'")
            continue;
        var start = i;
        for (; i < imax; i++) {
            arg = parts[i];
            if (arg[arg.length - 1] === c) {
                var str = parts
                    .splice(start, i - start + 1)
                    .join(' ')
                    .slice(1, -1);
                parts.splice(start, 0, str);
                imax = parts.length;
                break;
            }
        }
    }
    return parts;
}
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_util_command) && isObject(module.exports)) {
		Object.assign(_src_util_command, module.exports);
		return;
	}
	_src_util_command = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_ValueExtractor;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var atma_utils_1 = require("atma-utils");
var ValueExtractor = /** @class */ (function () {
    function ValueExtractor(target, extractors) {
        this.target = target;
        this.extractors = extractors;
        this.string = '';
        this.string = '';
    }
    ValueExtractor.prototype.write = function (buffer) {
        this.string += buffer.toString();
    };
    ValueExtractor.prototype.complete = function () {
        for (var key in this.extractors) {
            this.target[key] = atma_utils_1.is_Function(this.extractors[key])
                ? this.extractors[key](this.string)
                : null;
        }
    };
    ValueExtractor.extract = function (str, mix) {
        if (typeof mix === 'function') {
            return mix(str);
        }
    };
    ValueExtractor.interpolateAny = function (mix, values) {
        if (mix == null) {
            return;
        }
        if (typeof mix === 'string') {
            return ValueExtractor.interpolateStr(mix, values);
        }
        if (typeof mix.map === 'function') {
            return mix.map(function (str) {
                return ValueExtractor.interpolateAny(str, values);
            });
        }
        return mix;
    };
    ValueExtractor.interpolateStr = function (str, values) {
        return str.replace(/\{\{(\w+)\}\}/g, function (full, prop) {
            var val = values[prop];
            if (val == null) {
                console.warn('Extracted property expected: ', prop, values);
                return '';
            }
            return val;
        });
    };
    return ValueExtractor;
}());
exports.ValueExtractor = ValueExtractor;
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_ValueExtractor) && isObject(module.exports)) {
		Object.assign(_src_ValueExtractor, module.exports);
		return;
	}
	_src_ValueExtractor = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_util_serialize;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function serialize_error(err) {
    var _a;
    return {
        message: (_a = err.message) !== null && _a !== void 0 ? _a : String(err),
        stack: err.stack
    };
}
exports.serialize_error = serialize_error;
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_util_serialize) && isObject(module.exports)) {
		Object.assign(_src_util_serialize, module.exports);
		return;
	}
	_src_util_serialize = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_CommunicationChannel;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var atma_utils_1 = require("atma-utils");
var serialize_1 = _src_util_serialize;
var CommunicationChannel = /** @class */ (function () {
    function CommunicationChannel(child, timeoutMs) {
        var _this = this;
        this.child = child;
        this.timeoutMs = timeoutMs;
        this.awaiters = Object.create(null);
        child.on('message', function (resp) {
            if (resp.id == null || resp.id in _this.awaiters === false) {
                return;
            }
            var awaiter = _this.awaiters[resp.id];
            delete _this.awaiters[resp.id];
            if (resp.error) {
                awaiter.promise.reject(resp.error);
                return;
            }
            awaiter.promise.resolve(resp.data);
        });
    }
    CommunicationChannel.ipc = function (handlers) {
        process.on('message', function (message) {
            var id = message.id, method = message.method, args = message.args;
            var handler = atma_utils_1.obj_getProperty(handlers, method);
            if (typeof handler !== 'function') {
                process.send({
                    id: id,
                    error: serialize_1.serialize_error(new Error(method + " not defined"))
                });
                return;
            }
            try {
                var result = handler.apply(null, args);
                if (result == null) {
                    process.send({
                        id: id,
                        data: null
                    });
                    return;
                }
                if (typeof result.then === 'function') {
                    result.then(function (data) {
                        process.send({
                            id: id,
                            data: data
                        });
                    }, function (error) {
                        process.send({
                            id: id,
                            error: serialize_1.serialize_error(error),
                        });
                    });
                    return;
                }
                process.send({
                    id: id,
                    data: result
                });
            }
            catch (error) {
                process.send({
                    id: id,
                    error: serialize_1.serialize_error(error),
                });
                return;
            }
        });
        setTimeout(function () { return console.log('IPC Listening'); }, 10);
    };
    CommunicationChannel.prototype.call = function (method) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var promise = new atma_utils_1.class_Dfr;
        var id = (Math.round(Math.random() * Math.pow(10, 10))) + '' + Date.now();
        this.awaiters[id] = {
            timestamp: Date.now(),
            promise: promise
        };
        this.child.send({
            id: id,
            method: method,
            args: args
        });
        if (this.timeoutMs) {
            setTimeout(function () { return _this.checkTimeout(); }, this.timeoutMs);
        }
        return promise;
    };
    CommunicationChannel.prototype.checkTimeout = function () {
        var _this = this;
        var now = Date.now();
        var keys = [];
        for (var key in this.awaiters) {
            var bin = this.awaiters[key];
            var ms = now - bin.timestamp;
            if (ms >= this.timeoutMs) {
                try {
                    bin.promise.reject(new Error('Timeouted'));
                }
                catch (error) { }
                keys.push(key);
            }
        }
        keys.forEach(function (key) { return delete _this.awaiters[key]; });
    };
    CommunicationChannel.prototype.onError = function (error) {
        var obj = Object.create(this.awaiters);
        this.awaiters = {};
        for (var key in obj) {
            var bin = obj[key];
            try {
                bin.promise.reject(error);
            }
            catch (error) { }
        }
    };
    CommunicationChannel.prototype.onStdError = function (str) {
        this.onError(new Error(str));
    };
    return CommunicationChannel;
}());
exports.CommunicationChannel = CommunicationChannel;
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_CommunicationChannel) && isObject(module.exports)) {
		Object.assign(_src_CommunicationChannel, module.exports);
		return;
	}
	_src_CommunicationChannel = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_util_events;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function events_someOnce(emitter, events) {
    var listeners = {};
    for (var event in events) {
        emitter.on(event, delegate(emitter, listeners, event, events[event]));
    }
}
exports.events_someOnce = events_someOnce;
function delegate(emitter, listeners, event, cb) {
    function fn() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        for (var event_1 in listeners) {
            emitter.off(event_1, listeners[event_1]);
        }
        cb === null || cb === void 0 ? void 0 : cb.apply(void 0, args);
    }
    listeners[event] = fn;
    return fn;
}
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_util_events) && isObject(module.exports)) {
		Object.assign(_src_util_events, module.exports);
		return;
	}
	_src_util_events = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Shell;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var atma_utils_1 = require("atma-utils");
var atma_io_1 = require("atma-io");
var child_process = require("child_process");
var command_1 = _src_util_command;
var ValueExtractor_1 = _src_ValueExtractor;
var CommunicationChannel_1 = _src_CommunicationChannel;
var events_1 = _src_util_events;
var Shell = /** @class */ (function (_super) {
    __extends(Shell, _super);
    function Shell(params) {
        var _a, _b, _c;
        var _this = _super.call(this) || this;
        _this.params = params;
        _this.children = [];
        _this.errors = [];
        _this.lastCode = 0;
        _this.results = [];
        _this.extracted = {};
        _this.state = ShellState.Initial;
        _this.promise = new atma_utils_1.class_Dfr();
        _this.std = [];
        _this.stderr = [];
        _this.stdout = [];
        _this.isBusy = false;
        _this.isReady = false;
        _this.restartOnErrorExit = false;
        var command = (_a = params.command) !== null && _a !== void 0 ? _a : params.commands;
        _this.silent = params.silent;
        _this.parallel = (_b = params.parallel) !== null && _b !== void 0 ? _b : false;
        _this.restartOnErrorExit = (_c = params.restartOnErrorExit) !== null && _c !== void 0 ? _c : false;
        var commands = Array.isArray(command)
            ? command
            : [command];
        _this.commands = command_1.command_parseAll(commands, params);
        _this.on('process_start', function () {
            _this.state = ShellState.Started;
        });
        return _this;
    }
    Shell.run = function (params) {
        return new Shell(params).run();
    };
    Shell.prototype.run = function () {
        if (this.isBusy === false) {
            this.next();
            return this.promise;
        }
        return this.promise;
    };
    Shell.prototype.onStart = function (cb) {
        return this.on('process_start', cb);
    };
    Shell.prototype.onStdout = function (cb) {
        return this.on('process_stdout', cb);
    };
    Shell.prototype.onStderr = function (cb) {
        return this.on('process_stderr', cb);
    };
    Shell.prototype.onExit = function (cb) {
        return this.on('process_exit', cb);
    };
    /** When rgxReady is specified the event will be called */
    Shell.prototype.onReady = function (cb) {
        var _a, _b, _c, _d, _e;
        if (!((_a = this.currentOptions) === null || _a === void 0 ? void 0 : _a.matchReady) && this.commands.some(function (x) { return x.matchReady; }) === false) {
            console.error('Ready Matcher Regex is not defined', (_c = (_b = this.currentOptions) === null || _b === void 0 ? void 0 : _b.command) !== null && _c !== void 0 ? _c : (_e = (_d = this.commands) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.command);
        }
        return this.on('process_ready', cb);
    };
    Shell.prototype.onComplete = function (cb) {
        var _this = this;
        this.promise.always(function () { return cb(_this); });
        return this;
    };
    Shell.prototype.kill = function (signal) {
        var _this = this;
        if (signal === void 0) { signal = 'SIGINT'; }
        return new Promise(function (resolve) {
            var child = _this.children.pop();
            if (child == null) {
                return resolve(null);
            }
            _this.once('process_exit', resolve);
            child.kill(signal);
        });
    };
    Shell.prototype.send = function (method) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            _this.waitForChannel().then(function (channel) {
                channel.call.apply(channel, __spreadArrays([method], args)).then(resolve, reject);
            }, reject);
        });
    };
    Shell.prototype.waitForChannel = function () {
        var _this = this;
        if (this.currentOptions.ipc && this.isReady === false) {
            return new Promise(function (resolve, reject) {
                events_1.events_someOnce(_this, {
                    'process_ready': function () {
                        _this.waitForChannel().then(resolve, reject);
                    },
                    'exit': function () {
                        reject('Process exited');
                    }
                });
            });
        }
        return new Promise(function (resolve, reject) {
            if (_this.channel) {
                resolve(_this.channel);
                return;
            }
            events_1.events_someOnce(_this, {
                'channel_created': function () {
                    resolve(_this.channel);
                },
                'exit': function () {
                    reject('Process exited');
                }
            });
        });
    };
    Shell.prototype.next = function () {
        var _this = this;
        var _a;
        if (this.isBusy === false) {
            this.start = new Date();
            this.isBusy = true;
            this.isReady = false;
        }
        if (this.channel) {
            this.emit('channel_closed', {
                channel: this.channel
            });
            if (this.commands.length !== 0 || (this.lastCode === 1 && this.restartOnErrorExit)) {
                this.channel = null;
            }
        }
        if (this.lastCode === 1 && this.restartOnErrorExit) {
            this.lastCode = 0;
            this.commands.push(this.currentOptions);
            this.next();
            return this.promise;
        }
        if (this.commands.length === 0) {
            if (this.state !== ShellState.Empty) {
                this.state = ShellState.Empty;
                this.end = new Date();
                this.isBusy = false;
                var promise = this.promise;
                // Always resolve the promise, consumer should check for errors
                //if (this.errors.length === 0) {
                promise.resolve(this);
                // } else {
                //     let str = this.errors.map(error => {
                //         return `Command ${error.command} failed: ${error.error.message}`
                //     }).join('\n');
                //     promise.reject(new Error(str));
                // }
            }
            return this.promise;
        }
        var child = null;
        var options = this.commands.shift();
        var command = ValueExtractor_1.ValueExtractor.interpolateAny(options.command, this.extracted);
        var rgxReady = options.matchReady;
        var detached = options.detached === true;
        var silent = this.silent;
        var stdio = detached ? (void 0) : 'pipe';
        var extractor = options.extract ? new ValueExtractor_1.ValueExtractor(this.extracted, options.extract) : null;
        var result = new ProcessResult(options);
        this.results.push(result);
        this.currentOptions = options;
        if (!options.fork && global.process.platform === 'win32') {
            if (options.exec !== 'cmd') {
                options.args.unshift('/C', options.exec);
                options.exec = 'cmd';
            }
        }
        if (rgxReady == null && options.ipc) {
            rgxReady = /IPC Listening/i;
        }
        this.isReady = rgxReady == null;
        try {
            var cwd = options.cwd;
            if (cwd != null) {
                var hasFileProtocol = cwd.startsWith('file:');
                var cwdUri = hasFileProtocol ? cwd : 'file://' + cwd;
                if (atma_io_1.Directory.exists(cwdUri + '/') === false) {
                    throw Error('CWD Directory not exists: ' + cwd);
                }
                if (hasFileProtocol) {
                    cwd = new atma_utils_1.class_Uri(cwd).toLocalDir();
                }
            }
            if (cwd == null) {
                cwd = process.cwd();
            }
            var exec = ValueExtractor_1.ValueExtractor.interpolateAny(options.exec, this.extracted);
            var args = ValueExtractor_1.ValueExtractor.interpolateAny(options.args, this.extracted);
            var method = options.fork ? 'fork' : 'spawn';
            if (this.params.verbose) {
                this.print(method + ": " + exec + " " + args.join(''));
            }
            child = child_process[options.fork ? 'fork' : 'spawn'](exec, args, {
                cwd: options.cwd || process.cwd(),
                env: process.env,
                stdio: stdio,
                detached: detached
            });
            if (options.fork) {
                this.channel = new CommunicationChannel_1.CommunicationChannel(child, (_a = this.params.timeoutMs) !== null && _a !== void 0 ? _a : 10000);
                this.emit('channel_created', {
                    channel: this.channel
                });
            }
            this.children.push(child);
        }
        catch (error) {
            if (this.params.verbose) {
                this.print('on start exception:', error);
            }
            result.error = error;
            this.errors.push({
                command: command,
                error: error
            });
            this.emit('process_exception', {
                command: command,
                error: error
            });
            return this.next();
        }
        child.on('error', function (error) {
            var _a;
            if (_this.params.verbose) {
                _this.print('on error:', error);
            }
            (_a = _this.channel) === null || _a === void 0 ? void 0 : _a.onError(error);
        });
        child.on('exit', function (code) {
            var _a;
            if (_this.params.verbose) {
                _this.print('on exit:', code);
            }
            result.resultCode = code;
            _this.emit('process_exit', {
                command: command,
                code: code,
                result: result
            });
            _this.lastCode = code;
            if (code > 0) {
                var msg = result.stderr.slice(-20).join('');
                var err = new Error("Exit code: " + code + ". " + (msg !== null && msg !== void 0 ? msg : ''));
                _this.errors.push({
                    command: command,
                    error: err
                });
                (_a = _this.channel) === null || _a === void 0 ? void 0 : _a.onError(err);
            }
            extractor === null || extractor === void 0 ? void 0 : extractor.complete();
            _this.next();
        });
        child.stdout.on('data', function (buffer) {
            if (detached !== true && silent !== true) {
                process.stdout.write(buffer);
            }
            if (rgxReady != null && rgxReady.test(buffer.toString())) {
                rgxReady = null;
                _this.isReady = true;
                _this.emit('process_ready', {
                    command: command
                });
            }
            if (extractor != null) {
                extractor.write(buffer);
            }
            var str = String(buffer);
            result.stdout.push(str);
            result.std.push(str);
            _this.stdout.push(str);
            _this.std.push(str);
            _this.emit('process_stdout', {
                command: command,
                buffer: buffer
            });
        });
        child.stderr.on('data', function (buffer) {
            var _a;
            if (detached !== true && silent !== true) {
                process.stderr.write(buffer);
            }
            var str = String(buffer);
            result.stderr.push(str);
            result.std.push(str);
            _this.stderr.push(str);
            _this.std.push(str);
            _this.emit('process_stderr', {
                command: command,
                buffer: buffer
            });
            if (str.includes('UnhandledPromiseRejectionWarning')) {
                (_a = _this.channel) === null || _a === void 0 ? void 0 : _a.onStdError(str);
            }
        });
        this.emit('process_start', {
            command: command
        });
        if (this.parallel !== false) {
            this.next();
        }
        if (rgxReady == null) {
            setTimeout(function () {
                _this.emit('process_ready', {
                    command: command
                });
            }, 200);
        }
        return this.promise;
    };
    Shell.prototype.print = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log('Shellbee: ' + args.join(' '));
    };
    Shell.ipc = CommunicationChannel_1.CommunicationChannel.ipc;
    return Shell;
}(atma_utils_1.class_EventEmitter));
exports.Shell = Shell;
;
var ProcessResult = /** @class */ (function () {
    function ProcessResult(options) {
        this.options = options;
        this.std = [];
        this.stdout = [];
        this.stderr = [];
        this.resultCode = null;
        this.error = null;
    }
    return ProcessResult;
}());
exports.ProcessResult = ProcessResult;
var ShellState;
(function (ShellState) {
    ShellState[ShellState["Empty"] = -1] = "Empty";
    ShellState[ShellState["Initial"] = 0] = "Initial";
    ShellState[ShellState["Started"] = 1] = "Started";
})(ShellState || (ShellState = {}));
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_Shell) && isObject(module.exports)) {
		Object.assign(_src_Shell, module.exports);
		return;
	}
	_src_Shell = module.exports;
}());
// end:source ./ModuleSimplified.js

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Shell_1 = _src_Shell;
exports.Shell = Shell_1.Shell;


}());
// end:source ./RootModule.js
