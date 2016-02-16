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

  return name + chalk.dim(` —  ${script.cmd}`);
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
  var m = cmd.match(/(npm run (\w*))+/gi);
  if (!m) return null;

  return m.map(c => c.slice(8));
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

function attachNodes (scripts) {
  return Object.keys(scripts).reduce((all, name) => {
    var s = scripts[name];
    s.nodes = s.nodesNames
      ? s.nodesNames.map(n => scripts[n])
      : []

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

module.exports = { main }
