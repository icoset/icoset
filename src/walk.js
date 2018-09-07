const fs = require('fs');
const path = require('path');
require('colors');

const isSvg = (svg) => {
  if (typeof svg === 'object') return true;
  return svg.slice(svg.lastIndexOf('.')) === '.svg';
};

module.exports = function walk(dir, done, preserveFolderNames) {
  const iconMap = {};

  const mapCheck = (name) => {
    const base = name.slice(0, name.lastIndexOf('.'));
    if (iconMap[base] >= 1) {
      iconMap[base] += 1;
      const newName = `${base}-${iconMap[base]}.svg`;
      console.log(`Duplicate svg name "${name}" changed to "${newName}."`.bgYellow.black);
      console.log(`Consider de-duping your icon names or using the "preserveFolderNames" option.`)
      return newName;
    } else {
      iconMap[base] = 1;
      return name;
    }
  }

  const buildIconObj = (icon) => {
    if (typeof icon === 'object') return icon;
    if (preserveFolderNames) {
      return {
        name: mapCheck(icon.replace(RegExp(dir, 'g'), '').slice(1).replace(/\//g, '-')),
        path: icon,
      };
    } else {
      return {
        name: mapCheck(icon.slice(icon.lastIndexOf('/') + 1)),
        path: icon,
      };
    }
  }

  function run(_dir, _done) {
    let results = [];
    fs.readdir(_dir, function(err, list) {
      if (err) return _done(err);
      let pending = list.length;
      if (!pending) return _done(null, results);
      list.forEach(function(file) {
        file = path.resolve(_dir, file);
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            run(file, function(err, res) {
              results = results.concat(res.filter(isSvg).map(buildIconObj));
              if (!--pending) _done(null, results);
            });
          } else {
            if (isSvg(file)) results.push(file);
            if (!--pending) _done(null, results);
          }
        });
      });
    });
  }
  run(dir, done);
}