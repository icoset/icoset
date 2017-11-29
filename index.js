#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const program = require('commander');
const htmlClean = require('htmlclean');
const cheerio = require('cheerio');
require('colors');

const iconTemplate = require('./src/icon-template');

let outputPath,
    filePath,
    fileName,
    extension,
    outputMap = {},
    outputFileName = 'icon-symbols.js',
    defaultOptions = {
      family: 'material',
      directory: '',
      map: true,
      prepend: false,
      icons: []
    };

// start read line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.write('Building Icons...');

runProgram()
    .then(getFile)
    .then(constructData)
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
        .action(function(file) {

          // normalize file path (includes file name)
          filePath = `/${path.relative('/', path.normalize(file))}`;
          let filePathParsed = path.parse(filePath);

          // extension
          if (file.lastIndexOf('.') > -1) {
            extension = file.slice(file.lastIndexOf('.')+1);
          } else {
            reject(`<file> must be a JSON or JS file`);
            return;
          }
          if (extension !== 'js' && extension !== 'json') {
            reject(`<file> must be a JSON or JS file`);
            return;
          }

          // file name
          fileName = filePathParsed.name + filePathParsed.ext;

          // output path
          if (program.output) {
            outputPath = `/${path.relative('/', path.normalize(program.output))}`;
          } else {
            outputPath = filePathParsed.dir;
          }
        })
        .parse(process.argv);

    if (!filePath) {
      reject(`<file> is required`);
      return;
    }
    resolve();
  });
}


/**
 * Get File
 * get file depending on extension
 * @return {Promise} resolves the file contents
 */
function getFile() {
  return new Promise((resolve, reject) => {
    // read json file
    if (extension === 'json') {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(`Could not open "${filePath}".`, err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    }

    // require module
    else if (extension === 'js') {
      resolve(require(filePath));
    }
  });
}


/**
 * Construct Data
 * build icon collection based on file config
 * @param data {Object}
 * @return {Promise}
 */
function constructData(data) {
  return new Promise((resolve, reject) => {
    // data should be an object
    if (typeof data !== 'object') {
      reject('Icon configuration should be an "Object" or "Array" type.');
      return;
    }

    // if set is a collection, make sure all configs have a prepend
    if (data.length && data.filter(config => typeof config.prepend === 'string').length !== data.length) {
      reject('A collection of icon configs requires option "prepend" to avoid naming collisions');
      return;
    }

    /** single config **/
    // put it in an array and handle it like a collection
    if (data && data.icons) {
      data = [data];
    }

    /** collection of configs **/
    if (data && data.length) {
      data = data.map(config => {
        // tack on default options
        let currentConfig = Object.assign({}, defaultOptions, config);

        if (!currentConfig.directory) {
          switch (currentConfig.family) {
            case 'weather': // /weather-icons/svg
              currentConfig.directory = path.resolve(__dirname, 'node_modules', 'weather-icons', 'svg');
              break;
            case 'material': // /mdi-svg/svg
              currentConfig.directory = path.resolve(__dirname, 'node_modules', 'mdi-svg', 'svg');
              break;
          }
        }

        let iconSet;
        if (currentConfig.icons && currentConfig.icons.length === 1 && currentConfig.icons[0] === '*') {
          iconSet = fs.readdirSync(currentConfig.directory, {encoding: 'utf8'}, function (err, filenames) {
            if (err) {
              reject(err);
            }
            return filenames;
          });
          iconSet = iconSet.map(icon => {
            return icon.replace('.svg', '');
          });
          currentConfig.icons = iconSet;
        }
        return currentConfig;
      });
      resolve(data);
    } else {
      reject(badDataError)
    }
  });
}


/**
 * Build Icons
 * @param data {Array}
 * @return {Promise.<*[]>}
 */
function buildIcons(data) {
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