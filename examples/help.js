require('ts-node/register');

const { cli } = require('../src/index');

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