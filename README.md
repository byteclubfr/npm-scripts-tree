[![npm version](https://badge.fury.io/js/npm-scripts-tree.svg)](http://badge.fury.io/js/npm-scripts-tree)
[![Dependency Status](https://david-dm.org/byteclubfr/npm-scripts-tree.png)](https://david-dm.org/byteclubfr/npm-scripts-tree)

# npm-scripts-tree

`npm run` without argument displays 2 flat lists:

  1. *Official* life-cycle scripts : `start`, `test`, `postinstall`…
  2. Your custom made scripts : their name followed by their command.

**npm-scripts-tree** offers an alternative view.

### Nested tasks.

It's pretty common to have *meta scripts* delegating to sub tasks.

For instance:

```js
"scripts": {
  "build": "npm run build:css && npm run build:js",
  "build:css": "do JS stuff",
  "build:js": "do CSS stuff"
}
```

`npm-scripts-tree` detects the relationship between these scripts and displays them in a [tree fashion](https://github.com/substack/node-archy), recursively if needed.

### pre / post scripts

By starting your scripts name by *pre* or *post* you declare your own life-cycle hooks. This kind of dependency between scripts is also taken into account in the final output.

## Install

`npm i -g npm-scripts-tree`

## Usage

Run `npm-scripts-tree` in the directory containing the `package.json` you want to inspect.

**Tip**: you may want to create a shell alias like `alias nst='npm-scripts-tree'`.

## License

MIT
