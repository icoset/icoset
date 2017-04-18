#!/usr/bin/env node

const iconMap = require('./icon-map');
const program = require('commander');

program
    .description(`_____          _____           _                 \n |_   _|        / ____|         | |                \n   | |  ___ ___| (___  _   _ ___| |_ ___ _ __ ___  \n   | | / __/ _ \\\\___ \\| | | / __| __/ _ \\ '_ \` _ \\\n  _| || (_| (_) |___) | |_| \\__ \\ ||  __/ | | | | |\n |_____\\___\\___/_____/ \\__, |___/\\__\\___|_| |_| |_|\n                        __/ |\n                       |___/`)

program
    .arguments('<file>')
    .option(`-O, --output [path]`, `Set output path. Defaults to JSON file location.`)
    .option(`-I, --icon-family [icon-family]`, `Declare an Icon Family. Defaults to "material".`);

program.parse(process.argv);

// validate icon family
if (program.iconFamily) {
  if (!iconMap[program.iconFamily]) {
    throw Error(`"${program.iconFamily}" is not a valid icon family. Available Icon families: ${Object.keys(iconMap).join(', ')}.`);
  }
} else {
  program.iconFamily = 'material';
}

console.log(program.iconFamily);