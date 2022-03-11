const path = require('path');

function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
}

function buildName(fullPath, namePrependDirectory = false, namePrependCustom = '', nameRemovePattern = '') {
  const name = path.parse(fullPath).name
    .replace(/\s+/, '-');

  const directory = path.parse(fullPath).dir
    .split(path.sep)
    .filter(name => name)
    .join('-');

  let newName = name;
  if (nameRemovePattern) {
    const pattern = new RegExp(nameRemovePattern, 'g');
    newName = newName.replace(pattern, '') || name;
  }
  if (namePrependDirectory && directory) newName = `${directory}-${newName}`;
  if (namePrependCustom) newName = `${namePrependCustom}-${newName}`;

  return {
    newName,
    originalName: name,
  };
}

module.exports = {
  isFunction,
  buildName,
};
