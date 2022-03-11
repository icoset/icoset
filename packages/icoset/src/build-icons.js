const fs = require('fs');
const { optimize } = require('svgo');

module.exports = function buildIcons(iconGroups = [], options = []) {
  const processIconSet = Promise.all(
    iconGroups.reduce((newList, iconList, listIndex) => {
      let svgoConfig = options[listIndex] && options[listIndex].svgoConfig;
      return newList.concat(iconList.map(icon => {
        return new Promise((resolveSvgo) => {
          let file;
          try {
            file = fs.readFileSync(icon.path, 'utf8');
          } catch (e) {
            console.warn(`[icoset] Unable to read svg at path: "${icon.path}"`);
            console.warn('[icoset] skipped file');
            resolveSvgo('');
          }
          // bypass svgo rule for ignoring comments
          file = file.replace('<!--!', '<!--');
          try {
            const result = optimize(file, svgoConfig || {
              plugins: ['preset-default'],
            });
            let newFile = result.data;
            newFile = newFile
              .replace(/svg>/g, 'symbol>')
              .replace(/<svg/g, `<symbol id="${icon.name}"`);
            resolveSvgo(newFile);
          } catch (e) {
            console.warn(`[icoset] Unable to parse svg: "${icon.path}"`);
            console.warn('[icoset] skipped file');
            console.warn(e);
            resolveSvgo('');
          }
        });
      }));
    }, [])
  );

  return new Promise((resolve) => {
    processIconSet.then((icons) => {
      resolve(`<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">${icons.join('')}</svg>`);
    });
  });
}
