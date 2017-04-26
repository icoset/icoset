# Icosystem CLI

Icosystem CLI is a utility that creates SVG `<symbol>`'s by you simply stating what icons you want to use.

## Icons

This repo houses open source icons so it can generate SVG's. Currently, only [Material Icons](https://materialdesignicons.com/) are available.

**More coming soon.**

## Install
```bash
npm install -g @geocompy/icosystem-cli
```

## Use

In your project, create a JSON file (eg: `components/icons/icons.json`), then add a single array with all the icons you need for your app. [Make sure the icons exist](https://github.com/geoctrl/icosystem-cli/tree/master/icons) or else the command will fail (Use the icon file names in your JSON).

```javascript
["magnify","account"]
```

Then in your terminal, run the `ico` command referencing your JSON:

```bash
ico components/icons/icons.json
```

The CLI generates a `svg-symbols.ts` file based off of your options, and places it in the same directory as your JSON (unless you specify otherwise with `--output`).

The `svg-symbols.ts` file would contain something similar to:

```typescript
export const iconMap = {"magnify":true,"account":true}; // this is just a helper if you need it
export const svgSymbols = `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;"><symbol id="magnify">...</symbol><symbol id="account">...</symbol></svg>`;
```

Easily import your SVG `import { svgSymbols } from './svg-symbols';` and place it in the root of your application. See my [Angular Svg Icons](https://github.com/geoctrl/angular-svg-icons) component for an example on how to consume it.

## Arguments

#### JSON File

Path to your json file for CLI to consume

## Options

All options are optional. Just pay mind to the defaults.

| Flag                   | Short Flag | Description          | Options                  | Defaults
| -----------------------|------------|----------------------|--------------------------|------------
| --output               | -O         | Set output path      | -                        | -
| --icon-family          | -I         | Set Icon Family Set  | `material`               | `material`
| --file-type   :warning:| -T         | Set File type        | `ts`, `js`               | `ts`
| --export-type :warning:| -E         | Set exporting syntax | `es6`, `commonjs`, `umd` | `es6`

**:warning: Not implemented yet**

## Roadmap

- Add more open source icon families (Streamline free, Feather, etc) Might even add attribution icons as well - [The Noun Project](http://thenounproject.com) is full of them...
- Add a config so you can change the defaults
- Input is appreciated! I'm open to ideas and would love to collaborate to make this an awesome project.
