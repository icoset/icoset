# Icosystem CLI

Icosystem CLI is a utility that creates SVG `<symbol>`'s by simply stating what icons you want to use.

### New! Use custom icons and advanced configs - v0.2.0

- Use local icon sets to build your symbol file.
- The config can now be a node module `.js` file.
- The config can now handle different structures (array of icons, config object, collection of config objects).
- The new config functionality is backward compatible with all previous versions.

### Weather Icons v0.1.2

[Weather Icons](https://github.com/erikflowers/weather-icons/) are now available! Set your icon family option as `weather` to use it:

```bash
$ ico -I weather path-to-json/icons.json
```

## Icons

This repo depends on open source icons so it can generate SVG's. Currently, only [Material Design Icons](https://materialdesignicons.com/) and [weather-icons](https://github.com/erikflowers/weather-icons/) are available.

**More coming soon.**

## Install
```bash
npm install -g @geocompy/icosystem-cli
```

## Use

In your project, create a node module `.js` or `JSON` file (eg: `components/icons/icons.js`), then add a single array with all the icons you need for your app. The name of the icon is the name of the svg file without the `.svg` extension:

```javascript
module.exports = ["magnify","account"];
```

Then in your terminal, run the `ico` command referencing your config file:

```bash
$ ico path-to-json/icons.js
```

The CLI generates a `svg-symbols.js` file based off of your options, and places it in the same directory as your config file (unless you specify otherwise with `--output`).

The `svg-symbols.js` file would contain something similar to:

```typescript
export const svgSymbols = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;"><symbol id="magnify">...</symbol><symbol id="account">...</symbol></svg>`;
```

Easily import your SVG and place it in the root of your application:

```javascript
import { svgSymbols } from './svg-symbols';
let template = `<div>${svgSymbols}</div>`;
```

## Advanced Config

Typing arguments in the CLI every time can be redundant - luckily, we can remedy this by restructuring the config file.

Excluding the simple array example shown above, you can structure your config in two ways:

```javascript
// single config
module.exports = {
  family: 'material',
  icons: ['account', 'magnify']
};
 
// collection of configs
module.exports = [
    {
      family: 'weather',
      icons: ['*']
    },
    {
      family: 'material',
      icons: ['account', 'magnify']
    }
];
```

By creating a collection, you can import multiple icon sets into your project!

### Select all icons in a set

Select all icons in a set by putting a single `*` in your icon array:

```javascript
// single config
module.exports = {
  family: 'weather',
  icons: ['*']
};
```

### Custom icon sets

Sometimes, you'll need to add an icon set that's not open source (or just not available yet in the CLI).
You can add it by adding a `directory` prop to your config:

```javascript
module.exports = {
  family: 'font-awesome-pro',
  prepend: 'fa',
  directory: 'relative/path/to/icons',
  icons: ['bars']
}
```

**Directory Caveat:** The CLI assumes this `directory` is a folder containing ALL of your SVG's for the icon set.
It does not dig through sub-folders (but maybe it should?).

### Icon Map

With the `.map` option set to `true`, the CLI builds an object for every icon in the set, allowing for icon checks. Also, each icon in the map has a `viewBox` property in case you need it (helpful when using a variable-width icon set).

```javascript
module.exports = {
  family: 'weather',
  icons: ['*'],
  map: true
}
```

The map is accessible in the same `svg-symbols.js` file, under `iconMap`:

```javascript
import { iconMap } from './svg-symbols';
```

### Prepend icon names

Especially when using multiple icon sets, it makes sense prepend a unique identifier so we don't override names. Do this by adding a `.prepend` option to the config:

```javascript
module.exports = {
  family: 'font-awesome-pro',
  prepend: 'fa',
  directory: 'relative/path/to/icons',
  icons: ['bars']
}
```

By default, `weather-icons` come with with a prepended name: `wi-`. By changing the prepend prop, you can override it (so yes, `weather-icons` will always have a prepended name).

## CLI Arguments

#### JSON File

Path to your config file.

## Options

All options are optional. Just pay mind to the defaults.

| Flag                   | Short Flag | Description          | Options                  | Defaults
| -----------------------|------------|----------------------|--------------------------|------------
| --output               | -O         | Set output path      | -                        | -
| --icon-family          | -I         | Set Icon Family Set  | `material`, `weather`    | `material`
| --file-type   :warning:| -T         | Set File type        | `js`, `ts`               | `js`
| --export-type :warning:| -E         | Set exporting syntax | `es6`, `commonjs`, `umd` | `es6`

**:warning: Not implemented yet**



## Roadmap

- ~~Add a config so you can change the defaults~~ **v0.2.0**
- Add more open source icon families (Streamline free, Feather, etc) Might even add attribution icons as well - [The Noun Project](http://thenounproject.com) is full of them...
- Add some tests.

Input is appreciated! I'm open to ideas and would love to collaborate to make this an awesome project.
