import type { Command } from './command';
import type { Argv } from 'ofi';

export declare interface Argument {
    name: string;
    required: boolean;
    multiple: boolean;
}

export declare interface FlagOption extends Argument {
    /** Flag value type. */
    readonly type?: 'string' | 'number' | 'boolean' | 'array';
    default?: any;
    description?: string;
    alias?: string[];
}

export declare interface CommandMeta {
    /** CLI app name. */
    bin: string;
    /** Command name. */
    name: Command['name'];
    /** Full command name. (including its parent-commands) */
    command: string;
    description: Command['description'];
    /** Sub commands. */
    commands: Command['subs'];
    /** Flags. */
    flags: Command['flags'];
    /** Arguments. */
    arguments: Command['args'];
    alias: Command['aliases'];
    examples: Command['examples'];
}

export declare interface CommandOptions {
    /** Command alias. */
    alias?: string | string[];
}

export declare interface Options {
    /**
     * Custom function that will handle `--help` option or boolean to either enable the default function or disable this option entirely.
     *
     * @example
     * ```js
     * cli('my-cli', 'My CLI app', {
     *     showHelp: (meta) => {
     *         console.log(`${meta.bin}${meta.command} - ${meta.description}`);
     *         console.log(`Examples:\n${meta.examples.join('\n')}`);
     *         // ...
     *         process.exit(1);
     *     }
     * });
     * ```
     */
    showHelp?: ((options: CommandMeta) => any) | boolean;
    /**
     * Custom function that will handle `--version` option or boolean to either enable the default function or disable this option entirely.
     *
     * @example
     * ```js
     * cli('my-cli', 'My CLI app', {
     *     showVersion: (version) => console.log('current version:', version)
     * });
     * ```
     */
    showVersion?: ((version: string) => any) | boolean;
    /**
     * Custom function that will handle missing arguments or boolean to either enable or disable this feature.\
     * By default it's going to throw `MissingArgumentsError`.
     *
     * @example
     * ```js
     * cli('my-cli', 'My CLI app', {
     *     onMissingArguments: (args) => console.log('WARN! Missing Arguments:', args.join(', '))
     * })
     * ```
     */
    onMissingArguments?: ((args: string[]) => any) | boolean;
    /**
     * Custom function that will handle missing flags or boolean to either enable or disable this feature.\
     * By default it's going to throw `MissingFlagsError`.
     *
     * @example
     * ```js
     * cli('my-cli', 'My CLI app', {
     *     onMissingFlags: (flags) => console.log('WARN! Missing Flags:', flags.join(', '))
     * })
     * ```
     */
    onMissingFlags?: ((flags: string[]) => any) | boolean;

    /**
     * Custom function that will handle unknown flags.\
     * By default they are going to be ignored.
     *
     * @example
     * ```js
     * cli('my-cli', 'My CLI app', {
     *     onUnknownFlags: (flags) => console.log('WARN! Unknown Flags:', flags.join(', '))
     * })
     * ```
     */
    onUnknownFlags?: ((flags: string[]) => any);
    /**
     * Custom function that will handle unknown flags.\
     * By default it's going to throw `InvalidArgumentsError`.
     *
     * @example
     * ```js
     * cli('my-cli', 'My CLI app', {
     *     onUnknownArguments: (args) => console.log('WARN! Unknown Arguments:', args.join(', '))
     * })
     * ```
     */
    onUnknownArguments?: ((args: string[]) => any) | boolean;
    /**
     * Should the program exit if an argument is missing.\
     * Type: `Boolean`\
     * Default: `true`
     */
    exitOnMissingArguments?: boolean;
    /**
     * Should the program exit if a flag is missing.\
     * Type: `Boolean`\
     * Default: `true`
     */
    exitOnMissingFlags?: boolean;
}

/** Parsed arguments. */
export declare type ParsedArguments = Record<string, any | any[]> & { options: Argv };

/** Callback function that handles command arguments and options. */
export declare type ActionCallback = (args: ParsedArguments) => any;