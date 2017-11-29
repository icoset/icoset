# Icosystem CLI

Icosystem CLI is a utility that creates SVG `<symbol>`'s by simply stating what icons you want to use.

### v0.3.0 - Breaking changes

#### Configuration Requirements

Icon config files now require `family` and `icons` props, which means simple icon arrays are not valid anymore:

```javascript
// not valid
module.exports = ['magnify', 'help']
```

```javascript
// valid
module.exports = {
  family: 'mdi',
  icons: ['magnify', 'help']
}
module.exports = [
  {
    family: 'mdi',
    icons: ['magnify', 'help']
  },
  {
    family: 'weather',
    icons: ['cloudy']
  }
]
```

#### Removal of CLI options

Writing out multiple options every time you needed to add an icon is redundant - and since we're already writing a config for our `icons` list, it just makes sense to require `family` as well, and remove most of the CLI options.

CLI options being removed:

- `--icon-family` (now `family` prop in config)
- `--file-type` (only supporting js files for now)
- `--export-type` (only supporting es6 modules for now)

#### Output file rename

Changed the output file's name from `svg-symbols.js` to `icon-symbols.js`.

#### Technical Things

I did a complete overhaul of the build process (even reduced the code footprint a bit :smile:):

- Code is clearly formed in a pipeline
- Self documented with some JSDocs
- cleaned up some global messiness
- Added more (clearer) error messages

---

## Icons

This repo depends on open source SVG icon sets. Icons sets available:

- [Material Design Icons](https://materialdesignicons.com/) (family = `mdi)
- [weather-icons](https://github.com/erikflowers/weather-icons/)
- **More coming soon.**

You can also use local icon sets - see [Custom Icon Sets](#custom-icon-sets) to learn more.

## Install
```bash
npm install -g @geocompy/icosystem-cli
```

## Configuration

The CLI requires a config file that tells it how to retrieve icons and how to process them. The minimum requirements to writing a config are the props `family` and `icons`.

```javascript
module.exports = {
  family: 'material',
  icons: ['account', 'magnify']
};
```

### Use

Run the CLI and target your file:

```bash
$ ico path/to/config-file.js
```

The CLI generates a new file called `icon-symbols.js` that contains your specified icon sets:

```javascript
import { icons } from './icon-symbols.js'
let rootTemplate = `<div>${icons}</div>`
```

### Options

#### Multiple Icon Sets

You can add multiple icon sets by creating a collection of configs:

```javascript
// collection of configs
module.exports = [
    {
      family: 'weather',
      icons: ['cloudy'],
      prepend: 'wi'
    },
    {
      family: 'material',
      icons: ['account', 'magnify'],
      prepend: 'mid'
    }
];
```

To avoid name collisions between icon sets, the `prepend` prop is required, which will prepend all icon names id's and mappings. See [Prepend icon names](#prepend-icon-names) to learn more.

#### Select all icons in a set

Select all icons in a set by putting a single `*` in your icon array:

```javascript
// single config
module.exports = {
  family: 'weather',
  icons: ['*']
};
```

#### Custom icon sets

Sometimes, you'll need to add an icon set that's not open source (or just not available yet in the CLI).
You can add it by adding a `directory` prop to your config:

```javascript
module.exports = {
  family: 'font-awesome-pro',
  directory: 'path/to/icons',
  icons: ['bars']
}
```

**Directory Caveat:** The CLI assumes this `directory` is a folder containing ALL of your SVG's for the icon set.
It does not dig through sub-folders (but maybe it should?).

#### Icon Map

The CLI generates a map of every icon being passed in. This could be helpful to programatically check if icons are available, generating lists, etc. Each icon in the map has a `viewBox` property in case you need it (helpful when using a variable-width icon set).

This option is `true` by default, but you can turn it off as well:

```javascript
module.exports = {
  family: 'weather',
  icons: ['*'],
  map: false
}
```

The map is accessible in the same `icon-symbols.js` file, under `iconMap`:

```javascript
import { iconMap } from './icon-symbols';
```

### Prepend icon names

Prepend icon names with another name:

```javascript
module.exports = {
  family: 'font-awesome-pro',
  prepend: 'fa',
  directory: 'relative/path/to/icons',
  icons: ['bars']
}

// the "bar" icon will look like:
// id="fa-bars"
```

**NOTES**

- When adding multiple icon sets to your config, the `prepend` prop is required to avoid name collisions.
- The `weather` icon set SVG's comes with a prepended name `wi-`. We actually remove this to allow for customizability with prepended names.


## CLI Arguments

#### Required Argument: `<File>` (Icon config)

Path to your config file.

## Options

| Flag                   | Short Flag | Description          
| -----------------------|------------|-----------------
| --output               | -O         | Set output path


## Weather Icon Note

If you go to the [weather-icons site](http://erikflowers.github.io/weather-icons/) you'll notice that each icon is prepended with `wi-`. This prepended name is not required when adding icons (in fact, if you add `wi-` on the name, it won't be able to find the icon):

```javascript
module.exports = {
  family: 'weather',
  icons: ['cloudy'] // we'll grab wi-cloudy
}
```

## Roadmap

- ~~Add a config so you can change the defaults~~ **v0.2.0**
- Add more open source icon families (Streamline free, Feather, etc) Might even add attribution icons as well - [The Noun Project](http://thenounproject.com) is full of them...
- Add some tests.

Input is appreciated! I'm open to ideas and would love to collaborate to make this an awesome project.
