import { row } from 'minicolumns';
import { bold, DEFAULT } from '../utils';
import type { Command } from '../command';

export default function renderHelp(bin: string, fullcommandname: string, meta: Command, subcommands: Command['subs'], flags: Command['flags'], args: Command['args']): void {
    // Usage
    const usage = `${bold('Usage')}
  $ ${bin}${
    meta.name !== DEFAULT ? fullcommandname : ''
}${
    Object.keys(flags).length ? ' [flags...]' : ''
}${
    args.length ? ' ' + args.map(({ name, multiple, required }) => {
        if (multiple) name += '...';
        name = required ? '<' + name + '>' : '[' + name + ']';
        return name;
    }).join(' ') : ''
}`;

    // Description
    const description = meta.description ? meta.description + '\n\n' : '';

    // Commands
    const commands_table = Object.keys(subcommands).map(cmdname => {
        const command = subcommands[cmdname];

        return [
            '  ' + command.name,
            command.description || ''
        ];
    });
    const commands = commands_table.length ? `${bold('Commands')}\n${row(commands_table, { separator: '    ' })}\n\n` : '';

    // Options
    const flags_table = Object.keys(flags).map(flagname => {
        const flag = flags[flagname]
            , alias = flag.alias?.map(alias => '-' + alias).join(', ') || ''
            , desc = (flag.description ? flag.description + ' ' : '') + (flag.default ? `(default: '${flag.default}')` : '');

        let name = flag.name || '';

        if (name) {
            if (flag.multiple) name += '...';
            name = ' ' + (flag.required ? '<' + name + '>' : '[' + name + ']');
        }

        return [
            '  ' + (alias.length ? alias + ', ' : '') + '--' + flagname + name,
            desc
        ];
    });
    const options = flags_table.length ? `${bold('Options')}\n${row(flags_table, { separator: '    ' })}\n` : '';

    // Examples
    const examples = meta.examples.length ? `${bold('Examples')}\n  ${meta.examples.join('\n  ')}\n` : '';

    /**
     * Display help.
     */
    console.log(`${bin}

${usage}

${description}${commands}${options}
${examples}`);
}