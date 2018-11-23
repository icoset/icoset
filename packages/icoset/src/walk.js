const fs = require('fs');
const path = require('path');
const { buildName } = require('./utils');

/**
 * Walk
 * Take a stroll through all files/sub-folders to find svgs
 */
module.exports = function walk(
  {
    directory,
    deepFind = false,
    namePrependDirectory = false,
    namePrependCustom = '',
    nameRemovePattern = '',
    ignorePattern = '',
    matchPattern = '',
    icons = [],
  } = {}) {
  function buildIconObj(icon) {
    if (typeof icon === 'object') return icon;
    const relativeIconPath = icon.replace(RegExp(directory, 'g'), '');
    const { newName, originalName } = buildName(
      relativeIconPath,
      namePrependDirectory,
      namePrependCustom,
      nameRemovePattern
    );
    return {
      path: icon,
      name: newName,
      originalName,
    };
  }

  const isSvg = (svg) => {
    if (typeof svg === 'object') return true;
    if (svg.slice(svg.lastIndexOf('.')) !== '.svg') return false;
    if (matchPattern) {
      const pattern = new RegExp(matchPattern, 'g');
      if (!svg.match(pattern)) return false;
    }
    if (ignorePattern) {
      const pattern = new RegExp(ignorePattern, 'g');
      if (svg.match(pattern)) return false;
    }
    return true;
  };

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

  function buildResults(results) {
    const returnResults = icons.length && results.length
      ? results.filter(newIcon => {
        return icons.find(icon => icon === newIcon.originalName);
      })
      : results;

    return returnResults.map(item => ({
      path: item.path,
      name: item.name,
    })).concat(icons
      .map(icon => {
        if (typeof icon === 'object') {
          const iconName = Object.keys(icon)[0];
          const iconPath = Object.values(icon)[0];
          if (fs.existsSync(path.resolve(directory, iconPath))) {
            return {
              path: path.resolve(directory, iconPath),
              name: iconName,
            };
          }
        }
        return null
      })
      .filter(icon => icon)
    );
  }

  return new Promise((resolve) => {
    if (deepFind) {
      iterate(directory, (err, results) => {
        if (err) throw Error(err);
        resolve(buildResults(results));
      });
    } else {
      fs.readdir(directory, function(err, list) {
        if (err) throw Error(err);
        const results = list.filter(isSvg).map(icon => buildIconObj(`${directory}/${icon}`));
        resolve(buildResults(results));
      });
    }
  });
}