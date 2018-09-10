const path = require('path');
const walk = require('./walk');

module.exports = function constructData(data) {
  return new Promise((resolve) => {
    let rules;
    if (!data.configPath && data.svgPath) {
      // zero config
      data.config = {};
      rules = { icons: ['*'], directory: data.svgPath };
    } else {
      rules = data.config.rules;
    }
    // rules should be an object
    if (typeof rules !== 'object') {
      throw Error('Icon configuration should be an Object or an Array.');
    }
    /** single config **/
    // put it in an array and handle it like a collection
    if (!Array.isArray(rules)) {
      rules = [rules];
    }

    // use presets to build directory paths
    rules = rules.map(rule => {
      if (rule.preset) {
        let directoryPath;
        try {
          directoryPath = require(rule.preset)();
        } catch (e) {
          throw Error(e);
        }
        rule.directory = path.join(
          appRoot,
          'node_modules',
          rule.preset,
          directoryPath
        );
      }
      return rule;
    });

    Promise.all(rules.map(rule => {
      return walk(
        path.resolve(path.relative(process.cwd(), rule.directory)),
        data.preserveFolderNames || data.config.preserveFolderNames,
        rule.icons
      );
    }))
      .then(
        (icons) => {
          resolve({
            ...data,
            config: {
              ...data.config,
              rules: rules.map((rule, index) => {
                rule.icons = [...icons[index]];
                return rule;
              }),
            },
          });
        },
        (err) => {
          throw Error(err);
        }
      );
  });
}
