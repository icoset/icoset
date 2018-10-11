const fs = require('fs');
const SVGO = require('svgo');
const { getAttrVal } = require('./utils');

module.exports = function buildIcons(iconGroups = [], options = []) {
  const viewBoxMap = {};
  const processIconSet = Promise.all(
    iconGroups.reduce((newList, iconList, listIndex) => {
      let svgoPlugins = {};
      if (options[listIndex] && options[listIndex].svgoPlugins) svgoPlugins = options[listIndex].svgoPlugins;
      return newList.concat(iconList.map(icon => {
        return new Promise((resolveSvgo) => {
          let file;
          try {
            file = fs.readFileSync(icon.path, 'utf8');
          } catch (e) {
            throw Error(e);
          }
          file = file.replace(/viewbox/, 'viewBox');
          const opts = {
            plugins: Object.keys(svgoPlugins)
              .map(key => ({ [key]: svgoPlugins[key] }))
          };
          const svgo = new SVGO(opts);
          svgo.optimize(file)
            .then(optimizedFile => {
                let newFile = optimizedFile.data;
                let viewBox = '';
                if (newFile.includes('viewBox')) {
                  viewBox = getAttrVal(newFile, 'viewBox');
                } else if (newFile.includes('width') && newFile.includes('height')) {
                  const height = getAttrVal(newFile, 'height');
                  const width = getAttrVal(newFile, 'width');
                  viewBox = width && height ? `0 0 ${width} ${height}` : '';
                }
                viewBoxMap[icon.name] = { viewBox };
                newFile = newFile
                  .replace(/svg>/g, 'symbol>')
                  .replace(/<svg/g, `<symbol id="${icon.name}"`);
                resolveSvgo(newFile);
              },
              (err) => {
                console.warn(`[icoset] Unable to parse svg: "${icon.path}"`);
                console.warn('[icoset] skipped file');
                resolveSvgo('');
              });
        });
      }));
    }, [])
  );

  return new Promise((resolve) => {
    processIconSet.then((icons) => {
      resolve({
        svg: `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">${icons.join('')}</svg>`,
        viewBoxMap,
      });
    });
  });

}