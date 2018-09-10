const fs = require('fs');
const path = require('path');

module.exports = function buildFile(data) {
  const mapTemplate = 'export const iconMap = __iconMap__;\n';
  const iconTemplate = 'export const icons = `__svgSymbols__`;';

  return new Promise((resolve) => {
    // add the svg and iconMap into the template
    let template = iconTemplate.replace(/__svgSymbols__/, data.svg);
    if (Object.keys(data.viewBoxMap).length > 0) {
      template = mapTemplate.replace(/__iconMap__/, JSON.stringify(data.viewBoxMap)) + template;
    }
    const outputPath = data.outputPath ||
      data.config.outputPath ||
      (data.configPath ? path.dirname(data.configPath) : false) ||
      process.cwd();
    const outputName = data.outputName || data.config.outputName || data.defaultOutputName;
    fs.writeFile(`${outputPath}/${outputName}`, template, err => {
      if (err) {
        throw Error(err);
      } else {
        resolve(data);
      }
    });
  });
}