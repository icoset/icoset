function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}

function buildName(fullPath, optionName = '[name]') {
  const nameOptions = optionName
    .match(/\[(.*?)]/g)
    .map(opt => opt
      .replace(/[[\]]/g, '')
    )
  const name = fullPath
    .slice(fullPath.lastIndexOf('/') + 1)
    .replace(/\.svg/, '')
    .replace(/\s+/, '-')
    .replace(/[\-/._]/g, '-');

  const dir = fullPath
    .slice(1, fullPath.lastIndexOf('/'))
    .replace(/\s+/, '-')
    .replace(/[\-/_]/g, '-');

  let newName = nameOptions.map(option => {
    switch (option) {
      case 'dir':
        return dir;
      case 'name':
        return name;
    }
    return '';
  }).filter(option => option).join('-');

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
  removeAttrs: { attrs: '(id|class|style)' },
};

module.exports = {
  isFunction,
  buildName,
  svgoDefaultConfig,
};