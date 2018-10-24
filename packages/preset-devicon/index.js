const path = require('path');

module.exports = function getPath() {
  return {
    directory: path.resolve(__dirname, '../../devicon-2.2/icons'),
    deepFind: true,
  };
}