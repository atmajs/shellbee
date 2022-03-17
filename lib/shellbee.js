
// source ./RootModule.js
(function(){
	
	var _src_CommunicationChannel = {};
var _src_Shell = {};
var _src_ValueExtractor = {};
var _src_util_ShellErrorExitsHandler = {};
var _src_util_ShellParamsUtil = {};
var _src_util_ShellWrapperUtil = {};
var _src_util_command = {};
var _src_util_events = {};
var _src_util_path = {};
var _src_util_restartSelf = {};
var _src_util_serialize = {};

// source ./ModuleSimplified.js
var _src_util_path;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_util_path != null ? _src_util_path : {};
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

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_util_path === module.exports) {
        // do nothing if
    } else if (__isObj(_src_util_path) && __isObj(module.exports)) {
        Object.assign(_src_util_path, module.exports);
    } else {
        _src_util_path = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_util_ShellWrapperUtil;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_util_ShellWrapperUtil != null ? _src_util_ShellWrapperUtil : {};
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
            command = "\"".concat(command, "\"");
        }
        else if (command.includes("'") === false) {
            command = "'".concat(command, "'");
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

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_util_ShellWrapperUtil === module.exports) {
        // do nothing if
    } else if (__isObj(_src_util_ShellWrapperUtil) && __isObj(module.exports)) {
        Object.assign(_src_util_ShellWrapperUtil, module.exports);
    } else {
        _src_util_ShellWrapperUtil = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_util_command;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_util_command != null ? _src_util_command : {};
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
    var imax = parts.length;
    var i = -1;
    while (++i < imax) {
        var arg = parts[i];
        if (arg.length === 0) {
            continue;
        }
        var c = arg[0];
        if (c !== '"' && c !== "'") {
            continue;
        }
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
                i--;
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

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_util_command === module.exports) {
        // do nothing if
    } else if (__isObj(_src_util_command) && __isObj(module.exports)) {
        Object.assign(_src_util_command, module.exports);
    } else {
        _src_util_command = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_ValueExtractor;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_ValueExtractor != null ? _src_ValueExtractor : {};
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

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_ValueExtractor === module.exports) {
        // do nothing if
    } else if (__isObj(_src_ValueExtractor) && __isObj(module.exports)) {
        Object.assign(_src_ValueExtractor, module.exports);
    } else {
        _src_ValueExtractor = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_util_serialize;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_util_serialize != null ? _src_util_serialize : {};
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

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_util_serialize === module.exports) {
        // do nothing if
    } else if (__isObj(_src_util_serialize) && __isObj(module.exports)) {
        Object.assign(_src_util_serialize, module.exports);
    } else {
        _src_util_serialize = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_CommunicationChannel;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_CommunicationChannel != null ? _src_CommunicationChannel : {};
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
                    error: (0, serialize_1.serialize_error)(new Error("".concat(method, " not defined")))
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

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_CommunicationChannel === module.exports) {
        // do nothing if
    } else if (__isObj(_src_CommunicationChannel) && __isObj(module.exports)) {
        Object.assign(_src_CommunicationChannel, module.exports);
    } else {
        _src_CommunicationChannel = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_util_events;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_util_events != null ? _src_util_events : {};
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

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_util_events === module.exports) {
        // do nothing if
    } else if (__isObj(_src_util_events) && __isObj(module.exports)) {
        Object.assign(_src_util_events, module.exports);
    } else {
        _src_util_events = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_util_ShellParamsUtil;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_util_ShellParamsUtil != null ? _src_util_ShellParamsUtil : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellParamsUtil = void 0;
var ShellParamsUtil;
(function (ShellParamsUtil) {
    function normalize(params) {
        var _a, _b;
        if (params.shell == null && !params.fork) {
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

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_util_ShellParamsUtil === module.exports) {
        // do nothing if
    } else if (__isObj(_src_util_ShellParamsUtil) && __isObj(module.exports)) {
        Object.assign(_src_util_ShellParamsUtil, module.exports);
    } else {
        _src_util_ShellParamsUtil = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_util_ShellErrorExitsHandler;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_util_ShellErrorExitsHandler != null ? _src_util_ShellErrorExitsHandler : {};
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

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_util_ShellErrorExitsHandler === module.exports) {
        // do nothing if
    } else if (__isObj(_src_util_ShellErrorExitsHandler) && __isObj(module.exports)) {
        Object.assign(_src_util_ShellErrorExitsHandler, module.exports);
    } else {
        _src_util_ShellErrorExitsHandler = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_Shell;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_Shell != null ? _src_Shell : {};
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
                this.print("".concat(method, ": ").concat(exec, " ").concat(args.join('')));
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
                var err = new Error("Exit code: ".concat(code, ". ").concat(msg !== null && msg !== void 0 ? msg : ''));
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

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_Shell === module.exports) {
        // do nothing if
    } else if (__isObj(_src_Shell) && __isObj(module.exports)) {
        Object.assign(_src_Shell, module.exports);
    } else {
        _src_Shell = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js


// source ./ModuleSimplified.js
var _src_util_restartSelf;
(function () {
    // ensure AMD is not active for the model, so that any UMD exports as commonjs
    var define = null;
    var exports = _src_util_restartSelf != null ? _src_util_restartSelf : {};
    var module = { exports: exports };

    "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restartSelf = void 0;
var Shell_1 = _src_Shell;
function restartSelf() {
    var command = process
        .argv
        .map(function (x) { return x.includes(' ') ? "\"".concat(x, "\"") : x; })
        .join(' ');
    var shell = new Shell_1.Shell({
        command: command,
        detached: true,
    });
    shell.onStart(function () {
        console.log('Exit self.');
        process.exit();
    });
    console.log('Cloning this process.');
    shell.run();
}
exports.restartSelf = restartSelf;
;
;

    function __isObj(x) {
        return x != null && typeof x === 'object' && x.constructor === Object;
    }
    if (_src_util_restartSelf === module.exports) {
        // do nothing if
    } else if (__isObj(_src_util_restartSelf) && __isObj(module.exports)) {
        Object.assign(_src_util_restartSelf, module.exports);
    } else {
        _src_util_restartSelf = module.exports;
    }

    ;
}());

// end:source ./ModuleSimplified.js

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.Shell = exports.restartSelf = void 0;
var Shell_1 = _src_Shell;
Object.defineProperty(exports, "Shell", { enumerable: true, get: function () { return Shell_1.Shell; } });
var restartSelf_1 = _src_util_restartSelf;
Object.defineProperty(exports, "restartSelf", { enumerable: true, get: function () { return restartSelf_1.restartSelf; } });
exports.run = Shell_1.Shell.run;


}());
// end:source ./RootModule.js
