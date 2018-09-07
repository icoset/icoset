const fs = require('fs');
const path = require('path');

module.exports = function getConfig(data) {
  const configPath = data.configPath;
  return new Promise((resolve, reject) => {
    // read json file
    const parsedConfig = path.parse(configPath);
    if (parsedConfig.ext !== '.js' && parsedConfig.ext !== '.json') {
      reject(`Config file must be a *.json or *.js file type`);
    }
    const errMessage = `No config found! [${parsedConfig.base}]`;
    if (parsedConfig.ext === '.json') {
      fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
          reject(errMessage, err);
        } else {
          resolve({
            ...data,
            config: JSON.parse(data),
          });
        }
      });
    }
    // require module
    else if (parsedConfig.ext === '.js') {
      try {
        const config = require(configPath);
        resolve({
          ...data,
          config,
        });
      } catch (e) {
        reject(errMessage, e);
      }
    }
  });
};