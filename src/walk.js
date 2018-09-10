const fs = require('fs');
const path = require('path');
require('colors');

const isSvg = (svg) => {
  if (typeof svg === 'object') return true;
  return svg.slice(svg.lastIndexOf('.')) === '.svg';
};

/**
 * Walk
 * Take a stroll through all files/sub-folders to find svgs
 * @param {string} dir
 * @param {boolean=} preserveFolderNames
 * @param {array=} iconList
 * @return {Promise} => collection of icons
 */
module.exports = function walk(dir, preserveFolderNames = false, iconList = []) {
  const buildIconObj = (icon) => {
    if (typeof icon === 'object') return icon;
    const name = icon.slice(icon.lastIndexOf('/') + 1).replace(/\.svg/, '');
    if (preserveFolderNames) {
      return {
        fullName: icon
          .replace(RegExp(dir, 'g'), '')
          .slice(1)
          .replace(/\//g, '-'),
        path: icon,
        name,
      };
    } else {
      return {
        fullName: icon
          .slice(icon.lastIndexOf('/') + 1),
        path: icon,
        name,
      };
    }
  }

  const iterate = (_dir, _done) => {
    let results = [];
    fs.readdir(_dir, function(err, list) {
      if (err) return _done(err);
      let pending = list.length;
      if (!pending) return _done(null, results);
      list.forEach(function(file) {
        file = path.resolve(_dir, file);
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            iterate(file, function(err, res) {
              results = results.concat(res.filter(isSvg).map(buildIconObj));
              if (!--pending) _done(err, results);
            });
          } else {
            if (isSvg(file)) results.push(buildIconObj(file));
            if (!--pending) _done(err, results);
          }
        });
      });
    });
  }

  return new Promise((resolve, reject) => {
    iterate(dir, (err, results) => {
      if (err && !results) {
        reject(err);
      } else if (
        results.length === 0 ||
        iconList.length === 0 ||
        (iconList.length === 1 && iconList[0] === '*')
      ) {
        resolve(results);
      } else {
        const newResults = results.filter(icon => {
          return iconList.indexOf(icon.name) > -1;
        });
        resolve(newResults);
      }
    });
  });
}