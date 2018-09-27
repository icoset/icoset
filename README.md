# Icoset

Icoset is a node module that enables you to easily compose icon svg's for your apps.
You would add this as a build step before running your app.

## Install

```bash
yarn add @icoset/icoset
```
```bash
npm install @icoset/icoset
```

## Use

### icoset(options)

`icoset()` takes in an object of `options` and outputs a promise. The object resolved
contains everything you need to consume svg's as `<symbols>` using the `<use>` tag
(shadow render);

```javascript
const icoset = require('icoset');

icoset({ directory: path.resolve('./icons') })
  .then(results => console.log(results));
```

Outputs:

```javascript
{
  svg: '<svg xmls="..."><symbol id="heart"></symbol>...</svg>',
  viewBoxMap: { heart: { viewBox: '0 0 24 24' } },
}
```

(some icon libraries have varying viewbox sizes, which are required at the top-level
svg during render).

### Options

#### directory `string`

The directory where the `.svg`'s are hanging out.

- Required if `preset` is not defined.
- Must be an absolute path.

#### preset `function`

A node module that points to a `node_module` svg repo.

- Required if `directory` is not defined.
- Function must return an absolute path.

#### icons `array`

By default, icoset will grab all the svg's it can find (default: `['*']`). However,
if we have access to a large icon set, we might not want them all. Specifying the
exact icons we want would greatly reduce output size.

Just specify it in an array: `['address-book', 'heart', 'check']`.

#### deepFind `boolean`

Deeply searches the directory for all `.svg`s. Default is `false`.

#### name `string`

Builds a interpolated icon name from `[name]` and/or `[dir]`.

For example, say we have a deeply nested folder
structure of `svgs/awesome/light/cool.svg`.

The `directory` we specify in the options is `svgs` and `deepFind` is `true`.

So if we specify `name: [name]`, then the outputted icon name would be: `cool.svg`.
If we specify `name: [dir][name]` instead, then the outputted name would be:
`awesome-light-cool.svg` (the root directory is not included).

This is helpful if we had duplicate icon names, organized in different folders. A good 
example of this is font awesome's svg structure (regular, light, etc). Using
`name: [dir][name]` would output: `light-address-book` and `regular-address-book`.

- Characters outside of the brackets `[]` 

#### svgoPlugins `object`

Icoset uses svgo to clean up the svg's. You can override the defaults here.

**Note:** Svgo uses a plugin system and requires users to add each plugin as it's own
object, eg:
```
plugins: [{ cleanupAttrs: true }, { removeDoctype: true }]
```

Check out [their docs](https://github.com/svg/svgo/blob/master/examples/test.js) to
see what I mean....

Instead of using this overly-verbose syntax here, you just use a simple
object:

```
plugins: { cleanupAttrs: true, removeDoctype: true }
```

