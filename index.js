#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const iconMap = require('./src/icon-map');
const iconTemplate = require('./src/icon-template');
const program = require('commander');
const htmlClean = require('htmlclean');
const cheerio = require('cheerio');

let iconFamily = 'material',
    icons = [],
    outputPath,
    fileType = 'ts',
    filePath;

// declare program
program
    .description(`Command line tool for quickly building icon sets`)
    .arguments('<file> [path]')
    .option(`-O, --output [output]`, `Set output path. Defaults to <file> location.`)
    .option(`-I, --icon-family [icon-family]`, `Declare an Icon Family. Defaults to 'material'.`)
    .option(`-T, --file-type [file-type]`, `Declare file type (js or ts). Defaults to 'ts'.`)
    .option(`-E, --export-type [export-type]`, `Declare module export syntax (umd, commonjs, es6). Defaults to 'es6'.`)
    .action(function(file) {
      filePath = `/${path.relative('/', file)}`;
    })
    .parse(process.argv);

if (!filePath) {
  throw Error(`File is required`);
}

// get things going
getIconsFromFile(filePath)
    .then(iconMap => {
      if (iconMap) {
        outputPath = getOutputPath(program.output);
        icons = iconMap;
        return buildIcons(setDefaultIconFamily(program.iconFamily));
      } else {
        return Promise.reject();
      }
    })
    .then(svg => {
      buildFile(svg);
      // return buildIcons(res)
    })
    .then(res => {
      // console.log(res);
    })
    .catch(err => console.error(err));


function buildFile(svg) {
  return new Promise((resolve, reject) => {
    // add the svg and iconMap into the template
    let template = iconTemplate.replace(/__svgSymbols__/g, svg);
    template = template.replace(/__iconMap__/, JSON.stringify(
        icons.reduce((acc, cur) => {
          acc[cur] = true;
          return acc;
        }, {})
    ));
    fs.writeFile(outputPath, template, err => {
      if (err) throw err;
    });
  });
}

function buildIcons(iconFamily) {
  return new Promise((resolve, reject) => {
    let iconMap = icons.map(icon => {
      let file = fs.readFileSync(path.resolve(__dirname, 'icons', iconFamily, `${icon}.svg`), 'utf8');
      file = file.replace(/<\?xml(.*?)>|<!DOCTYPE(.*?)>|^ /g, '');
      file = file.replace(/svg/g, 'symbol');
      $ = cheerio.load(file, {
        normalizeWhitespace: true,
        decodeEntities: false
      });
      // remove all fills
      $('[fill]').removeAttr('fill');
      let symbol = $('symbol');
      // remove all symbol attributes
      symbol[0].attribs = {};
      symbol.attr('id', icon);
      return $.html();
    });
    // wrap symbols in svg
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">${iconMap.join('')}</svg>`;
    resolve(htmlClean(svg));
  });
}


function getIconsFromFile(filePath) {
  return new Promise((resolve, reject) => {
    let ext = filePath.slice(filePath.lastIndexOf('.')+1);
    if (ext == 'json') {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`Could not open "${filePath}". Process stopped because of Error.`, err);
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    } else {
      console.error(`Error: <file> must be a valid JSON array`);
    }
  }).catch(err => console.error(err));
}

function setDefaultIconFamily(iconFamilyInput) {
  let returnIconFamily = 'material';
  if (iconFamilyInput) {
    if (iconMap[iconFamilyInput]) {
      returnIconFamily = iconFamilyInput;
    } else {
      console.error(`
        "${iconFamilyInput}" is not a valid icon family. Defaulting to "material".`,
          `Available Icon families: ${Object.keys(iconMap).join(', ')}.`
      );
    }
  }
  return returnIconFamily;
}

function getOutputPath(output) {
  let fileName = `svg-symbols.${fileType}`;
  if (output) {
    return `${output}/${fileName}`;
  } else {
    return `${path.parse(filePath).dir}/${fileName}`
  }
}