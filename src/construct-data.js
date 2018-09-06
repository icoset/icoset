const fs = require('fs');
const path = require('path');
const iconFamilyMap = require('./icon-family-map');

const defaultOptions = {
  family: 'material',
  directory: '',
  map: true,
  prepend: false,
  icons: []
};

/**
 * Construct Data
 * build icon collection based on file config
 * @param data {Object}
 * @return {Promise}
 */
module.exports = function constructData(data) {
  return new Promise((resolve, reject) => {
    let config = data.config;
    // data should be an object
    if (typeof config !== 'object') {
      reject('Icon configuration should be an Object or an Array.');
      return;
    }

    // if set is a collection, make sure all configs have a prepend
    if (config.length && config.filter(config => typeof config.prepend === 'string').length !== config.length) {
      reject('A collection of icon configs requires option "prepend" to avoid naming collisions');
      return;
    }

    /** single config **/
    // put it in an array and handle it like a collection
    if (config && config.icons) {
      config = [config];
    }

    // TODO: we shouldn't hard code svg library-things...
    // I'm thinking we should create "mapping" npm packages that gives this
    // module something to point to...
    // EG:
    // @ico/core
    // @ico/preset-mdi
    // @ico/preset-weather-icons

    // validate family names
    let invalidFamilyNames = config.filter(config => !iconFamilyMap[config.family] && !config.directory);
    if (invalidFamilyNames.length) {
      reject(`Invalid icon family [${invalidFamilyNames.map(config => config.family || '?').join(', ')}] - available sets: [${Object.keys(iconFamilyMap).join(', ')}]`);
      return;
    }

    /** collection of configs **/
    if (config && config.length) {
      config = config.map(config => {
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
      resolve(config);
    } else {
      reject(badDataError)
    }
  });
}
