const fs = require('fs');
const SVGO = require('svgo');

const defaultSvgoConfig = {
  floatPrecision: 2,
  removeDoctype: true,
  removeXMLProcInst: true,
  removeComments: true,
  removeMetadata: true,
  removeEditorsNSData: true,
  cleanupAttrs: true,
  removeStyleElement: true,
  removeUselessDefs: true,
  cleanupNumericValues: true,
  removeUnknownsAndDefaults: true,
  collapseGroups: true,
  removeUselessStrokeAndFill: true,
  cleanupEnableBackground: true,
  removeHiddenElems: true,
  removeEmptyText: true,
  convertShapeToPath: true,
  removeEmptyAttrs: true,
  removeViewBox: false,
  removeEmptyContainers: true,
  removeUnusedNS: true,
  removeTitle: true,
  removeDesc: true,
  removeDimensions: true,
  removeAttrs: { attrs: '(id|class|style)' },
};

const iconMap = {};
let consoleMap = [];
const mapCheck = (name) => {
  const base = name.slice(0, name.lastIndexOf('.'));
  if (iconMap[base] >= 1) {
    iconMap[base] += 1;
    const newName = `${base}-${iconMap[base]}`;
    consoleMap.push(`Duplicate svg name "${name}" changed to "${newName}."`);
    consoleMap.push(`Consider de-duping your icon names or using the "preserveFolderNames" option.`);
    return newName;
  } else {
    iconMap[base] = 1;
    return name.replace(/\.svg$/, '');
  }
}

module.exports = function buildIcons(data) {
  const viewBoxMap = {};
  const processRules = Promise.all(data.config.rules.map(rule => {
    return new Promise((resolve) => {

      Promise.all(rule.icons.map(icon => {
        return new Promise((resolveSvgo) => {
          let file;
          try {
            file = fs.readFileSync(icon.path, 'utf8');
          } catch (e) {
            throw Error(e);
          }
          file = file.replace(/viewbox/, 'viewBox');
          const svgoPlugins = icon.svgoPlugins || defaultSvgoConfig;
          const svgo = new SVGO({
            plugins: Object.keys(svgoPlugins)
              .map(key => ({ [key]: svgoPlugins[key] }))
          });
          svgo.optimize(file).then(optimizedFile => {
            file = optimizedFile.data;
            let iconName = mapCheck(icon.fullName);
            if (rule.prepend) {
              iconName = `${rule.prepend}${iconName}`
            }
            let viewBox = file.match(RegExp('viewBox="([^"]*)"'))[0];
            if (viewBox && (data.viewBoxMap || data.config.viewBoxMap)) {
              viewBox = viewBox.slice(0, viewBox.length - 2);
              viewBox = viewBox.slice(viewBox.indexOf('"') + 1);
              viewBoxMap[iconName] = { viewBox };
            }
            file = file
              .replace(/svg>/g, 'symbol>')
              .replace(/<svg/g, '<symbol')
              .replace('<symbol', `<symbol id="${iconName}"`);

            resolveSvgo(file);
          }, (err) => {
            throw Error(err);
          });
        });
      })).then(icons => resolve(icons));
    });
  }));

  return new Promise((resolve) => {
    processRules.then((icons) => {
      resolve({
        ...data,
        svg: `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">${
          icons.join('')
        }</svg>`,
        viewBoxMap,
        consoleMap,
      });
    });
  });

}