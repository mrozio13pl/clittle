require('ts-node/register');

const { cli } = require('../src/index');

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
        // tasks here
    });

prog.options({
    showVersion: false,
    onMissingFlags: flags => {
        console.error(`Missing required flags: ${flags.join(', ')}`);
    },
});

prog.parse();