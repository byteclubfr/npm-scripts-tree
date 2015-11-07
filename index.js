"use strict";

var path = require("path");
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

function archify (scripts) {
  var names = Object.keys(scripts);
  return {
    label: names.length + " scripts",
    nodes: names.map(function (name) {
      return scripts[name];
    })
  }
}

function getLabel (script) {
  var name;
  if (script.isPre || script.isPost) {
    name = chalk.cyan(script.name);
  } else {
    name = chalk.bold(script.name);
  }
  return name + chalk.dim(" — " + script.cmd);
}

function isPreScript (name, scripts) {
  return Boolean(name.match(/^pre/) && scripts[name.slice(3)]);
}

function isPostScript (name, scripts) {
  return Boolean(name.match(/^post/) && scripts[name.slice(4)]);
}

function getPreScript (name, scripts) {
  return scripts["pre" + name];
}

function getPostScript (name, scripts) {
  return scripts["post" + name];
}

function getNodesNames (name, scripts) {
  var cmd = scripts[name];
  var m = cmd.match(/(npm run (\S*))+/gi);
  if (!m) return null;

  return m.map(function (c) {
    return c.slice(8);
  });
}

function getScripts () {
  var pkg;

  try {
    pkg = require(path.resolve("package.json"));
    return pkg.scripts;
  } catch (e) {
    return null;
  }
}

function getDetailedScripts (scripts) {
  return Object.keys(scripts).reduce(function (all, name) {
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
  return Object.keys(scripts).reduce(function (all, name) {
    var s = scripts[name];
    if (s.nodesNames) {
      s.nodes = s.nodesNames.map(function (c) {
        return scripts[c];
      });
    }

    all[name] = s;
    return all;
  }, {});
}

function main () {
  var scripts = getScripts();

  if (!scripts) throw new Error("No package.json or no scripts key in this dir");

  var detailedScripts = getDetailedScripts(scripts);
  detailedScripts = attachNodes(detailedScripts);
  console.log(archy(archify(detailedScripts)));
}

module.exports = {
  main: main
};
