const fs = require('fs');
const path = require('path');

const isSvg = (svg) => svg.slice(svg.lastIndexOf('.')) === '.svg';

function walk(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(
              res.filter(isSvg).map(item => ({
                name: item.replace(RegExp(dir, 'g'), '').slice(1).replace('/', '.'),
                path: item,
              }))
            );
            if (!--pending) done(null, results);
          });
        } else {
          if (isSvg(file)) {
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
}

function getFile(data) {
  const filePath = data.filePath;
  return new Promise((resolve, reject) => {
    // read json file
    const parsedFile = path.parse(filePath);
    if (parsedFile.ext === '.json' || parsedFile.name === '.icorc') {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(`Could not open "${filePath}".`, err);
        } else {
          resolve({
            ...data,
            config: JSON.parse(data),
          });
        }
      });
    }
    // require module
    else if (parsedFile.ext === '.js') {
      resolve({
        ...data,
        config: require(filePath),
      });
    }
  });
}

exports.walk = walk;
exports.getFile = getFile;
