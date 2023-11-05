/* eslint-disable jsdoc/require-param */
import tty from 'tty';

/** Default name for the main command. */
export const DEFAULT = '__default__';

export const FLAG_REGEX = /^[<[].*[>\]]$/;

/** Merge objects. */
export function merge(obj1: any, obj2: any) {
    for (const key in obj2) {
        obj1[key] = obj1[key] && Array.isArray(obj1[key]) && Array.isArray(obj2[key]) ? [...obj1[key], ...obj2[key]] : { ...obj1[key], ...obj2[key] };
    }

    return obj1;
}

/**
 * Whether a given argument receives multiple arguments.
 * @param {string} arg Given argument
 * @returns {boolean}
 * @private
 */
export function isMultipleArgument(arg: string): boolean {
    return arg.endsWith('...') || arg.startsWith('...');
}

/** Split spaces, including quotes. */
export function split(args: string): string[] {
    return args.match(/"([^"]+)"|(\S+)/g)?.map(arg => arg.replace(/(^"|"$)/g, '')) || args.split(/\s+/);
}

/** Terminal color support. */
const hasColors =
    'FORCE_COLOR' in process.env
    && process.env.FORCE_COLOR?.toLowerCase() === 'true'
    || process.argv.includes('--no-colors')
    || process.argv.includes('--no-color')
    || tty.WriteStream.prototype.hasColors();

/**
 * Make text bold
 * @param {string} str String to bold
 * @private
 */
export function bold(str: string): string {
    return hasColors ? `\u001B[1m${str}\u001B[22m` : str;
}