(function (){
"use strict";

var BBM = require("./BBM.js");
var AST = BBM.ENUM;
var DUMMY = BBM("_DUMMY");
var LINKS = [AST.LINK_EXT, AST.LINK_INT, AST.LINK_WIKI];
var ALONE =
[
  AST.PRE
, AST.TD
, AST.TH
, AST.LI
, AST.BLOCKQUOTE
, AST.DD
, AST.DT
, AST.HR
, AST.DIV
, AST.LINK_EXT
, AST.LINK_INT
, AST.LINK_WIKI
, AST.LINK_IMG
, AST.COMMENT
];


function isBlank(node)
{
 return BBM.isBlankString(node.text())
 && node.size() === 0
 && ALONE.indexOf(node.type()) === -1;
}

function isKept(node)
{
 return node.text() || !isBlank(node);
}

function pruneTR(node)
{
 var maxCol = Math.min((node.first() || DUMMY).size(), 64);
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
 if (node.children().every(isBlank))
 {
  node.empty().append(LINKS.indexOf(type) > -1 ? node.attr("href") : null);
  return;
 }
 
 node.filterChild(isKept);
 if (type === AST.TABLE)
 {
  pruneTR(node);
 }
 else if (type === AST.DL)
 {
  pruneDL(node);
 }
}



BBM.fn.pruneBlank = function ()
{
 return this.eachPost(pruneBlank);
};

}());


