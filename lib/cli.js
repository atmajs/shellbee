
// source ./RootModule.js
(function(){
	
	var _src_CommunicationChannel = {};
var _src_Shell = {};
var _src_ValueExtractor = {};
var _src_runner_Commands = {};
var _src_runner_Runner = {};
var _src_util_CommandUtil = {};
var _src_util_ShellErrorExitsHandler = {};
var _src_util_ShellParamsUtil = {};
var _src_util_ShellWrapperUtil = {};
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
exports.path_ensure = void 0;
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
var _src_util_ShellWrapperUtil;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellWrapperUtil = void 0;
var COMMAND_PLACEHOLDER = '%COMMAND%';
var ShellWrapperUtil;
(function (ShellWrapperUtil) {
    function prefix(args, config) {
        if (!(config === null || config === void 0 ? void 0 : config.shell)) {
            return args;
        }
        if (Array.isArray(config.shell) === false) {
            throw new Error("We can prefix only array of strings(argumnets)");
            return;
        }
        var _a = config.shell, exec = _a[0], rest = _a.slice(1);
        return __spreadArray(__spreadArray([exec], rest, true), args, true);
    }
    ShellWrapperUtil.prefix = prefix;
    function wrap(command, config) {
        if (!(config === null || config === void 0 ? void 0 : config.shell)) {
            return command;
        }
        if (typeof config.shell !== 'string') {
            throw new Error("We can wrap only as command template");
            return;
        }
        if (command.includes('"') === false) {
            command = "\"" + command + "\"";
        }
        else if (command.includes("'") === false) {
            command = "'" + command + "'";
        }
        else {
            throw new Error("Command can't be quoted, as both already present");
        }
        return config.shell.replace(COMMAND_PLACEHOLDER, command);
    }
    ShellWrapperUtil.wrap = wrap;
    // [cmd, /c, ...command]
    function isPrefix(shell) {
        return shell != null && Array.isArray(shell);
    }
    ShellWrapperUtil.isPrefix = isPrefix;
    // bash.exe -c %COMMAND%
    function isWrapper(shell) {
        return shell != null && typeof shell === 'string' && shell.includes(COMMAND_PLACEHOLDER);
    }
    ShellWrapperUtil.isWrapper = isWrapper;
})(ShellWrapperUtil = exports.ShellWrapperUtil || (exports.ShellWrapperUtil = {}));
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_util_ShellWrapperUtil) && isObject(module.exports)) {
		Object.assign(_src_util_ShellWrapperUtil, module.exports);
		return;
	}
	_src_util_ShellWrapperUtil = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_util_command;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command_parseAll = void 0;
