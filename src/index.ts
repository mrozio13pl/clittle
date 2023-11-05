import { Cli } from './cli';
import { basename } from 'path';
import getCallerFile from 'get-caller-file';
import type { Options } from './types';

export * from './errors';
export * from './types';

/**
 * Create the main CLI wrapper.
 * @param {string} name Command name with arguments.
 * @param {string} description CLI app description.
 * @param {Options} options Options.
 * @returns {Cli}
 */
export function cli(name: string = basename(getCallerFile()), description?: string, options: Options = {}): Cli {
    return new Cli(name, description, options);
}