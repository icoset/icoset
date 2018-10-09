# Icoset MDI (material design icons) Preset

## Install

```bash
# yarn
$ yarn add @icoset/icoset @icoset/preset-mdi

# npm
$ npm install -S @icoset/icoset @icoset/preset-mdi
```

## Use

When building your icon set, use the `preset` option instead of
`directory`:

```javascript
const icoset = require('@icoset/icoset');

icoset({
  preset: require('@icoset/preset-mdi'),
  // any other options you want
}).then(res => console.log(res));
```