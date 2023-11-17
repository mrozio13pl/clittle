<div align="center">
<h1>🎀clittle🎀</h1>
<p>
    <a href="https://npmjs.com/package/clittle">
      <img src="https://img.shields.io/npm/v/clittle?labelColor=000&color=57B759" alt="npm">
    </a>
    <a href="https://bundlephobia.com/package/clittle">
      <img src="https://img.shields.io/bundlephobia/min/clittle?labelColor=000&color=57B759" alt="npm bundle size">
    </a>
    <a href="./license">
      <img src="https://img.shields.io/npm/l/clittle?labelColor=000&color=57B759" alt="License">
    </a>
  </p>
  <p>
  Tiny, yet <strong>powerful</strong> JavaScript library for building CLI applications.
  </p>
</div>

## Features

* __Lightweight__ - Minimal implementation.
* __Easy.__ Clear and easy to use API.
* __Developer friendly:__ Provides types and useful errors.
* __Very powerful.__ It handles required, optional, variadic arguments, option flags, commands and their sub-commands, automated help message generation and more. Supports both ESM and CJS.

⛔ __NOTE__: This package is under heavy development!

## Install

Install package:

```bash
# npm
npm install clittle

# yarn
yarn add clittle

# pnpm
pnpm install clittle

# bun
bun install clittle
```

## Examples

__Parser__\
Basic example

```js
// examples/simple.js
import { cli } from 'clittle';

const prog = cli('my-cli');

prog
    .option('-f, --files <files...>, List of files to use')
    .option('--name [name], Some name', {
        default: 'joe'
    });

const parsed = prog.parse();
console.log(parsed);
```

```console
$ node .\examples\simple.js --files file1 file2
{ options: { name: 'joe', _: [], files: [ 'file1', 'file2' ] } }
```

__Automated help message & version__\
Display auto-generated help message and version

```js
// examples/help.js
import { cli } from 'clittle';

const prog = cli();

prog
    .version('1.0.0')
    .describe('Help message example.')
    .option('--run [count], How many times should we run?', { type: 'number', default: 10 })
    .option('-n, --name <name>, Provide your name')
    .example('$ node examples/help.js --name "your name"')
    .example('$ node examples/help.js -n "your name" --run 5');

prog
    .command('copy <files...>', 'Copy files');

// display help
prog.help();

// get version
prog.version_;
```

```console
help.js

Usage
  $ help.js [flags...]

Help message example.

Commands
  copy    Copy files

Options
  -h, --help           Show help.
  -v, --version        Get version.
  --run [count]        How many times should we run? (default: '10')
  -n, --name <name>    Provide your name

Examples
  $ node examples/help.js --name "your name"
  $ node examples/help.js -n "your name" --run 5
```

__Commands__\
Create commands with arguments.

```js
#!/usr/bin/env node
// examples/tasks-manager.js
const prog = cli(undefined, 'A simple CLI prog for managing tasks');

prog.command('add [type]', 'Add new tasks')
    .option('--task <tasks...>', { description: 'Tasks to add' })
    .action(({ options, type }) => {
        console.log(`Added tasks: ${options.task.join(', ')}`);
        if (type) console.log('Type:', type);
    });

prog.command('list', 'List all tasks')
    .action(() => {
        console.log('Listing all tasks:');
        /* ... */
    });

prog.options({
    showVersion: false,
    onMissingFlags: flags => {
        console.error(`Missing required flags: ${flags.join(', ')}`);
    },
});

prog.parse();
```

#### Brackets
When using brackets in command/option name, angled brackets indicate that an argument/value is required, while square brackeds indicate optional arguments.

#### Variadic Arguments

When using 3 dots (`'...'`) in between brackets before or after the last argument/option name, it will accept multiple values and store them in an array, e.g. `<files...>`, `[...todos]`.

## API

### `cli(name?, description?, options?)`

Create the main CLI wrapper.

#### `name`

Type: `String`\
Default: _File name where the CLI was created._

#### `description`

Type: `String`\
Default: `undefined`

Description of your CLI app.

#### `options`

Type: `Object`\
Options for handling unknown or missing arguments and flags, managing help message and version.

##### `showVersion`

Type: `(version: string) => any` | `Boolean`

Custom function that will handle `--version` option or boolean to either enable the default function or disable this option entirely.

Example:

```js
cli('my-cli', 'My CLI app', {
    showVersion: (version) => console.log('current version:', version)
});
```

##### `showHelp`

Type: `(meta: CommandMeta) => any` | `Boolean`

Custom function that will handle `--help` option or boolean to either enable the default function or disable this option entirely.

```ts
interface CommandMeta {
    /** CLI app name. */
    bin: string;
    /** Command name. */
    name: string;
    /** Full command name. (including its parent-commands) */
    command: string;
    description: string;
    /** Sub-commands. */
    commands: Record<string, Command>;
    /** Flags. */
    flags: Record<string, FlagOption>;
    /** Arguments. */
    arguments: Argument[];
    alias: string[];
    examples: string[];
}

interface Argument {
    name: string;
    required: boolean;
    multiple: boolean;
}

interface FlagOption extends Argument {
    readonly type?: 'string' | 'number' | 'boolean' | 'array';
    default?: any;
    description?: string;
    alias?: string[];
}
```

Example:

```js
cli('my-cli', 'My CLI app', {
    showHelp: (meta) => {
        console.log(`${meta.bin}${meta.command} - ${meta.description}`);
        console.log(`Examples:\n${meta.examples.join('\n')}`);
        /* ... */
        process.exit(1);
    }
});
```

