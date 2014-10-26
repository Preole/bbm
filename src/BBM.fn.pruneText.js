(function (){
"use strict";

var BBM = require("./BBM.js");
var DUMMY = BBM("_DUMMY");

function isPrunable(node, index, sibs)
{
 return (sibs[index - 1] || DUMMY).text() && node.text();
}

function pruneTextWork(node)
{
 var prev = this.last() || DUMMY;
 if (prev.text() && node.text())
 {
  prev.text(prev.text() + node.text());
 }
 else
 {
  this.append(node);
 }
}

function pruneText(node)
{
 if (node.children().some(isPrunable))
 {
  node.rebuildChild(pruneTextWork);
 }
}



BBM.fn.pruneText = function ()
{
 return this.eachPre(pruneText);
};

module.exports = BBM;
}());