var path_1 = _src_util_path;
var ShellWrapperUtil_1 = _src_util_ShellWrapperUtil;
function command_parseAll(commands, params) {
    var _a;
    var cwdAll = (_a = params.cwd) !== null && _a !== void 0 ? _a : process.cwd();
    cwdAll = (0, path_1.path_ensure)(cwdAll, process.cwd());
    return commands.map(function (command) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        var opts = typeof command === 'string' ? {
            exec: command
        } : command;
        if (opts.cwd) {
            opts.cwd = (0, path_1.path_ensure)(opts.cwd, cwdAll !== null && cwdAll !== void 0 ? cwdAll : process.cwd());
        }
        var exec = opts.exec;
        if (exec == null || exec === '') {
            console.warn('Command Object is not valid. Should be at least {command: string}');
            return null;
        }
        var args = command_parse(exec, params);
        return {
            exec: args.shift(),
            args: args,
            cwd: (_b = (_a = opts.cwd) !== null && _a !== void 0 ? _a : cwdAll) !== null && _b !== void 0 ? _b : process.cwd(),
            //stdio: 'pipe',
            detached: (_d = (_c = opts.detached) !== null && _c !== void 0 ? _c : params.detached) !== null && _d !== void 0 ? _d : false,
            command: exec,
            matchReady: (_e = opts.matchReady) !== null && _e !== void 0 ? _e : params.matchReady,
            extract: opts.extract,
            fork: (_g = (_f = opts.fork) !== null && _f !== void 0 ? _f : params.fork) !== null && _g !== void 0 ? _g : false,
            ipc: (_j = (_h = opts.ipc) !== null && _h !== void 0 ? _h : params.ipc) !== null && _j !== void 0 ? _j : false,
        };
    }).filter(function (x) { return x != null; });
}
exports.command_parseAll = command_parseAll;
function command_parse(command, params) {
    if (ShellWrapperUtil_1.ShellWrapperUtil.isWrapper(params.shell)) {
        command = ShellWrapperUtil_1.ShellWrapperUtil.wrap(command, params);
    }
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
    // On windows normalize executable command path to backward slashes
    if (global.process.platform === 'win32') {
        parts[0] = parts[0].replace(/\//g, '\\');
    }
    if (ShellWrapperUtil_1.ShellWrapperUtil.isPrefix(params.shell)) {
        parts = ShellWrapperUtil_1.ShellWrapperUtil.prefix(parts, params);
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
exports.ValueExtractor = void 0;
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
            this.target[key] = (0, atma_utils_1.is_Function)(this.extractors[key])
                ? this.extractors[key](this.string)
                : null;
        }
    };
    ValueExtractor.extract = function (str, mix) {
        if (typeof mix === 'function') {
            return mix(str);
        }
    };
    ValueExtractor.interpolateAny = function (mix, values, options) {
        if (mix == null || (options === null || options === void 0 ? void 0 : options.interpolate) === false) {
            return mix;
        }
        if (typeof mix === 'string') {
            return ValueExtractor.interpolateStr(mix, values);
        }
        if (typeof mix.map === 'function') {
            // isArrayLike
            return mix.map(function (str) {
                return ValueExtractor.interpolateAny(str, values, options);
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
exports.serialize_error = void 0;
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
exports.CommunicationChannel = void 0;
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
            var handler = (0, atma_utils_1.obj_getProperty)(handlers, method);
            if (typeof handler !== 'function') {
                process.send({
                    id: id,
                    error: (0, serialize_1.serialize_error)(new Error(method + " not defined"))
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
                            error: (0, serialize_1.serialize_error)(error),
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
                    error: (0, serialize_1.serialize_error)(error),
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
exports.events_someOnce = void 0;
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
var _src_util_ShellParamsUtil;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellParamsUtil = void 0;
var ShellParamsUtil;
(function (ShellParamsUtil) {
    function normalize(params) {
        var _a, _b;
        if (params.shell == null) {
            params.shell = DEFAULT.shell;
        }
        if (params.command != null) {
            params.commands = [params.command];
        }
        if (params.commands == null) {
            throw new Error("shellbee: Command(s) are not defined");
        }
        (_a = params.parallel) !== null && _a !== void 0 ? _a : (params.parallel = false);
        (_b = params.restartOnErrorExit) !== null && _b !== void 0 ? _b : (params.restartOnErrorExit = false);
        return params;
    }
    ShellParamsUtil.normalize = normalize;
})(ShellParamsUtil = exports.ShellParamsUtil || (exports.ShellParamsUtil = {}));
var DEFAULT = {
    shell: global.process.platform === 'win32'
        ? ['cmd.exe', '/C']
        : null
};
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_util_ShellParamsUtil) && isObject(module.exports)) {
		Object.assign(_src_util_ShellParamsUtil, module.exports);
		return;
	}
	_src_util_ShellParamsUtil = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_util_ShellErrorExitsHandler;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellErrorExitsHandler = void 0;
var ShellErrorExitsHandler = /** @class */ (function () {
    function ShellErrorExitsHandler(params) {
        var _a, _b, _c;
        this._active = false;
        this.options = {
            delayMs: 200,
            maxRestartCount: 10,
            maxRestartTimespanMs: 30 * 1000,
        };
        this._params = params;
        this._errors = [];
        this._active = params.restartOnErrorExit != null && params.restartOnErrorExit !== false;
        if (typeof params.restartOnErrorExit !== 'boolean') {
            var opts = params.restartOnErrorExit;
            this.options.delayMs = (_a = opts.delayMs) !== null && _a !== void 0 ? _a : this.options.delayMs;
            this.options.maxRestartCount = (_b = opts.maxRestartCount) !== null && _b !== void 0 ? _b : this.options.maxRestartCount;
            this.options.maxRestartTimespanMs = (_c = opts.maxRestartTimespanMs) !== null && _c !== void 0 ? _c : this.options.maxRestartTimespanMs;
        }
    }
    ShellErrorExitsHandler.prototype.delay = function (cb) {
        this._errors.push({ time: Date.now() });
        setTimeout(function () { return cb(); }, this.options.delayMs);
    };
    ShellErrorExitsHandler.prototype.isActive = function () {
        if (this._active !== true) {
            return false;
        }
        var fromTimePoint = Date.now() - this.options.maxRestartTimespanMs;
        var errors = this._errors.filter(function (x) { return x.time > fromTimePoint; });
        if (errors.length < this.options.maxRestartCount) {
            return true;
        }
        return false;
    };
    return ShellErrorExitsHandler;
}());
exports.ShellErrorExitsHandler = ShellErrorExitsHandler;
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_util_ShellErrorExitsHandler) && isObject(module.exports)) {
		Object.assign(_src_util_ShellErrorExitsHandler, module.exports);
		return;
	}
	_src_util_ShellErrorExitsHandler = module.exports;
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
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessResult = exports.Shell = void 0;
var atma_utils_1 = require("atma-utils");
var atma_io_1 = require("atma-io");
var child_process = require("child_process");
var command_1 = _src_util_command;
var ValueExtractor_1 = _src_ValueExtractor;
var CommunicationChannel_1 = _src_CommunicationChannel;
var events_1 = _src_util_events;
var treeKill = require("tree-kill");
var ShellParamsUtil_1 = _src_util_ShellParamsUtil;
var ShellErrorExitsHandler_1 = _src_util_ShellErrorExitsHandler;
var Shell = /** @class */ (function (_super) {
    __extends(Shell, _super);
    function Shell(params) {
        var _this = _super.call(this) || this;
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
        _this.params = ShellParamsUtil_1.ShellParamsUtil.normalize(params);
        _this.errorsHandler = new ShellErrorExitsHandler_1.ShellErrorExitsHandler(_this.params);
        _this.commands = (0, command_1.command_parseAll)(params.commands, params);
        _this.on('process_start', function () {
            _this.state = ShellState.Started;
        });
        return _this;
    }
    Shell.run = function (mix) {
        var params;
        if (typeof mix === 'string') {
            params = { command: mix };
        }
        else if (Array.isArray(mix)) {
            params = { commands: mix };
        }
        else {
            params = mix;
        }
        return new Shell(params).run();
    };
    /**
     * "Run" starts the command
     * @returns Promise, which is resolved after the executables are completed.
     */
    Shell.prototype.run = function () {
        if (this.isBusy === false) {
            this.next();
            return this.promise;
        }
        return this.promise;
    };
    Shell.factory = function (config) {
        return {
            run: function (mix) {
                var params;
                if (typeof mix === 'string') {
                    params = { command: mix };
                }
                else if (Array.isArray(mix)) {
                    params = { commands: mix };
                }
                else {
                    params = mix;
                }
                return Shell.run(__assign(__assign({}, config), params));
            }
        };
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
    Shell.prototype.onReadyAsync = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.onReady(resolve);
        });
    };
    Shell.prototype.onComplete = function (cb) {
        var _this = this;
        this.promise.always(function () { return cb(_this); });
        return this;
    };
    Shell.prototype.onCompleteAsync = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.onComplete(resolve);
        });
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
    /** Uses tree-kill to terminate the tree */
    Shell.prototype.terminate = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var child = _this.children.pop();
            if (child == null) {
                return resolve(null);
            }
            _this.once('process_exit', resolve);
            treeKill(child.pid);
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
                channel.call.apply(channel, __spreadArray([method], args, false)).then(resolve, reject);
            }, reject);
        });
    };
    Shell.prototype.waitForChannel = function () {
        var _this = this;
        if (this.currentOptions.ipc && this.isReady === false) {
            return new Promise(function (resolve, reject) {
                (0, events_1.events_someOnce)(_this, {
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
            (0, events_1.events_someOnce)(_this, {
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
            if (this.commands.length !== 0 || (this.lastCode === 1 && this.errorsHandler.isActive())) {
                this.channel = null;
            }
        }
        if (this.lastCode === 1 && this.errorsHandler.isActive()) {
            this.lastCode = 0;
            this.commands.push(this.currentOptions);
            this.errorsHandler.delay(function () {
                _this.next();
            });
            return this.promise;
        }
        if (this.commands.length === 0) {
            if (this.state !== ShellState.Empty) {
                this.state = ShellState.Empty;
                this.end = new Date();
                this.isBusy = false;
                var promise = this.promise;
                // Always resolve the promise, consumer should check for errors
                promise.resolve(this);
            }
            return this.promise;
        }
        var child = null;
        var options = this.commands.shift();
        var command = ValueExtractor_1.ValueExtractor.interpolateAny(options.command, this.extracted);
        var rgxReady = options.matchReady;
        var detached = options.detached === true;
        var silent = this.params.silent;
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
            var exec = ValueExtractor_1.ValueExtractor.interpolateAny(options.exec, this.extracted, options);
            var args = ValueExtractor_1.ValueExtractor.interpolateAny(options.args, this.extracted, options);
            var method = options.fork ? 'fork' : 'spawn';
            if (this.params.verbose) {
                this.print(method + ": " + exec + " " + args.join(''));
            }
            child = options.fork
                ? child_process.fork(exec, args, {
                    cwd: options.cwd || process.cwd(),
                    env: process.env,
                    stdio: stdio,
                    detached: detached
                })
                : child_process.spawn(exec, args, {
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
        if (this.params.parallel !== false) {
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


// source ./ModuleSimplified.js
var _src_runner_Commands;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = void 0;
var Shell_1 = _src_Shell;
exports.Commands = {
    run: function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var command, shell;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = Args.get(args, '-c');
                        shell = new Shell_1.Shell({
                            command: command,
                            restartOnErrorExit: {
                                delayMs: Number(Args.get(args, '--delay', String(5 * 1000))),
                                maxRestartCount: Number(Args.get(args, '--restart', String(10))),
                                maxRestartTimespanMs: Number(Args.get(args, '--restart-window', String(30 * 1000))),
                            }
                        });
                        return [4 /*yield*/, shell.run()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, shell.onCompleteAsync()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
};
var Args;
(function (Args) {
    function get(args, argKey, $default) {
        var i = args.indexOf(argKey);
        if (i === -1) {
            if ($default != null) {
                return $default;
            }
            throw new Error("Argument " + argKey + " not found");
        }
        var value = args[i + 1];
        if (!value) {
            if ($default != null) {
                return $default;
            }
            throw new Error("Valud for " + argKey + " expected");
        }
        return value;
    }
    Args.get = get;
})(Args || (Args = {}));
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_runner_Commands) && isObject(module.exports)) {
		Object.assign(_src_runner_Commands, module.exports);
		return;
	}
	_src_runner_Commands = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_util_CommandUtil;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandUtil = void 0;
var atma_utils_1 = require("atma-utils");
var atma_io_1 = require("atma-io");
var CommandUtil;
(function (CommandUtil) {
    function formatPaths(command, cwd) {
        return __awaiter(this, void 0, void 0, function () {
            var redirect, redirectIdx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        command = command.trim();
                        redirect = '';
                        redirectIdx = command.indexOf('>>');
                        if (redirectIdx > -1) {
                            redirect = ' ' + command.substring(redirectIdx);
                            command = command.substring(0, redirectIdx).trim();
                        }
                        command = ensureCwdIfCronbee(command, cwd);
                        return [4 /*yield*/, rewriteAbsPath(command, cwd)];
                    case 1:
                        command = _a.sent();
                        command = ensureCwd(command, cwd);
                        return [2 /*return*/, command + redirect];
                }
            });
        });
    }
    CommandUtil.formatPaths = formatPaths;
    function split(command) {
        var args = [];
        for (var i = 0; i < command.length; i++) {
            var c = command[i];
            if (c === ' ') {
                continue;
            }
            if (c === '"') {
                var end = command.indexOf('"', i + 1);
                if (end === -1) {
                    throw new Error("Invalid command " + command + ". Quote not closed");
                }
                args.push(command.slice(i + 1, end));
                i = end + 1;
                continue;
            }
            var rgx = /(\s|$)/g;
            rgx.lastIndex = i;
            var match = rgx.exec(command);
            if (match == null) {
                throw new Error("Invalid command " + command + ". Param has no ending");
            }
            args.push(command.slice(i, match.index));
            i = match.index;
        }
        return args;
    }
    CommandUtil.split = split;
    function rewriteAbsPath(command, cwd) {
        return __awaiter(this, void 0, Promise, function () {
            var rgxCommand, match, args, path;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rgxCommand = /^[^\s]+/;
                        match = rgxCommand.exec(command);
                        if (match == null) {
                            return [2 /*return*/, command];
                        }
                        if (!(match[0] === 'cronbee')) return [3 /*break*/, 2];
                        return [4 /*yield*/, rewriteAbsPath(slice(command, match), cwd)];
                    case 1:
                        args = _a.sent();
                        command = "cronbee " + args;
                        _a.label = 2;
                    case 2: return [4 /*yield*/, getAbsPathIfNodeModule(match[0], cwd)];
                    case 3:
                        path = _a.sent();
                        if (path) {
                            command = path + " " + slice(command, match);
                        }
                        return [2 /*return*/, command];
                }
            });
        });
    }
    function slice(str, match) {
        return str.substring(match.index + match[0].length + 1).trim();
    }
    function getAbsPathIfNodeModule(name, cwd) {
        return __awaiter(this, void 0, void 0, function () {
            var path, exists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = atma_utils_1.class_Uri.combine(cwd, '/node_modules/.bin/', name);
                        return [4 /*yield*/, atma_io_1.File.existsAsync('file://' + path)];
                    case 1:
                        exists = _a.sent();
                        if (exists) {
                            return [2 /*return*/, path];
                        }
                        return [2 /*return*/, null];
                }
            });
        });
    }
    function ensureCwd(str, cwd) {
        if (str.includes('-cwd') === false && process.platform !== 'win32') {
            return "cd " + cwd + " && " + str;
        }
        return str;
    }
    function ensureCwdIfCronbee(command, cwd) {
        if (command.includes('cronbee') && command.includes('-cwd') === false) {
            return command + " --cwd " + cwd;
        }
        return command;
    }
})(CommandUtil = exports.CommandUtil || (exports.CommandUtil = {}));
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_util_CommandUtil) && isObject(module.exports)) {
		Object.assign(_src_util_CommandUtil, module.exports);
		return;
	}
	_src_util_CommandUtil = module.exports;
}());
// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_runner_Runner;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Runner = void 0;
var Commands_1 = _src_runner_Commands;
var CommandUtil_1 = _src_util_CommandUtil;
var Runner = /** @class */ (function () {
    function Runner() {
    }
    Runner.prototype.execute = function (params) {
        return __awaiter(this, void 0, Promise, function () {
            var task;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof params === 'string') {
                            params = CommandUtil_1.CommandUtil.split(params);
                        }
                        task = params[0];
                        if (!(task in Commands_1.Commands)) return [3 /*break*/, 2];
                        return [4 /*yield*/, Commands_1.Commands[task](params.slice(1))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Runner.prototype.runFromCli = function () {
        return __awaiter(this, void 0, void 0, function () {
            var args;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = process.argv.slice(2);
                        return [4 /*yield*/, this.execute(args)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Runner;
}());
exports.Runner = Runner;
var HandleArgs;
(function (HandleArgs) {
    function whitespaces(args) {
        for (var i = 0; i < args.length; i++) {
            var str = args[i];
            if (str.includes(' ') && /'"\(/.test(str)) {
                args[i] = "\"" + str + "\"";
            }
        }
    }
    /** Serialize array of parameters into one single command line string */
    function serialize(args) {
        whitespaces(args);
        return args.join(' ');
    }
    HandleArgs.serialize = serialize;
    function extractCwdIfAny(args) {
        for (var i = 0; i < args.length; i++) {
            var str = args[i];
            if (/[\-]{1,2}cwd/i.test(str)) {
                var cwd = args[i + 1];
                args.splice(i, 2);
                return cwd;
            }
        }
        return null;
    }
    HandleArgs.extractCwdIfAny = extractCwdIfAny;
})(HandleArgs || (HandleArgs = {}));
;

	function isObject(x) {
		return x != null && typeof x === 'object' && x.constructor === Object;
	}
	if (isObject(_src_runner_Runner) && isObject(module.exports)) {
		Object.assign(_src_runner_Runner, module.exports);
		return;
	}
	_src_runner_Runner = module.exports;
}());
// end:source ./ModuleSimplified.js

"use strict";
var Runner_1 = _src_runner_Runner;
var runner = new Runner_1.Runner();
module.exports = runner;


}());
// end:source ./RootModule.js
