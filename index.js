"use strict";

var path = require("path");
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
  var labels = Object.keys(scripts);
  return {
    label: labels.length + " scripts",
    nodes: labels.map(function (label) {
      return scripts[label];
    })
  }
}

function isPreScript (label, scripts) {
  return Boolean(label.match(/^pre/) && scripts[label.slice(3)]);
}

function isPostScript (label, scripts) {
  return Boolean(label.match(/^post/) && scripts[label.slice(4)]);
}

function getPreScript (label, scripts) {
  return scripts["pre" + label];
}

function getPostScript (label, scripts) {
  return scripts["post" + label];
}

function getNodesLabels (label, scripts) {
  var cmd = scripts[label];
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
  return Object.keys(scripts).reduce(function (all, label) {
    var s = {
      label: label,
      cmd: scripts[label],
      isPre: isPreScript(label, scripts),
      isPost: isPostScript(label, scripts),
      pre: getPreScript(label, scripts),
      post: getPostScript(label, scripts),
      nodesLabels: getNodesLabels(label, scripts)
    };

    all[label] = s;
    return all;
  }, {});
}

function attachNodes (scripts) {
  return Object.keys(scripts).reduce(function (all, label) {
    var s = scripts[label];
    if (s.nodesLabels) {
      s.nodes = s.nodesLabels.map(function (c) {
        return scripts[c];
      });
    }

    all[label] = s;
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
