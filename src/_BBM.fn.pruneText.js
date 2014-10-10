(function (){
"use strict";

var BBM = require("./BBM.js"),
ENUM = BBM.ENUM,
DUMMY = BBM(ENUM._DUMMY);



function _pruneTextWork(newNode, node)
{
 var prev = newNode.last() || DUMMY;
 if (prev.type() === ENUM.TEXT && node.type() === ENUM.TEXT)
 {
  prev.val(prev.val() + node.val());
 }
 else
 {
  newNode.append(node);
 }
}

function _prunable(node, index, sibs)
{
 var next = sibs[index + 1] || DUMMY;
 return node.type() === ENUM.TEXT
  && next.type() === ENUM.TEXT
  && next !== DUMMY;
}

function _pruneText(node)
{
 if (node.children().some(_prunable))
 {
  node.reduceChild(_pruneTextWork);
 }
}

//Combines consecutive text nodes within the tree into one node.
function pruneText()
{
 return this.eachPre(_pruneText, this);
}

BBM.prototype.pruneText = pruneText;

}());