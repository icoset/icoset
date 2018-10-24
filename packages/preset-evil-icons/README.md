# Icoset Evil Icons Preset

## Install

```bash
# yarn
$ yarn add @icoset/icoset @icoset/preset-evil-icons

# npm
$ npm install -S @icoset/icoset @icoset/preset-evil-icons
```

## Use

When building your icon set, use the `preset` option instead of
`directory`:

```javascript
const icoset = require('@icoset/icoset');

icoset({
  preset: require('@icoset/preset-evil-icons'),
  // any other options you want
}).then(res => console.log(res));
```