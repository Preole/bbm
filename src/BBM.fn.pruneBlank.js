(function (){
"use strict";

var BBM = require("./BBM.js");
var ENUM = BBM.ENUM;
var DUMMY = BBM("_DUMMY");
var LINKS = [ENUM.LINK_EXT, ENUM.LINK_INT, ENUM.LINK_WIKI];
var ALONE =
[
  ENUM.PRE
, ENUM.TD
, ENUM.TH
, ENUM.HR
, ENUM.LINK_EXT
, ENUM.LINK_INT
, ENUM.LINK_WIKI
, ENUM.LINK_IMG
, ENUM.COMMENT
];


function isBlank(node)
{
 return BBM.isBlankString(node.text())
 && node.size() === 0
 && ALONE.indexOf(node.type()) === -1;
}

function isKept(node)
{
 return node.text().length > 0 || !isBlank(node);
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
    rNode.append(BBM(ENUM.TD));
   }
  }
 });
}

function pruneDL(node)
{
 var ht = null;
 while ((ht = node.first()) && ht.type() === ENUM.DD)
 {
  node.shift();
 }
 
 while ((ht = node.last()) && ht.type() === ENUM.DT)
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
 
 if (type === ENUM.TABLE)
 {
  pruneTR(node);
 }
 else if (type === ENUM.DL)
 {
  pruneDL(node);
 }
 node.filterChild(isKept);
}



BBM.fn.pruneBlank = function ()
{
 return this.eachPost(pruneBlank);
};

}());


