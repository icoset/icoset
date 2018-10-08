const fs = require('fs');
const path = require('path');
const { buildName } = require('./utils');

const isSvg = (svg) => {
  if (typeof svg === 'object') return true;
  return svg.slice(svg.lastIndexOf('.')) === '.svg';
};

/**
 * Walk
 * Take a stroll through all files/sub-folders to find svgs
 */
module.exports = function walk({ directory, deepFind = false, name = '[name]', icons = ['*'] } = {}) {
  function buildIconObj(icon) {
    if (typeof icon === 'object') return icon;
    const relativeIconPath = icon.replace(RegExp(directory, 'g'), '');
    const { newName, originalName } = buildName(relativeIconPath, name);
    return {
      path: icon,
      name: newName,
      originalName,
    };
  }

  function iterate(dir, done) {
    let results = [];
    fs.readdir(dir, function(err, list) {
      if (err) return done(err);
      let pending = list.length;
      if (!pending) return done(null, results);
      list.forEach(function(file) {
        file = path.resolve(dir, file);
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            iterate(file, function(err, res) {
              // could be a file or a directory
              results = results.concat(res.filter(isSvg).map(buildIconObj));
              if (!--pending) done(err, results);
            });
          } else {
            // is a file
            if (isSvg(file)) results.push(buildIconObj(file));
            if (!--pending) done(err, results);
          }
        });
      });
    });
  }

  function buildResults(results, resolve) {
    if (results.length === 0 || icons.length === 0 || (icons.length === 1 && icons[0] === '*')) {
      resolve(results.map(item => ({
        path: item.path,
        name: item.name,
      })));
    } else {
      const newResults = results.filter(newIcon => {
        return icons.find(icon => icon === newIcon.originalName);
      });
      resolve(newResults.map(item => ({
        path: item.path,
        name: item.name,
      })));
    }
  }

  return new Promise((resolve) => {
    if (deepFind) {
      iterate(directory, (err, results) => {
        if (err) throw Error(err);
        buildResults(results, resolve);
      });
    } else {
      fs.readdir(directory, function(err, list) {
        if (err) throw Error(err);
        const results = list.filter(isSvg).map(icon => buildIconObj(`${directory}/${icon}`));
        buildResults(results, resolve);
      });
    }
  });
}