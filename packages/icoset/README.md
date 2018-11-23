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

### `icoset(array||object)`

`icoset()` takes in an object of `options` or a collection of `options` and outputs
a promise. The object resolved contains everything you need to consume svg's as
`<symbols>` using the `<use>` tag:

```javascript
// example:
const icoset = require('icoset');

icoset({ directory: path.resolve('./icons') })
  .then(results => console.log(results));
```

Outputs:

```json
{
  "svg": "<svg xmls=\"...\"><symbol id=\"heart\"></symbol>...</svg>",
  "viewBoxMap": { "heart": { "viewBox": "0 0 24 24" } },
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
- Function must return valid preset config.

#### icons `array`

By default, icoset will grab all the svg's it can find (default: `icons: []`). However,
if we have access to a large icon set, we might not want them all. Specifying the
exact icons we want would greatly reduce output size.

**String items:**

Just specify file names (excluding the `svg` extension) in the array:

```javascript
icoset({
  directory: '...',
  icons: ['address-book', 'heart', 'check'],
})
```

Icoset will automatically find all icons that match (see `deepFind` to see how
deeply nested svg files work).

**Object items:**

if you have a complicated svg directory, and need more control over what files
to grab and how to name your icons, you can specify an object for each icon.

The object key is the final name of the icon, and the object value is the
path to the file.

For example, if you're targeting: `icons/regular/alarm.svg`, you would write
your config like this:

```javascript
icoset({
  directory: path.resolve(__dirname, 'icons'),
  icons: [
    { alarm: 'regular/alarm.svg' },
  ],
});
```

**Note:**

The `directory` property is still required - it will serve as the base path
for each object's value (partial path).

#### deepFind `boolean`

Deeply searches the directory for all `.svg`s. Default is `false`.

#### namePrependDirectory `boolean`

Prepend the directory structure to the icon name (only works if `deepFind` is `true`).

For example:

1. say we have a deeply nested folder structure of `svgs/awesome/light/cool.svg`.
2. The `directory` we specify in the options is `svgs` and `deepFind` is `true`.
3. If `namePrependDirectory` is `false`, the icon name would be: `cool.svg`.
4. If `namePrependDirectory` is `true`, then the outputted name would be:
`awesome-light-cool.svg` (the root directory is not included).

This is helpful if we had duplicate icon names, organized in different folders. A good 
example of this is font awesome's svg structure (regular, light, etc). Using
`namePrependDirectory` would output something like: `light-address-book` and
`regular-address-book`.

- Not Required.
- Default is `false`.

#### namePrependCustom `string`

Add a custom string to the beginning of all the icons names.

For example, if you specify `my-icon` and the icon is `address-book`, it will
output `my-icon-address-book` (no need to append trailing dashes).

**Note:** If `namePrependDirectory` and `namePrependCustom` are both used,
then the following is the order that is enforced:

```
[namePrependCustom]-[namePrependDirectory]-[name]
```

- Not required
- Default is `null`

#### nameRemovePattern `string`

Remove repetitive fluff from icon names.

For example, if all the icon names had `icon-` in them, we can add this to
`nameRemovePattern` to remove it from all the icons.

```javascript
icoset({
  nameRemovePattern: 'icon-',
  icons: ['icon-weather'],
})

// outputs: 'weather'
```

- Not required.
- Default is `null`.

#### ignorePattern `string`

Don't add svg's to output if their name's match this pattern.

```javascript
icoset({
  ignorePattern: 'icon-',
})
// all icons that have `icon-` in them will be skipped.
```

- Not required.
- Default is `null`.

#### matchPattern `string`

Only add svg's to output if their name's match this pattern.

```javascript
icoset({
  matchPattern: 'icon-',
})
// only icons that have `icon-` in them will be added.
```

- Not required.
- Default is `null`.

#### svgoPlugins `object`

Icoset uses svgo to clean up the svg's. You can override the defaults here.

**Note:** Svgo uses a plugin system and requires each plugin to have its own
object inside an array. For this implementation, however, just add each plugin
as a prop in a single object:

```
plugins: { cleanupAttrs: true, removeDoctype: true }
```

