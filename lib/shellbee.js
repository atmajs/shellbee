
// source ./RootModule.js
(function(){
	
	var _src_Shell = {};
var _src_ValueExtractor = {};
var _src_util_command = {};
var _src_util_path = {};

// source ./ModuleSimplified.js
var _src_util_path;
(function () {
	var exports = {};
	var module = { exports: exports };
	"use strict";
exports.__esModule = true;
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
exports.__esModule = true;
var path_1 = _src_util_path;
function command_parseAll(commands, detachedAll, cwdAll, rgxReadyAll) {
    if (cwdAll != null) {
        cwdAll = path_1.path_ensure(cwdAll, process.cwd());
    }
    return commands.reduce(function (aggr, command, index) {
        var detached = detachedAll || false, cwd = cwdAll || process.cwd(), matchReady = rgxReadyAll, extract = null, exec;
        if (typeof command === 'string') {
            exec = command;
        }
        else if (command != null) {
            var obj = command;
            exec = obj.command;
            if (obj.cwd) {
                cwd = path_1.path_ensure(obj.cwd, cwd);
            }
            if (obj.detached) {
                detached = obj.detached;
            }
            if (obj.matchReady) {
                matchReady = obj.matchReady;
            }
            if (obj.extract) {
                extract = obj.extract;
            }
        }
        if (exec == null || exec === '') {
            console.warn('Command Object is not valid. Should be at least {command: string}');
            return aggr;
        }
        var args = command_parse(exec);
        aggr.push({
            exec: args.shift(),
            args: args,
            cwd: cwd,
            //stdio: 'pipe',
            detached: detached,
            command: exec,
            matchReady: matchReady,
            extract: extract
        });
        return aggr;
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
exports.__esModule = true;
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
exports.__esModule = true;
var atma_utils_1 = require("atma-utils");
var atma_io_1 = require("atma-io");
var child_process = require("child_process");
var command_1 = _src_util_command;
var ValueExtractor_1 = _src_ValueExtractor;
var Shell = /** @class */ (function (_super) {
    __extends(Shell, _super);
    function Shell(params) {
        var _this = _super.call(this) || this;
        _this.children = [];
        _this.errors = [];
        _this.lastCode = 0;
        _this.results = [];
        _this.extracted = {};
        _this.state = 0;
        _this.promise = new atma_utils_1.class_Dfr();
        _this.std = [];
        _this.stderr = [];
        _this.stdout = [];
        _this.busy = false;
        var command = params.command || params.commands, detached = params.detached || false, cwd = params.cwd || process.cwd(), rgxReady = params.matchReady;
        _this.silent = params.silent;
        _this.parallel = params.parallel || false;
        var commands = Array.isArray(command)
            ? command
            : [command];
        _this.commands = command_1.command_parseAll(commands, detached, cwd, rgxReady);
        return _this;
    }
    Shell.run = function (params) {
        return new Shell(params).run();
    };
    Shell.prototype.run = function () {
        if (this.busy === false) {
            this.next();
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
        if (this.commands.some(function (x) { return x.matchReady; }) === false) {
            console.error('Ready Matcher is not defined');
        }
        return this.on('process_ready', cb);
    };
    Shell.prototype.onComplete = function (cb) {
        var _this = this;
        this.promise.always(function () { return cb(_this); });
        return this;
    };
    Shell.prototype.kill = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var child = _this.children.pop();
            if (child == null) {
                return resolve();
            }
            _this.once('process_exit', resolve);
            child.kill('SIGINT');
        });
    };
    Shell.prototype.next = function () {
        var _this = this;
        if (this.busy === false) {
            this.start = new Date();
            this.busy = true;
        }
        if (this.commands.length === 0) {
            if (this.state !== -1) {
                this.state = -1;
                this.end = new Date();
                this.busy = false;
                var promise = this.promise;
                if (this.errors.length === 0) {
                    promise.resolve(this);
                }
                else {
                    var str = this.errors.map(function (error) {
                        return "Command " + error.command + " failed: " + error.error.message;
                    }).join('\n');
                    promise.reject(new Error(str));
                }
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
        if (global.process.platform === 'win32') {
            if (options.exec !== 'cmd') {
                options.args.unshift('/C', options.exec);
                options.exec = 'cmd';
            }
        }
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
            child = child_process.spawn(exec, args, {
                cwd: options.cwd || process.cwd(),
                env: process.env,
                stdio: stdio,
                detached: detached
            });
            this.children.push(child);
        }
        catch (error) {
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
        child.on('exit', function (code) {
            result.resultCode = code;
            _this.emit('process_exit', {
                command: command,
                code: code,
                result: result
            });
            _this.lastCode = code;
            if (code > 0) {
                _this.errors.push({
                    command: command,
                    error: new Error('Exit code: ' + code)
                });
            }
            extractor && extractor.complete();
            _this.next();
        });
        child.stdout.on('data', function (buffer) {
            if (detached !== true && silent !== true) {
                process.stdout.write(buffer);
            }
            if (rgxReady != null && rgxReady.test(buffer.toString())) {
                rgxReady = null;
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
exports.__esModule = true;
var Shell_1 = _src_Shell;
exports.Shell = Shell_1.Shell;


}());
// end:source ./RootModule.js
