const path = require('path');

module.exports = function getPath(nodeModulesPath) {
  return {
    directory: path.resolve(nodeModulesPath, 'devicon-2.2/icons'),
    deepFind: true,
  };
}