const { isFunction } = require('./utils');
const buildIcons = require('./build-icons');
const walk = require('./walk');
const { svgoDefaultConfig } = require('./utils');

// if deepFind is true, then there's a possibility that we could find duplicates.
// †he default filename will handle this by adding the [N]th index at the end of the filename.
// if [N] is removed (eg: `[name].[ext]`) then duplicates will override the previously set item.
// Any overrides will trigger a warning.

// Either "directory" or "preset" is required.
// If both are specified, "directory" will be used and a warning will be triggered.

// any character in "name" that is not wrapped in brackets will be ignored
// names will be normalized per "nameCase" (both the directory name and svg name)

// this function should output an object with 2 properties: 'svg' and 'viewBoxMap'

const defaultOptions = {
  directory: null,                  // string - must be an absolute path
  preset: null,                     // function - must return an absolute path
  deepFind: false,                  // boolean - check in all sub folders for svg files
  name: '[dir][name]',              // string - interpolate the icon names
  icons: ['*'],                     // array - choose which icons you want from the list
  svgoPlugins: svgoDefaultConfig,   // object - svgo plugins
};

function throwErr(msg) {
  throw Error(`[icoset] ${msg}`);
}

module.exports = function (options = {}) {
  return new Promise((resolve) => {
    const opts = { ...defaultOptions, ...options };

    if (typeof opts.directory !== 'string' && isFunction(opts.preset) && typeof opts.preset() === 'string') {
      opts.directory = opts.preset();
    }

    // validate options
    if (!opts.directory && !opts.preset) throwErr('Either "options.directory" or "options.preset" must be specified.');
    if (!opts.directory && opts.preset && (!isFunction(opts.preset) || typeof opts.preset() !== 'string')) throwErr(`"options.preset" must be a valid icon preset.`);
    if (!opts.preset && opts.directory && typeof opts.directory !== 'string') throwErr(`"options.directory" requires a string.`);
    if (typeof opts.deepFind !== 'boolean') throwErr(`"options.deepFind" requires a boolean.`);
    if (typeof opts.name !== 'string') throwErr(`"options.name" requires a string.`);
    if (!Array.isArray(opts.icons)) throwErr(`"options.icons" requires an array.`);
    if (opts.svgoPlugins !== Object(opts.svgoPlugins)) throwErr(`"options.svgoPlugins" requires an object.`);

    walk(opts)
      .then(results => buildIcons(results, opts))
      .then(results => resolve(results))
      .catch(err => {
        throw Error(err);
      });
  });
};