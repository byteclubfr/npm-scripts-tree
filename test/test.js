var tap = require("tap")
var nst = require("../index")

// main
tap.throws(nst.main)

// getRunScripts
var runScripts = {
  'foo': [],
  'foo && npm run': [],
  'foo && npm run bar': ['bar'],
  'foo && npm run bar_toto': ['bar_toto'],
  'foo && npm run bar-toto': ['bar-toto'],
  'foo && npm run bar && qux': ['bar'],
  'foo && npm run   bar': ['bar'],
  'foo && npm run bar && npm run bar': ['bar'],
  'foo && npm run bar && npm run qux': ['bar', 'qux'],
  'foo && npm run bar && npm run   qux': ['bar', 'qux'],
}

Object.keys(runScripts).forEach((cmd) => {
  tap.same(nst.getRunScripts(cmd), runScripts[cmd])
})

// getRunAllScripts
var runAllScripts = {
  'foo': [],
  'foo && npm-run-all': [],
  'foo && npm-run-all bar': ['bar'],
  'foo && npm-run-all bar_toto': ['bar_toto'],
  'foo && npm-run-all bar-toto': ['bar-toto'],
  'foo && npm-run-all bar:toto': ['bar:toto'],
  'foo && npm-run-all bar:*': ['bar:*'],
  'foo && npm-run-all bar:*:*': ['bar:*:*'],
  'foo && npm-run-all   bar': ['bar'],
  'foo && npm-run-all bar bar': ['bar'],
  'foo && npm-run-all bar qux': ['bar', 'qux'],
  'foo && npm-run-all bar   qux': ['bar', 'qux'],
  'foo && npm-run-all bar qux && npm-run-all yolo toto': ['bar', 'qux', 'yolo', 'toto'],
  'foo && npm-run-all bar qux &&   npm-run-all yolo toto': ['bar', 'qux', 'yolo', 'toto'],
  'foo && npm-run-all -s bar qux': ['bar', 'qux'],
  'foo && npm-run-all --serial bar qux': ['bar', 'qux'],
  'foo && npm-run-all -s bar qux && npm-run-all yolo': ['bar', 'qux', 'yolo'],
  'foo && npm-run-all -p bar qux': ['bar', 'qux'],
  'foo && npm-run-all --parallel bar qux': ['bar', 'qux'],
}

Object.keys(runAllScripts).forEach((cmd) => {
  tap.same(nst.getRunAllScripts(cmd), runAllScripts[cmd])
})

// isLifeCycleScript
tap.notOk(nst.isLifeCycleScript('foo', 'bar', { bar: 'bar' }))
tap.ok(nst.isLifeCycleScript('foo', 'foobar', { bar: 'bar' }))

// expandWildcard
tap.same(
  nst.expandWildcard('foo:*', {
    'foo': 'bar',
    'foo:bar': 'qux',
    'foo:yolo': 'toto',
    'foo:bar:yolo': 'toto',
    'fooqux': 'qux',
  }),
  ['foo:bar', 'foo:yolo']
)
// Globstar
tap.same(
  nst.expandWildcard('foo:**', {
    'foo': 'bar',
    'foo:bar': 'qux',
    'foo:yolo': 'toto',
    'foo:bar:yolo': 'toto',
    'fooqux': 'qux',
  }),
  ['foo:bar', 'foo:yolo', 'foo:bar:yolo']
)
