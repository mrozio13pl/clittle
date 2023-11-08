import { parse as parseArgs, type Options as OfiOptions } from 'ofi';
import { Command } from './command';
import { DEFAULT, split } from './utils';
import renderVersion from './renderers/version';
import type { Options, ParsedArguments } from './types';

class Cli extends Command {
    #version = '0.0.0';
    readonly #options: Options;
    private readonly bin: string;

    /**
     * Create command-line interface.
     * @param {string} name Command name with arguments
     * @param {string} description Description
     * @param {Options} options Options
     */
    constructor(name: string, description?: string, options: Options = {}) {
        options = {
            showHelp: true,
            showVersion: true,
            onMissingArguments: true,
            onMissingFlags: true,
            exitOnMissingArguments: true,
            exitOnMissingFlags: true,
            ...options
        };

        const bin = split(name.trim())[0];

        if (!bin) throw new Error('no cli name provided');
        if (bin === DEFAULT) throw new Error(`can't set command name ${DEFAULT} because it stands for the default command`);

        super(bin, name.replace(bin, DEFAULT), description, options);
        this.bin = bin;
        this.#options = options;

        if (this.#options.showVersion) {
            this.option('-v, --version, Get version.');
        }
    }

    /**
     * Set version.
     * @param {string} ver Version.
     * @returns {Cli}
     */
    version(ver: string): Cli {
        this.#version = ver;
        return this;
    }

    /**
     * Get current version.
     */
    get version_() {
        return this.#version;
    }

    /**
     * Parse arguments.\
     * This function should be called after all options, commands etc. are defined.
     * @param {string | string[]} args Arguments to parse.
     * @param {OfiOptions} options Parser options (they will be also used for every single command).
     */
    parse(args: string | string[] = process.argv.slice(2), options: OfiOptions): ParsedArguments | void {
        options = { camelize: true, 'populate--': true, ...options };

        const _options = options; // this object will not include '--version' flag and will be passed to other commands

        if (this.#options.showVersion) {
            (options.boolean = Array.isArray(options.boolean) ? options.boolean : []).push('version');
            (options.alias = options.alias || {}).version = 'v';
        }
        const argv = parseArgs(args, options);

        if (argv.version) {
            if (typeof this.#options.showVersion === 'function') {
                this.#options.showVersion(this.#version);
                return;
            }
            // default version handler
            renderVersion(this);
            process.exit(1);
        }

        return this.run(args, argv, _options);
    }
}

export { Cli };