import { DEFAULT, FLAG_REGEX, isMultipleArgument, merge, split } from './utils';
import { InvalidArgumentsError, MissingArgumentsError, MissingFlagsError } from './errors';
import renderHelp from './renderers/help';
import { parse, type Argv, type Options as OfiOptions } from 'ofi';
import type { ActionCallback, Argument, FlagOption, Options, ParsedArguments } from './types';

class Command {
    readonly #bin: string;
    readonly #name: string;
    /** Command description. */
    public description?: string;
    #options: Options;
    #parser_options: OfiOptions;
    protected readonly flags: Record<string, FlagOption>;
    /** Usage examples. */
    public readonly examples: string[];
    // eslint-disable-next-line no-use-before-define
    protected readonly subs: Record<string, Command>;
    #handler?: ActionCallback;
    /** Command arguments. */
    private readonly args: Argument[] = [];
    // this is used later for help renderer when using commands inside other commands
    #full_cmd_name: string;

    constructor(bin: string, name: string, description?: string, options: Options = {}) {
        this.#bin = bin;
        this.#options = options;

        const parts = split(name.trim());

        // The first part should be the command
        if (FLAG_REGEX.test(parts[0])) throw new Error('no command name provided');
        this.#name = parts[0];

        // Process the remaining parts to identify required and optional arguments
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i], name = part.slice(1, -1).replace('...', ''), multiple = isMultipleArgument(part.slice(1, -1));

            if (this.args.some(arg => arg.name === name)) throw new Error(`'${name}' argument has been already declared`);

            if (part.startsWith('<') && part.endsWith('>')) {
                // Required argument enclosed in angle brackets
                this.args.push({
                    name,
                    required: true,
                    multiple
                });
            } else if (part.startsWith('[') && part.endsWith(']')) {
                // Optional argument enclosed in square brackets
                this.args.push({
                    name,
                    required: false,
                    multiple
                });
            } else {
                throw new Error(`'${part}' is not a valid param`);
            }

