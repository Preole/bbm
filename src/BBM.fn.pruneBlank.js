
"use strict";

var BBM = module.exports = require("./BBM.js");
var __ = require("./utils.js");
var AST = BBM.ENUM;
var LINKS =
{
  LINK_EXT : 1
, LINK_INT : 1
, LINK_WIKI : 1
};

var ALONE =
{
  PRE : 1
, TD : 1
, TH : 1
, LI : 1
, BLOCKQUOTE : 1
, DD : 1
, DT : 1
, HR : 1
, DIV : 1
, LINK_EXT : 1
, LINK_INT : 1
, LINK_WIKI : 1
, LINK_IMG : 1
, COMMENT : 1
};

function isPre(node)
{
 return node.type() === AST.PRE || node.type() === AST.COMMENT;
}

function isBlank(node)
{
 return __.isBlankString(node.text())
 && node.size() === 0
 && !ALONE[node.type()];
}

function isKept(node)
{
 return node.text() || !isBlank(node);
}

function pruneTR(node)
{
 var maxCol = node.first() ? node.first().size() : 0;
 node.children().forEach(function (rNode){
  if (rNode.size() > 0)
  {
   while (rNode.size() > maxCol)
   {
    rNode.pop();
   }
   while (rNode.size() < maxCol)
   {
    rNode.append(BBM(AST.TD));
   }
  }
 });
}

function pruneDL(node)
{
 var ht = null;
 while ((ht = node.first()) && ht.type() === AST.DD)
 {
  node.shift();
 }
 
 while ((ht = node.last()) && ht.type() === AST.DT)
 {
  node.pop();
 }
}

function pruneBlank(node)
{
 var type = node.type();
 if (!isPre(node) && node.children().every(isBlank))
 {
  return node.empty().append(LINKS[type] ? node.attr("href") : null);
 }
 
 
 if (type === AST.TABLE)
 {
  pruneTR(node);
 }
 else if (type === AST.DL)
 {
  pruneDL(node);
 }
 node.filterChild(isKept);
}

BBM.fn.pruneBlank = function ()
{
 return this.eachPost(pruneBlank);
};

