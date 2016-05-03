[![npm version](https://badge.fury.io/js/npm-scripts-tree.svg)](http://badge.fury.io/js/npm-scripts-tree)
[![Dependency Status](https://david-dm.org/byteclubfr/npm-scripts-tree.png)](https://david-dm.org/byteclubfr/npm-scripts-tree)

# npm-scripts-tree

`npm run` without argument displays 2 flat lists:

  1. *Official* life-cycle scripts : `start`, `test`, `postinstall`…
  2. Your custom made scripts : their name followed by their command.

**npm-scripts-tree** offers an alternative view.

### Nested scripts.

It's pretty common to have *meta scripts* delegating to sub-scripts.

For instance:

```js
"scripts": {
  "build": "npm run build:css && npm run build:js",
  "build:css": "do JS stuff",
  "build:js": "do CSS stuff"
}
```

`npm-scripts-tree` detects the relationship between these scripts and displays them in a [tree fashion](https://github.com/substack/node-archy), recursively if needed. See detailed example below.

### pre / post scripts

By starting your scripts name by *pre* or *post* you declare your own life-cycle hooks. This kind of dependency between scripts is also taken into account in the final output.

### serial / parallel

[npm-run-all](https://www.npmjs.com/package/npm-run-all) dependencies are also supported!

## Install

`npm i -g npm-scripts-tree`

## Usage

Run `npm-scripts-tree` in the directory containing the `package.json` you want to inspect.

- Life-cycle scripts are displayed in cyan
- Scripts that are not sub-scripts are displayed in bold

**Tip**: you may want to create a shell alias like `alias nst='npm-scripts-tree'`.

### Options

`-a`, `--alpha` List scripts alphabetically
`-p`, `--prune` Remove life-cycle scripts and explicit sub-scripts (containing a `:`) from tree top level

## Example

Fake `package.json` located in the `test` directory.

```json
{
	"scripts": {
		"a": "npm run b && npm run c",
		"preb": "prefoo",
		"b": "foo",
		"c": "npm run d",
		"d": "bar",
		"e": "npm-run-all b d",
		"f": "npm-run-all --serial b d",
		"g": "npm-run-all --serial g:*",
		"g:a": "qux",
		"g:b": "yolo"
	}
}
```

Output in the terminal (without colors):

```
10 scripts
├─┬ a — npm run b && npm run c
│ ├─┬ b — foo
│ │ └── preb — prefoo
│ └─┬ c — npm run d
│   └── d — bar
├── preb — prefoo
├─┬ b — foo
│ └── preb — prefoo
├─┬ c — npm run d
│ └── d — bar
├── d — bar
├─┬ e — npm-run-all b d
│ ├─┬ b — foo
│ │ └── preb — prefoo
│ └── d — bar
├─┬ f — npm-run-all --serial b d
│ ├─┬ b — foo
│ │ └── preb — prefoo
│ └── d — bar
├─┬ g — npm-run-all --serial g:*
│ ├── g:a — qux
│ └── g:b — yolo
├── g:a — qux
└── g:b — yolo
```

After pruning:

```
7 scripts
├─┬ a — npm run b && npm run c
│ ├─┬ b — foo
│ │ └── preb — prefoo
│ └─┬ c — npm run d
│   └── d — bar
├─┬ b — foo
│ └── preb — prefoo
├─┬ c — npm run d
│ └── d — bar
├── d — bar
├─┬ e — npm-run-all b d
│ ├─┬ b — foo
│ │ └── preb — prefoo
│ └── d — bar
├─┬ f — npm-run-all --serial b d
│ ├─┬ b — foo
│ │ └── preb — prefoo
│ └── d — bar
└─┬ g — npm-run-all --serial g:*
  ├── g:a — qux
  └── g:b — yolo
```

## License

MIT