            if (multiple && parts.length > i + 1) {
                throw new Error('can\'t assing another argument, multiple argument is the last argument');
            }
        }

        this.description = description;
        this.flags = {};
        this.examples = [];
        this.subs = {};
        this.#parser_options = {};
        this.#full_cmd_name = this.#name === DEFAULT ? '' : ' ' + this.#name;

        if (this.#options.onUnknownFlags) {
            this.#parser_options.unknown = this.#options.onUnknownFlags;
        }

        if (this.#options.showHelp) {
            this.option('-h, --help, Show help.');
        }
    }

    /** Command name */
    get name(): string {
        return this.#name;
    }

    /**
     * Provide description for the command.
     * @param {string} description Description.
     * @returns {Command}
     */
    describe(description: string): Command {
        this.description = description;
        return this;
    }

    /**
     * Add an example.
     * @param {string} example Example
     * @returns {Command}
     */
    example(example: string): Command {
        this.examples.push(example);
        return this;
    }

    /**
     * Assing options.
     * @param {Options} options Options.
     * @returns {Command}
     */
    options(options: Options): Command {
        this.#options = Object.assign(this.#options, options);
        if (this.#options.onUnknownFlags) this.#parser_options.unknown = this.#options.onUnknownFlags;
        for (const sub in this.subs) {
            this.subs[sub].#options = Object.assign(this.subs[sub].#options, options);
            if (this.#options.onUnknownFlags) this.subs[sub].#parser_options.unknown = this.#options.onUnknownFlags;
        }
        return this;
    }

    /**
     * Add option flag to the command.
     * @param {string} name Contains information about the option.
     * @param {FlagOption} options Some additional options for a given flag.
     * @returns {Command}
     *
     * @example
     * The `--name` option is required, available under `-n` alias and has description `Your name`.
     * ```js
     * prog.option('-n, --name <name>, Your name');
     * ```
     */
    option(name: string, options: Partial<Omit<FlagOption, keyof Argument>> = {}): Command {
        // Flags and alias will be stored here
        const alias: string[] = options.alias || [];
        let flag = ''
            , flagname = ''
            , description = options.description || ''
            , multiple = false
            , required = false
            , negated = false; // e.g. --no-foo

        // Split the `name` string into individual parts separated by commas
        const parts = name.trim().split(',').map(part => part.trim());

        // Process each part to identify flags, alias, and description
        for (const part of parts) {
            if (part.startsWith('-')) {
                for (const flag_part of split(part).map(part => part.trim())) {
                    if (flag_part.startsWith('--')) {
                        // flag
                        if (flag_part.startsWith('--no-')) negated = true;
                        if (flag) {
                            throw new Error('flag can not be declared twice');
                        }
                        flag = flag_part.slice(2).replace(/^no-/, '');
                    } else if (flag_part.startsWith('-')) {
                        // alias
                        alias.push(flag_part.slice(1));
                    } else if (FLAG_REGEX.test(flag_part)) {
                        // name
                        multiple = isMultipleArgument(flag_part.slice(1, -1));
                        required = flag_part.startsWith('<') && flag_part.endsWith('>');
                        flagname = flag_part.slice(1, -1).replace('...', '');
                    }
                }
            } else {
                // description
                if (description) {
                    description += ', ' + part;
                } else {
                    description = part;
                }
            }
        }

        if (!flag) throw new Error('flag name was not provided');
        if (negated && multiple) throw new Error(`flag '${flag}' can't accept negations and array lists simultaneously`);
        const type_: FlagOption['type'] = negated ? 'boolean' : (multiple ? 'array' : options.type ?? (flagname ? 'string' : 'boolean'));

        // if negated, inverse the default value, e.g. false -> true
        if (typeof options.default === 'boolean' && negated) options.default = !options.default;

        // Now add the option to the command
        ((this.#parser_options[type_] = this.#parser_options[type_] || []) as string[]).push(flag);
        (this.#parser_options.alias = this.#parser_options.alias || {})[flag] = alias;
        if (options.default) (this.#parser_options.default = this.#parser_options.default || {})[flag] = options.default;
        this.flags[flag] = {
            type: type_,
            description,
            name: flagname,
            alias,
            default: options.default,
            multiple,
            required
        };

        return this;
    }

    /**
     * Create a command.
     * @param {string} name Contains command name and arguments.
     * @param {string} description Command description.
     * @returns {Command}
     *
     * @example
     * ```js
     * // tasks.js
     * prog
     *     .command('add <tasks...>', 'Add tasks')
     *     .action(({ tasks }) => {
     *         console.log('Added tasks:', tasks.join(', '));
     *     })
     *     .parse();
     * ```
     *
     * Output:
     * ```console
     * $ node tasks.js add "Tidy my room" "Wash the dishes"
     * Added tasks: Tidy my room, Wash the dishes
     * ```
     */
    command(name: string, description?: string): Command {
        const command = new Command(this.#bin, name, description, this.#options);
        if (this.subs[command.#name] instanceof Command) throw new Error(`${command.#name} already exists`);

        command.#parser_options = this.#parser_options;
        command.#options = this.#options;
        command.#full_cmd_name = this.#full_cmd_name + command.#full_cmd_name;

        this.subs[command.#name] = command;
        return command;
    }

    /**
     * Run a callback function when the command is executed.
     * @param {ActionCallback} fn Callback function.
     * @returns {Command}
     */
    action(fn: ActionCallback): Command {
        this.#handler = fn;
        return this;
    }

    /** Display help message. */
    help(): Command {
        if (typeof this.#options.showHelp === 'function') {
            this.#options.showHelp({
                bin: this.#bin,
                name: this.name === DEFAULT ? '' : this.name,
                description: this.description,
                command: this.#full_cmd_name,
                commands: this.subs,
                flags: this.flags,
                arguments: this.args,
                examples: this.examples
            });
            return this;
        }

        // default help renderer
        if (this.#options.showHelp) {
            renderHelp(this.#bin, this.#full_cmd_name, this, this.subs, this.flags, this.args);
        }
        return this;
    }

    protected run(args: string | string[], argv: Argv, parserOptions: OfiOptions = {}): ParsedArguments | void {
        const cmd = argv._[0];

        if (cmd && this.subs[cmd] instanceof Command) {
            const arg = argv._.shift();

            if (arg) {
                if (typeof args === 'string') {
                    args.replace(arg, '');
                } else {
                    args.shift();
                }
            }

            return this.subs[cmd].run(args, argv);
        }

        // assing parser options
        if (typeof parserOptions.boolean === 'string') parserOptions.boolean = [parserOptions.boolean];
        if (typeof parserOptions.array === 'string') parserOptions.array = [parserOptions.array];
        if (typeof parserOptions.string === 'string') parserOptions.string = [parserOptions.string];
        if (typeof parserOptions.number === 'string') parserOptions.number = [parserOptions.number];

        argv = parse(args, merge(this.#parser_options, parserOptions)) as Argv;

        if (argv.help) {
            this.help();
            if (this.#options.showHelp === true) process.exit(1);
        }

        const parsed_args = { options: argv } as ParsedArguments;

        let i = 0, current_arg = this.args[i];
        for (; i < argv._.length; i++) {
            current_arg = this.args[i];

            if (!current_arg && this.#options.onUnknownArguments) {
                if (typeof this.#options.onUnknownArguments === 'function') {
                    this.#options.onUnknownArguments(argv._.slice(i));
                }
                else throw new InvalidArgumentsError(`'${argv._[i]}' is not a defined argument`);
            }

            if (current_arg.multiple) {
                parsed_args[current_arg.name] = argv._.slice(i);
                break;
            }

            parsed_args[current_arg.name] = argv._[i];
        }

        // look for missing required arguments
        const missing_args = this.args.filter(arg => !parsed_args[arg.name] && arg.required);

        if (missing_args.length && this.#options.onMissingArguments) {
            if (typeof this.#options.onMissingArguments === 'function') {
                this.#options.onMissingArguments(missing_args.map(({ name }) => name));
                if (this.#options.exitOnMissingArguments) return;
            } else {
                throw new MissingArgumentsError(`the following arguments are missing: ${missing_args.map(({ name }) => '\'' + name + '\'').join(', ')}`);
            }
        }

        // look for missing required options
        if (this.#options.onMissingFlags) {
            const missing_options = [];
            for (const flag_name in this.flags) {
                const flag = this.flags[flag_name];
                if (flag.required && !(flag_name in argv)) missing_options.push(flag_name);
            }

            if (missing_options.length) {
                if (typeof this.#options.onMissingFlags === 'function') {
                    this.#options.onMissingFlags(missing_options);
                    if (this.#options.exitOnMissingFlags) return;
                } else {
                    throw new MissingFlagsError(`the following flags are missing, but required: ${missing_options.map(name => '\'' + name + '\'').join(', ')}`);
                }
            }
        }

        if (typeof this.#handler === 'function') {
            this.#handler(parsed_args);
        }

        return parsed_args;
    }
}

export { Command };