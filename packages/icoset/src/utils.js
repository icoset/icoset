function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}

function getAttrVal(str, attr) {
  const newStr = str.match(RegExp(`${attr}="([^"]*)"`))[0];
  return newStr ? newStr.match(/"(.*?)"/g)[0].slice(1).slice(0, -1) : '';
}

function buildName(fullPath, namePrependDirectory = false, namePrependCustom = '', nameRemovePattern = '') {
  const name = fullPath
    .slice(fullPath.lastIndexOf('/') + 1)
    .replace(/\.svg/, '')
    .replace(/\s+/, '-')
    .replace(/[\-/._]/g, '-');

  const directory = fullPath
    .slice(1, fullPath.lastIndexOf('/'))
    .replace(/\s+/, '-')
    .replace(/[\-/_]/g, '-');

  let newName = name;
  if (nameRemovePattern) {
    const pattern = new RegExp(nameRemovePattern, 'g');
    newName = newName.replace(pattern, '') || name;
  }
  if (namePrependDirectory) newName = `${directory}-${newName}`;
  if (namePrependCustom) newName = `${namePrependCustom}-${newName}`;

  return {
    newName,
    originalName: name,
  };
}

const svgoDefaultConfig = {
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
  removeAttrs: { attrs: '(id|class|style|fill)' },
};

module.exports = {
  isFunction,
  getAttrVal,
  buildName,
  svgoDefaultConfig,
};