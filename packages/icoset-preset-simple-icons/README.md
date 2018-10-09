# Icoset Simple Icons Preset

## Install

```bash
# yarn
$ yarn add @icoset/icoset @icoset/preset-simple-icons

# npm
$ npm install -S @icoset/icoset @icoset/preset-simple-icons
```

## Use

When building your icon set, use the `preset` option instead of
`directory`:

```javascript
const icoset = require('@icoset/icoset');

icoset({
  preset: require('@icoset/preset-simple-icons'),
  // any other options you want
}).then(res => console.log(res));
```