import { is_Function } from 'atma-utils';
import { ICommandOptions } from './interface/ICommandOptions';
import { IValueExtractors } from './interface/IValueExtractors';
export class ValueExtractor {
    private string = '';
    constructor(private target: object, private extractors: IValueExtractors) {
        this.string = '';
    }
    write(buffer) {
        this.string += buffer.toString();
    }
    complete() {
        for (var key in this.extractors) {
            this.target[key] = is_Function(this.extractors[key])
                ? this.extractors[key](this.string)
                : null;
        }
    }
    static extract(str, mix) {
        if (typeof mix === 'function') {
            return mix(str);
        }
    }
    static interpolateAny(mix: string | string[], values: Object, options?: ICommandOptions) {
        if (mix == null || options?.interpolate === false) {
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
    }
    static interpolateStr(str: string, values: Object) {
        return str.replace(/\{\{(\w+)\}\}/g, function (full, prop) {
            let val = values[prop];
            if (val == null) {
                console.warn('Extracted property expected: ', prop, values);
                return '';
            }
            return val;
        });
    }
}
