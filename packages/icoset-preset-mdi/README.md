# Icoset Material Design Preset

Use Material Design icons in your app using the `@icoset/icoset` module.

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
}).then(res => console.log(res));
```