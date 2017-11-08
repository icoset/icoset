#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const iconMapPrepend = require('./src/icon-map');
const iconTemplate = require('./src/icon-template');
const program = require('commander');
const htmlClean = require('htmlclean');
const cheerio = require('cheerio');

let iconFamily = 'material',
    icons = [],
    outputMap = {},
    outputPath,
    fileType = 'js',
    filePath,
    fileName;

// declare program
program
    .description(`Command line tool for quickly building icon sets`)
    .arguments('<file> [path]')
    .option(`-O, --output [output]`, `Set output path. Defaults to <file> location.`)
    .option(`-I, --icon-family [icon-family]`, `Declare an Icon Family. Defaults to 'material'.`)
    .option(`-T, --file-type [file-type]`, `Declare file type (js or ts). Defaults to 'js'.`)
    .option(`-E, --export-type [export-type]`, `Declare module export syntax (umd, commonjs, es6). Defaults to 'es6'.`)
    .action(function(file) {
      fileName = file;
      filePath = `/${path.relative('/', file)}`;
    })
    .parse(process.argv);

if (!filePath) {
  throw Error(`File is required`);
}

// get things going
getIconsFromFile(filePath).then(
    data => {

      let svgFolder = '';
      let badDataError = `Can't seem to read the contents of ${fileName}`;

      outputPath = getOutputPath(program.output);

      // data should be an object
      if (typeof data !== 'object') throw Error(badDataError);

      /** array of strings **/
      if (data && data.length && typeof data[0] === 'string') {

        // figure out svg directory path
        switch (program.iconFamily) {
          case 'weather': // /weather-icons/svg
            svgFolder = path.resolve(__dirname, 'node_modules', 'weather-icons', 'svg');
            break;
          case 'material': // /mdi-svg/svg
          default:
            svgFolder = path.resolve(__dirname, 'node_modules', 'mdi-svg', 'svg');
            break;
        }

        // use all icons in the svg directory
        if (data && data.length === 1 && data[0] === '*') {
          icons = fs.readdirSync(svgFolder, {encoding: 'utf8'}, function(err, filenames) {
            if (err) {
              throw Error(err);
            }
            return filenames;
          });
          icons = icons.map(icon => {
            return icon.replace('.svg', '');
          });
          return buildIcons([{
            family: setDefaultIconFamily(program.iconFamily),
            directory: svgFolder,
            icons: icons,
            prepend: iconMapPrepend[setDefaultIconFamily(program.iconFamily)]
          }]);
        }

        // use data
        else if (data) {
          outputPath = getOutputPath(program.output);
          icons = data;
          return buildIcons([{
            family: setDefaultIconFamily(program.iconFamily),
            directory: svgFolder,
            icons: icons,
            prepend: iconMapPrepend[setDefaultIconFamily(program.iconFamily)]
          }]);
        }

        else {
          return Promise.reject();
        }
      }

      /** single config **/
      // put it in an array and handle it like a collection
      else if (data && data.icons) {
        data = [data];
      }

      /** collection of configs **/
      if (data && data.length) {
        data.forEach(config => {
          if (!config.directory) {
            switch (config.family) {
              case 'weather': // /weather-icons/svg
                config.directory = path.resolve(__dirname, 'node_modules', 'weather-icons', 'svg');
                break;
              case 'material': // /mdi-svg/svg
                config.directory = path.resolve(__dirname, 'node_modules', 'mdi-svg', 'svg');
                break;
            }
          } else if (!config.prepend) {
            config.prepend = 'custom';
          }

          let iconSet;
          if (config.icons && config.icons.length === 1 && config.icons[0] === '*') {
            iconSet = fs.readdirSync(config.directory, {encoding: 'utf8'}, function (err, filenames) {
              if (err) {
                throw Error(err);
              }
              return filenames;
            });
            iconSet = iconSet.map(icon => {
              return icon.replace('.svg', '');
            });
            config.icons = iconSet;
          }
        });
        return buildIcons(data);

      } else {
        throw Error(badDataError)
      }

    }).then(
        svg => {
          buildFile(svg);
          console.log('Success!');
          // return buildIcons(res)
        }).catch(err => console.error(err));


function buildFile(svg) {
  return new Promise((resolve, reject) => {
    // add the svg and iconMap into the template
    let template = iconTemplate.replace(/__svgSymbols__/g, svg.join(''));
    if (Object.keys(outputMap).length > 0 && outputMap.constructor === Object) {
      template = template.replace(/__iconMap__/, JSON.stringify(outputMap));
    }
    fs.writeFile(outputPath, template, err => {
      if (err) throw err;
    });
  });
}

function buildIcons(configs) {
  return Promise.all(configs.map(config => {
    return new Promise((resolve, reject) => {
      let iconMap = config.icons.map(icon => {
        let file;
        file = fs.readFileSync(path.resolve(config.directory, `${icon}.svg`), 'utf8');
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

        // handle prepended name
        let iconName = icon;
        if (config.prepend) {
          // remove weather's 'wi-' prepended name
          if (config.family === 'weather') {
            iconName = icon.replace('wi-', `${config.prepend}-`);
          } else {
            iconName = `${config.prepend}-${iconName}`
          }
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
 * Get Icons From File
 * @param filePath
 * @return {Promise}
 */
function getIconsFromFile(filePath) {
  return new Promise((resolve, reject) => {
    let ext = filePath.slice(filePath.lastIndexOf('.')+1);

    // read json file
    if (ext === 'json') {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`Could not open "${filePath}". Process stopped because of Error.`, err);
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    }

    // require module
    else if (ext === 'js') {
      resolve(require(filePath));
    }

    // got nothing
    else {
      console.error(`Error: <file> must be a valid JSON array`);
    }
  }).catch(err => {
    throw Error(err);
  });
}

function setDefaultIconFamily(iconFamilyInput) {
  let returnIconFamily = 'material';
  if (iconFamilyInput) {
    if (iconMapPrepend[iconFamilyInput]) {
      returnIconFamily = iconFamilyInput;
    } else {
      console.error(`
        "${iconFamilyInput}" is not a valid icon family. Defaulting to "material".`,
          `Available Icon families: ${Object.keys(iconMapPrepend).join(', ')}.`
      );
    }
  }
  return iconFamilyInput = returnIconFamily;
}

function getOutputPath(output) {
  let fileName = `svg-symbols.${fileType}`;
  if (output) {
    return `${output}/${fileName}`;
  } else {
    return `${path.parse(filePath).dir}/${fileName}`
  }
}