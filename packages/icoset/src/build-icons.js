const fs = require('fs');
const SVGO = require('svgo');
const { getAttrVal } = require('./utils');

module.exports = function buildIcons(iconGroups = [], { svgoPlugins = {} } = {}) {
  const viewBoxMap = {};
  const processIconSet = Promise.all(
    iconGroups.reduce((newList, iconList) => {
      return newList.concat(iconList.map(icon => {
        return new Promise((resolveSvgo) => {
          let file;
          try {
            file = fs.readFileSync(icon.path, 'utf8');
          } catch (e) {
            throw Error(e);
          }
          file = file.replace(/viewbox/, 'viewBox');
          const svgo = new SVGO({
            plugins: Object.keys(svgoPlugins)
              .map(key => ({ [key]: svgoPlugins[key] }))
          });
          svgo.optimize(file)
            .then(optimizedFile => {
                file = optimizedFile.data;
                let viewBox = '';
                if (file.includes('viewBox')) {
                  viewBox = getAttrVal(file, 'viewBox');
                } else if (file.includes('width') && file.includes('height')) {
                  const height = getAttrVal(file, 'height');
                  const width = getAttrVal(file, 'width');
                  viewBox = width && height ? `0 0 ${width} ${height}` : '';
                }
                viewBoxMap[icon.name] = { viewBox };
                file = file
                  .replace(/svg>/g, 'symbol>')
                  .replace(/<svg/g, '<symbol')
                  .replace('<symbol', `<symbol id="${icon.name}"`);
                resolveSvgo(file);
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