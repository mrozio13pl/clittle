require('ts-node/register');

const prog = require('../src/index').cli('my-cli', 'My CLI example.');

prog
    .option('-f, --files <files...>, List of files to use')
    .option('--name [name], Some name', {
        default: 'joe'
    });

const parsed = prog.parse(process.argv.slice(2));

// output
console.log(parsed);