# Icoset Feather Icons Preset

## Install

```bash
# yarn
$ yarn add @icoset/icoset @icoset/preset-feather-icons

# npm
$ npm install -S @icoset/icoset @icoset/preset-feather-icons
```

## Use

When building your icon set, use the `preset` option instead of
`directory`:

```javascript
const icoset = require('@icoset/icoset');

icoset({
  preset: require('@icoset/preset-feather-icons'),
  // any other options you want
}).then(res => console.log(res));
```