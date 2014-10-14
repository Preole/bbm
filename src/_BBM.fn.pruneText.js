(function (){
"use strict";

var BBM = require("./BBM.js"),
DUMMY = BBM("_DUMMY");


function __prunableText(prev, node)
{
 return prev.text().length > 0 && node.text().length > 0;
}

function __prunable(node, index, sibs)
{
 return __prunableText((sibs[index - 1] || DUMMY), node);
}

function __pruneTextWork(node)
{
 var prev = this.last() || DUMMY;
 if (__prunableText(prev, node))
 {
  prev.text(prev.text() + node.text());
 }
 else
 {
  this.append(node);
 }
}

function __pruneText(node)
{
 if (node.children().some(__prunable))
 {
  node.rebuildChild(__pruneTextWork);
 }
}

//Combines consecutive text nodes within the tree into one node.
function pruneText()
{
 return this.eachPre(__pruneText, this);
}

BBM.fn.pruneText = pruneText;
}());