##### `onMissingArguments`

Type: `(args: string[]) => any` | `Boolean`

Custom function that will handle missing arguments or boolean to either enable or disable this feature.\
By default it's going to throw `MissingArgumentsError`.

Example:

```js
cli('my-cli', 'My CLI app', {
    onMissingArguments: (args) => console.log('WARN! Missing Arguments:', args.join(', '))
})
```

##### `onMissingFlags`

Type: `(flags: string[]) => any` | `Boolean`

Custom function that will handle missing flags or boolean to either enable or disable this feature.\
By default it's going to throw `MissingFlagsError`.

Example:

```js
cli('my-cli', 'My CLI app', {
    onMissingFlags: (flags) => console.log('WARN! Missing Flags:', flags.join(', '))
})
```

##### `onUnknownArguments`

Type: `(args: string[]) => any`

Custom function that will handle unknown arguments.\
By default it's going to throw `InvalidArgumentsError`.

Example:

```js
cli('my-cli', 'My CLI app', {
    onUnknownArguments: (args) => console.log('WARN! Unknown Arguments:', args.join(', '))
})
```

##### `onUnknownFlags`

Type: `(flags: string[]) => any`

Custom function that will handle unknown flags.\
By default they are going to be ignored.

Example:

```js
cli('my-cli', 'My CLI app', {
    onUnknownFlags: (flags) => console.log('WARN! Unknown Flags:', flags.join(', '))
})
```

##### `exitOnMissingArguments`

Type: `Boolean`\
Default: `true`

Should the program exit if an argument is missing.

##### `exitOnMissingFlags`

Type: `Boolean`\
Default: `true`

Should the program exit if a flag is missing.

### `prog`

Class that has the entire functionality built around it.

```js
import { cli } from 'clittle';

const prog = cli('my-cli');

prog
    .version('1.0.0')
    .describe('My CLI app');

prog
    .command('test <foo>, Test command.')
    .action(({ test }) => {
        /* ... */
    });
```

#### `prog.version(version)`

Set version of your CLI app.

##### `version`
Type: `String`

#### `prog.describe(description)`

Set description of a command.

##### `description`
Type: `String`

#### `prog.example(example)`

Add an example to a command.

##### `example`
Type: `String`

#### `prog.alias(alias)`

Add an alias/aliases to a command.

##### `alias`
Type: `String | String[]`

Example:

```js
command.alias('-f');
// ... or
command.alias(['F']);
```

#### `prog.options(options)`

Alternative way to assign [options](#options).

#### `prog.option(name, flagOptions?)`

Add option flag to the command.

##### `name`

Type: `String`\
Contains information about the option.

The `--name` option is [required](#brackets), available under `-n` alias and has description _'Your name'_.

```js
prog.option('-n, --name <name>, Your name');
```

##### `flagOptions`

Type: `Object`
Some additional options for a given flag.

```ts
interface FlagOption {
    /** Value type. */
    readonly type?: 'string' | 'number' | 'boolean' | 'array';
    /** Default value. */
    default?: any;
    /** Alternative way to add description. */
    description?: string;
    /** Alternative way to add aliases. */
    alias?: string[];
}
```

#### `prog.command(name, description?, CommandOptions?)`

Create new command interface.

##### `name`

Type: `String`\
Contains command name and arguments.

##### `description`

Type: `String`\
Command description.

##### `CommandOptions`

Type: `Object`
Command options.

```ts
interface CommandOptions {
    /** Command alias. */
    alias?: string | string[];
}
```

This command will be available under the name of `'add'` with `'tasks'` as the required [variadic argument](#variadic-arguments).

Example:

```js
// tasks.js
prog
    .command('add <tasks...>', 'Add tasks', { alias: 'a' })
    .action(({ tasks }) => {
        console.log('Added tasks:', tasks.join(', '));
    })
    .parse();
```

```console
$ node tasks.js add "Tidy my room" "Wash the dishes"
Added tasks: Tidy my room, Wash the dishes
```

#### `prog.action(callback)`

Type: `(callback: ActionCallback) => Command`\
Run a callback function when the command is executed. 

```ts
import type { Argv } from 'ofi';

type ParsedArguments = Record<string, any | any[]> & { options: Argv };
type ActionCallback = (args: ParsedArguments) => any;
```

#### `prog.help()`

Display automatically generated help message.

#### `prog.parse(args?, parserOptions?)`

Parse arguments.\
This function should be called after all options, commands etc. are defined.\
Returns: `ParsedArguments`

##### `args`

Type: `string` | `string[]`\
Default: `process.argv.slice(2)`

Arguments to parse.

##### `parserOptions`

Parser [options](https://github.com/mrozio13pl/ofi#options), but [`populate--`](https://github.com/mrozio13pl/ofi#populate--) and [`camelize`](https://github.com/mrozio13pl/ofi#camelize) options are set to `true` by default.

##### `ParsedArguments`

Parsed arguments.

```ts
import type { Argv } from 'ofi';

type ParsedArguments = Record<string, any | any[]> & { options: Argv };
```

##### Other additional properties:

* `prog.name`: _string_ - Command name.
* `prog.description?`: _string_ - Given command description.
* `prog.examples`: _string[]_ - Command examples.
* `prog.aliases`: _string[]_ - Command aliases.
* `prog.version_`: _string_ - CLI version.

## License

MIT 💖