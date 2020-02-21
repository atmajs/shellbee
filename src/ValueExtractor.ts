import { is_Function } from 'atma-utils';
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
    static interpolateAny(mix, values) {
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
    }
    static interpolateStr(str, values) {
        return str.replace(/\{\{(\w+)\}\}/g, function (full, prop) {
            var val = values[prop];
            if (val == null) {
                console.warn('Extracted property expected: ', prop, values);
                return '';
            }
            return val;
        });
    }
}
