(function (){
"use strict";

var BBM = require("./BBM.js"),
ENUM = BBM.ENUM,
DUMMY = BBM("_DUMMY"),
ALONE =
[
 BBM.PRE,
 BBM.TD,
 BBM.TH,
 BBM.HR,
 BBM.LINK_EXT,
 BBM.LINK_INT,
 BBM.LINK_WIKI,
 BBM.LINK_IMG
];


function __isBlank(node)
{
 return BBM.isBlankString(node.text())
  && node.size() === 0
  && AST_ALONE.indexOf(node.type) === -1;
}

function __isKept(node)
{
 return node.text().length > 0 || !__isBlank(node);
}

function __pruneEachTR(rowNode)
{
 if (rowNode.size() === 0)
 {
  return;
 }
 while (rowNode.size() > maxCol)
 {
  rowNode.pop();
 }
 while (rowNode.size() < maxCol)
 {
  rowNode.append(BBM(ENUM.TD));
 }
}

function __pruneTR(node)
{
 var maxCol = Math.min((node.first() || DUMMY).size(), 64);
 node.children().forEach(__pruneEachTR, maxCol);
}

function __pruneDL(node)
{
 var ht = null;
 while ((ht = node.first()) && ht.type === AST.DD)
 {
  node.shift();
 }
 
 while ((ht = node.last()) && ht.type === AST.DT)
 {
  node.pop();
 }
}



function __pruneBlank(node)
{
 if (node.children().every(__isBlank))
 {
  node.empty();
  return;
 }
 
 if (node.type() === ENUM.TABLE)
 {
  __pruneTR(node);
 }
 else if (node.type() === ENUM.DL)
 {
  __pruneDL(node);
 }
 
 node.filterChild(__isKept);
}


//Removes certain nodes that contains no visible content.
function pruneBlank()
{
 return this.eachPost(__pruneBlank);
}

BBM.fn.pruneBlank = pruneBlank;

}());


