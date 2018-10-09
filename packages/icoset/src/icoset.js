const { isFunction } = require('./utils');
const buildIcons = require('./build-icons');
const walk = require('./walk');
const { svgoDefaultConfig } = require('./utils');

// if deepFind is true, then there's a possibility that we could find duplicates.
// †he default filename will handle this by adding the "nth" index at the end of the filename
// (eg: search-2).
// if "prependDirectory" is true, then a unique name is guaranteed and no "nth" index is needed

// Either "directory" or "preset" is required.
// If both are specified, "directory" will be used and a warning will be triggered.

// any character in "name" that is not wrapped in brackets will be ignored
// names will be normalized per "nameCase" (both the directory name and svg name)

// if both "namePrependDirectory" and "namePrependCustom" are used, then the following order is
// enforced: "[namePrependCustom]-[namePrependDirectory]-[name]"

// this function should output an object with 2 properties: 'svg' and 'viewBoxMap'

// preset will override "directory", and could override "deepFind", "namePrependDirectory", or "nameRemovePattern"

const defaultOptions = {
  directory: null,                  // string - must be an absolute path
  preset: null,                     // function - must return an object
  deepFind: false,                  // boolean - check in all sub folders for svg files
  namePrependDirectory: false,      // boolean - prepend the directory structure
  namePrependCustom: '',            // string - prepend a custom string to the name
  nameRemovePattern: '',            // string - remove pattern from icon names
  icons: [],                        // array - choose which icons you want from the list - empty is ALL icons
  svgoPlugins: svgoDefaultConfig,   // object - svgo plugins
};

function throwErr(msg) {
  throw Error(`[icoset] ${msg}`);
}

module.exports = function (options = []) {
  return new Promise((resolve) => {
    // validate options
    if (!Array.isArray(options) && typeof options !== 'object') throwErr('Argument [options] should be a valid config object or a collection of valid configs.');

    // wrap options in an array
    const opts = (Array.isArray(options) ? options : [options]).map(opt => {
      // presets can override things
      const preset = {};
      if (typeof opt.directory !== 'string' && isFunction(opt.preset) && typeof opt.preset() === 'object') {
        const p = opt.preset();
        if (p.directory)            preset.directory = p.directory;
        if (p.namePrependDirectory) preset.namePrependDirectory = p.namePrependDirectory;
        if (p.nameRemovePattern)    preset.nameRemovePattern = p.nameRemovePattern;
      }
      const option = {
        ...defaultOptions,
        ...opt,
        ...preset,
      };

      // validate options
      if (!option.directory && !option.preset) throwErr('Either "options.directory" or "options.preset" must be specified.');
      if (!option.directory && option.preset && (!isFunction(option.preset) || typeof option.preset() !== 'string')) throwErr(`"options.preset" must be a valid icon preset.`);
      if (!option.preset && option.directory && typeof option.directory !== 'string') throwErr(`"options.directory" requires a string.`);
      if (typeof option.deepFind !== 'boolean') throwErr(`"options.deepFind" requires a boolean.`);
      if (typeof option.namePrependDirectory !== 'boolean') throwErr(`"options.namePrependDirectory" must be a boolean.`);
      if (typeof option.namePrependCustom !== 'string') throwErr(`"options.namePrependCustom" must be a string.`);
      if (typeof option.nameRemovePattern !== 'string') throwErr(`"options.nameRemovePattern" must be a string`)
      if (!Array.isArray(option.icons)) throwErr(`"options.icons" requires an array.`);
      if (option.svgoPlugins !== Object(option.svgoPlugins)) throwErr(`"options.svgoPlugins" requires an object.`);
      return option;
    });

    Promise.all(opts.map(walk))
      .then(results => buildIcons(results, opts))
      .then(results => resolve(results))
      .catch(err => {
        throw Error(err);
      });
  });
};