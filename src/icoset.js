#!/usr/bin/env node
const path = require('path');
const readline = require('readline');
const program = require('commander');
require('colors');

const getConfig = require('./get-config');
const constructData = require('./construct-data');
const buildIcons = require('./build-icons');
const buildFile = require('./build-file');

let defaultOutputName = 'icon-symbols.js';

// start read line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const nextLine = (line) => {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0, null);
  if (line) {
    rl.write(line);
  }
}

/**
 * Run Program
 * run commander and setup paths and things
 * @return {Promise}
 */
function runProgram() {
  return new Promise((resolve) => {
    program
      .description(`Command line tool for quickly building icon sets`)
      .option(`-C, --config [config]`, `Point to the config file. Defaults to "icoset.config.js" for zero-config.`)
      .option(`-S, --svgPath [svgPath]`, `Point to the svg folder. Only for zero-config setup.`)
      .option(`-O, --outputPath [outputPath]`, `Set output path. Defaults to the config location.`)
      .option(`-N, --outputName [outputName]`, `Set output name. Defaults to "${defaultOutputName}".`)
      .option(`-P, --preserveFolderNames [preserveFolderNames]`, `Preserve folder names in the icon names (/folder/icon.svg becomes 'folder-icon.svg'. Default is false.`)
      .option(`-M, --viewBoxMap [viewBoxMap]`, `Generate map of all the icon viewBox's. Useful when working with the "use" tag.`)
      .action(() => {
        const configPath = program.config
          ? path.resolve(path.relative(process.cwd(), program.config))
          : false;
        const svgPath = program.svgPath
          ? path.resolve(path.relative(process.cwd(), program.svgPath))
          : false;
        const outputPath = program.outputPath
          ? path.resolve(path.relative(process.cwd(), program.outputPath))
          : false;
        const outputName = program.outputName || false;
        const preserveFolderNames = !!program.preserveFolderNames;
        const viewBoxMap = !!program.viewBoxMap;
        return resolve({
          configPath,
          svgPath,
          originalSvgPath: program.svgPath,
          outputPath,
          outputName,
          preserveFolderNames,
          viewBoxMap,
          defaultOutputName,
        });

      })
      .parse(process.argv);
  });
}

rl.write('Building Icons...');

// run!
runProgram()
  .then((data) => {
    nextLine('Getting Config...');
    return getConfig(data)
  })
  .then((data) => {
    nextLine('Constructing Data...');
    return constructData(data);
  })
  .then((data) => {
    nextLine('Building Icon Sets...');
    return buildIcons(data);
  })
  .then((data) => {
    nextLine('Writing New File...');
    return buildFile(data);
  })
  .then((data) => {
    nextLine();
    data.consoleMap.forEach(message => console.log(message));
    console.log('Success!'.bgGreen.black);
    rl.close();
  })
  .catch((err) => {
    nextLine();
    console.log(`[IcoSet Error] ${err.stack}`.red);
    rl.close();
  });