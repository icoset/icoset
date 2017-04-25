#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const iconMap = require('./icon-map');
const program = require('commander');
const htmlClean = require('htmlclean');
const cheerio = require('cheerio');

let iconFamily = 'material',
    icons = [],
    outputPath = './',
    filePath;

// declare program
program
    .description(`Command line tool for quickly building icon sets`)
    .arguments('<file> [path]')
    .option(`-O, --output [path]`, `Set output path. Defaults to <file> location.`)
    .option(`-I, --icon-family [icon-family]`, `Declare an Icon Family. Defaults to "material".`)
    .action(function(file) {
      filePath = file;
    })
    .parse(process.argv);


// get things going
getIconsFromFile(filePath)
    .then(res => {
      return buildIcons(res, setDefaultIconFamily(program.iconFamily));
    })
    .then(res => {

    });


function buildIcons(icons, iconFamily) {
  return new Promise((resolve, reject) => {
    let iconMap = icons.map(icon => {
      return path.resolve(__dirname, 'icons', iconFamily, `${icon}.svg`);
      return 'here';
    });
    console.log(iconMap)
    resolve('hey')
  });
}


function getIconsFromFile(filePath) {
  return new Promise((resolve, reject) => {
    let ext = filePath.slice(filePath.lastIndexOf('.')+1);
    if (ext == 'js') {
      resolve(require(`./${filePath}`));
    } else if (ext == 'json') {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`Could not open <file>. Process stopped because of Error.`, err);
          reject(JSON.parse(data));
        } else {
          resolve(JSON.parse(data));
        }
      });
    } else {
      console.error(`<file> must be a valid JSON array or a node module (module.exports = []`)
    }
  });
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