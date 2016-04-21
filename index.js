"use strict";

var chalk = require("chalk");
// convention used : label and nodes
var archy = require("archy");

var BUILTINS = [
  "publish",
  "install",
  "uninstall",
  "test",
  "stop",
  "start",
  "restart",
  "version"
];

// -s, --serial…
var RE_FLAGS = '(?:\\s+\-+\\w+)*';
// build, watch, build_client, build-client, build:*
var RE_NAME = '\\s+([a-z0-9_\\-]+)';
var RE_NAMES = '((?:\\s+[a-z0-9_:\\-\\*]+)+)';

// utils

var unique = array => [...new Set(array)];

var flatten = arrays => [].concat.apply([], arrays)


function archify (scripts, alpha) {
  var names = Object.keys(scripts);
  if (alpha) {
    names = names.sort();
  }
  return {
    label: `${names.length} scripts`,
    nodes: names.map(n => scripts[n])
  }
}

function getLabel (script) {
  var name = script.isPre || script.isPost
    ? chalk.cyan(script.name)
    : chalk.bold(script.name)

  return name + chalk.dim(` — ${script.cmd}`);
}

function isPreScript (name, scripts) {
  return isLifeCycleScript("pre", name, scripts);
}

function isPostScript (name, scripts) {
  return isLifeCycleScript("post", name, scripts);
}

function isLifeCycleScript (prefix, name, scripts) {
  var re = new RegExp("^" + prefix);
  var root = name.slice(prefix.length);
  return Boolean(name.match(re) && (scripts[root] || ~BUILTINS.indexOf(root)));
}

function getPreScript (name, scripts) {
  return scripts["pre" + name];
}

function getPostScript (name, scripts) {
  return scripts["post" + name];
}

function getNodesNames (name, scripts) {
  var cmd = scripts[name];

  var subScripts = [].concat(
    getRunScripts(cmd),
    getRunAllScripts(cmd)
  ).filter(x => x); // not null

  return unique(subScripts);
}

// handled natively
function getRunScripts (cmd) {
  var re = /(?:npm run\s+(\w+))+/gi;
  var re = new RegExp('(?:npm run' + RE_NAME + ')+', 'gi');
  var cmds = [];
  var m;
  // for each npm run group
  while ((m = re.exec(cmd)) !== null) {
    cmds.push(m[1]);
  }

  return unique(cmds);
}

// handled by npm-run-all module
function getRunAllScripts (cmd) {
  var re = RegExp('(?:npm-run-all' + RE_FLAGS + RE_NAMES + ')+', 'gi');
  var cmds = [];
  var m;
  // for each npm-run-all group
  while ((m = re.exec(cmd)) !== null) {
    // clean spaces
    cmds.push(m[1].trim().split(' ').filter(x => x));
  }

  return unique(flatten(cmds));
}

function getDetailedScripts (scripts) {
  return Object.keys(scripts).reduce((all, name) => {
    var s = {
      name: name,
      cmd: scripts[name],
      isPre: isPreScript(name, scripts),
      isPost: isPostScript(name, scripts),
      pre: getPreScript(name, scripts),
      post: getPostScript(name, scripts),
      nodesNames: getNodesNames(name, scripts)
    };

    s.label = getLabel(s);

    all[name] = s;
    return all;
  }, {});
}

// sub scripts
function attachNodes (scripts) {
  return Object.keys(scripts).reduce((all, name) => {
    var s = scripts[name];
    s.nodes = s.nodesNames.map(n => scripts[n]).filter(x => x);

    if (s.pre) s.nodes.unshift(scripts["pre" + name]);
    if (s.post) s.nodes.push(scripts["post" + name]);

    all[name] = s;
    return all;
  }, {});
}

function main (scripts, options) {
  if (!scripts) throw new Error("No package.json or no scripts key in this dir");

  var detailedScripts = getDetailedScripts(scripts);
  detailedScripts = attachNodes(detailedScripts);

  // sort?
  var alpha = options.a || options.alpha;
  return archy(archify(detailedScripts, alpha));
}

module.exports = {
  main,
  // test
  getRunScripts,
  getRunAllScripts,
  getNodesNames
}
