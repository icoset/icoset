const { isFunction } = require('./utils');
const buildIcons = require('./build-icons');
const walk = require('./walk');
const { svgoDefaultConfig } = require('./utils');

const defaultOptions = {
  preset: null,                     // function - must return an object
  icons: [],                        // array - choose which icons you want from the list - empty is ALL icons
  svgoPlugins: svgoDefaultConfig,   // object - svgo plugins
  // presets can override:
  directory: null,                  // string - must be an absolute path
  deepFind: false,                  // boolean - check in all sub folders for svg files
  namePrependDirectory: false,      // boolean - prepend the directory structure
  namePrependCustom: '',            // string - prepend a custom string to the name
  nameRemovePattern: '',            // string - remove pattern from icon names
  ignorePattern: '',                // string - ignore svg's based on the given pattern
  matchPattern: '',                 // string - allow svg's only if it matches given pattern
};

function throwErr(msg) {
  throw Error(`[icoset] ${msg}`);
}

function mashOptionsAndPreset(options) {
  const preset = {};
  if (typeof options.directory !== 'string' && isFunction(options.preset) && typeof options.preset() === 'object') {
    const p = options.preset();
    if (p.directory) preset.directory = p.directory;
    if (typeof p.deepFind === 'boolean') preset.deepFind = p.deepFind;
    if (typeof p.namePrependDirectory === 'boolean') preset.namePrependDirectory = p.namePrependDirectory;
    if (p.namePrependCustom) preset.namePrependCustom = p.namePrependCustom;
    if (p.nameRemovePattern) preset.nameRemovePattern = p.nameRemovePattern;
    if (p.ignorePattern) preset.ignorePattern = p.ignorePattern;
    if (p.matchPattern) preset.matchPattern = p.matchPattern;
  }
  return {
    ...defaultOptions,
    ...options,
    ...preset,
  };
}

module.exports = function (options = []) {
  return new Promise((resolve) => {
    // validate options
    if (!Array.isArray(options) && typeof options !== 'object') throwErr('Argument [options] should be a valid config object or a collection of valid configs.');

    // wrap options in an array
    const opts = (Array.isArray(options) ? options : [options]).map(option => {
      const opt = mashOptionsAndPreset(option);
      // validate options
      if (!opt.directory && !opt.preset) throwErr('Either "options.directory" or "options.preset" must be specified.');
      if (!opt.directory && opt.preset && (!isFunction(opt.preset) || typeof opt.preset() !== 'string')) throwErr(`"options.preset" must be a valid icon preset.`);
      if (!opt.preset && opt.directory && typeof opt.directory !== 'string') throwErr(`"options.directory" requires a string.`);
      if (typeof opt.deepFind !== 'boolean') throwErr(`"options.deepFind" requires a boolean.`);
      if (typeof opt.namePrependDirectory !== 'boolean') throwErr(`"options.namePrependDirectory" must be a boolean.`);
      if (typeof opt.namePrependCustom !== 'string') throwErr(`"options.namePrependCustom" must be a string.`);
      if (typeof opt.nameRemovePattern !== 'string') throwErr(`"options.nameRemovePattern" must be a string`)
      if (typeof opt.ignorePattern !== 'string') throwErr(`"options.ignorePattern" must be a string`)
      if (typeof opt.matchPattern !== 'string') throwErr(`"options.matchPattern" must be a string`)
      if (!Array.isArray(opt.icons)) throwErr(`"options.icons" requires an array.`);
      if (opt.svgoPlugins !== Object(opt.svgoPlugins)) throwErr(`"options.svgoPlugins" requires an object.`);
      return opt;
    });

    Promise.all(opts.map(walk))
      .then(results => buildIcons(results, opts))
      .then(results => resolve(results))
      .catch(err => {
        throw Error(err);
      });
  });
};