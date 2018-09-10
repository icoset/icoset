const fs = require('fs');
const path = require('path');

module.exports = function getConfig(data) {
  return new Promise((resolve) => {
    if (data.svgPath) {
      try {
        fs.accessSync(data.svgPath);
        resolve(data);
        return;
      } catch (e) {
        throw Error(`svgPath "${data.originalSvgPath}" doesn't exist.`);
      }
    }

    const configPath = data.configPath || `${appRoot}/icoset.config.js`;
    const parsedConfig = path.parse(configPath);

    if (parsedConfig.ext !== '.js' && parsedConfig.ext !== '.json') {
      throw Error(`Config file must be a *.json or *.js file type`);
    }

    // read json file
    const errMessage = `No config! Try adding a config file (${parsedConfig.base}) to the root of your app.`;
    if (parsedConfig.ext === '.json') {
      fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
          throw Error(errMessage);
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
          configPath,
        });
      } catch (e) {
        throw Error(errMessage);
      }
    }
  });
};