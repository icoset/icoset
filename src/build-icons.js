const fs = require('fs');
const SVGO = require('svgo');

module.exports = function buildIcons(iconList = [], { svgoPlugins = {} } = {}) {
  const viewBoxMap = {};
  const processSvgo = Promise.all(iconList.map(icon => {
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
              const viewBoxAttr = file.match(RegExp('viewBox="([^"]*)"'))[0];
              if (viewBoxAttr) {
                viewBox = viewBoxAttr.slice(0, viewBoxAttr.length - 1);
                viewBox = viewBox.slice(viewBox.indexOf('"') + 1);
              }
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
            console.warn('skipped file');
          });
    });
  }));

  return new Promise((resolve) => {
    processSvgo.then((icons) => {
      resolve({
        svg: `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">${icons.join('')}</svg>`,
        viewBoxMap,
      });
    });
  });

}