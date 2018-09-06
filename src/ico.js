#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const program = require('commander');
const htmlClean = require('htmlclean');
const cheerio = require('cheerio');
require('colors');

const { walk, getFile } = require('./utils');
const constructData = require('./construct-data');
const iconTemplate = require('./icon-template');

let outputPath,
    filePath,
    configName,
    outputMap = {},
    outputFileName = 'icon-symbols.js';

// start read line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.write('Building Icons...');

runProgram()
  .then((...args) => {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0, null);
    rl.write('Getting File...');
    return getFile(...args)
  })
  .then((...args) => {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0, null);
    rl.write('Constructing Data...');
    return constructData(...args);
  })
  .then(buildIcons)
  .then(buildFile)
  .then(() => {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0, null);
    console.log('Success!'.green);
    rl.close();
  })
  .catch(err => {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0, null);
    console.log(`[ico Error] ${err}`.red);
    rl.close();
  });

/**
 * Run Program
 * run commander and setup paths and things
 * @return {Promise}
 */
function runProgram() {
  return new Promise((resolve, reject) => {
    program
      .description(`Command line tool for quickly building icon sets`)
      .arguments('<file> [path]')
      .option(`-O, --output [output]`, `Set output path. Defaults to <file> location.`)
      .action((file) => processFile(file, resolve, reject))
      .parse(process.argv);
  });
}

function processFile(file, resolve, reject) {
  const filePath = path.resolve(path.relative(process.cwd(), file));
  const filePathParsed = path.parse(filePath);
  const configName = filePathParsed.base;
  const outputPath = program.output
    ? path.resolve(path.relative(process.cwd(), program.output))
    : filePathParsed.dir;

  if (filePathParsed.ext !== '.js' && filePathParsed.ext !== '.json' && filePathParsed.base !== '.icorc') {
    reject(`<file> must be a JSON, JS or .icorc file`);
  }
  if (!filePath) reject(`<file> is required`);
  resolve({ configName, filePath, outputPath });
}



/**
 * Build Icons
 * @param data {Array}
 * @return {Promise.<*[]>}
 */
function buildIcons(data) {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0, null);
  rl.write('Building Icon Sets...');

  return Promise.all(data.map(config => {
    return new Promise((resolve, reject) => {
      let iconMap = config.icons.map(icon => {
        let file;
        let retrieveIconName;
        let iconName = icon;
        // weather icons have a prepended 'wi-' on the file names
        // need to add that to get the right file
        if (config.family === 'weather') {
          retrieveIconName = `wi-${iconName}`;
        } else {
          retrieveIconName = iconName;
        }
        file = fs.readFileSync(path.resolve(config.directory, `${retrieveIconName}.svg`), 'utf8');
        // remove common svg nonsense
        file = file.replace(/<\?xml(.*?)>|<!DOCTYPE(.*?)>|^ /g, '');
        file = file.replace(/<style(.*?)>*<\/style>/g, '');
        file = file.replace(/svg/g, 'symbol');
        $ = cheerio.load(file, {
          normalizeWhitespace: true,
          decodeEntities: false
        });
        // remove all fills / styles
        $('[fill]').removeAttr('fill');
        $('[style]').removeAttr('style');
        let symbol = $('symbol');
        // remove all symbol attributes except viewBox
        let viewBox = symbol[0].attribs.viewbox;
        symbol[0].attribs = {};
        if (viewBox) {
          symbol[0].attribs.viewbox = viewBox;
        }

        if (config.prepend) {
          iconName = `${config.prepend}-${iconName}`
        }

        if (config.map) {
          outputMap[iconName] = { viewBox };
        }

        symbol.attr('id', iconName);
        return $.html();
      });
      // wrap symbols in svg
      let svg = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">${iconMap.join('')}</svg>`;
      resolve(htmlClean(svg));
    });
  }));
}

/**
 * Build File
 * @param svg {String}
 * @return {Promise}
 */
function buildFile(svg) {
  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0, null);
  rl.write('Writing New File...');

  return new Promise((resolve, reject) => {
    // add the svg and iconMap into the template
    let template = iconTemplate.replace(/__svgSymbols__/, svg.join(''));
    if (Object.keys(outputMap).length > 0 && outputMap.constructor === Object) {
      template = template.replace(/__iconMap__/, JSON.stringify(outputMap));
    } else {
      template = template.replace(/__iconMap__/, '{}');
    }
    fs.writeFile(`${outputPath}/${outputFileName}`, template, err => {
      if (err) {
        throw err
      } else {
        resolve();
      }
    });
  });
}