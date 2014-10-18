(function (){
"use strict";

var __ = require("./__.js"),
ASTNode = require("./ASTNode.js"),
AST = ASTNode.ENUM,
AST_ALONE =
[
 AST.PRE,
 AST.TD,
 AST.TH,
 AST.HR,
 AST.TEXT,
 AST.LINK_EXT,
 AST.LINK_INT,
 AST.LINK_WIKI,
 AST.LINK_IMG
];



function isNotBlank(node)
{
 return !__.isBlankString(__.isString(node.val()) ? node.val() : "")
  || node.size() > 0
  || AST_ALONE.indexOf(node.type) > -1;
}

function isNodeKept(node)
{
 return AST_ALONE.indexOf(node.type) > -1 || node.size() > 0;
}

function recurseTR(node)
{
 node.filter(function (rNode, index, sibs){
  var gCol = sibs[0].size();
  
  if (rNode.size() <= 0)
  {
   return false;
  }
  while (rNode.size() > gCol)
  {
   rNode.pop();
  }
  while (rNode.size() < gCol)
  {
   rNode.append(ASTNode(AST.TD));
  }
  return true;
 });
}

function recurseDL(node)
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

function recurseBlank(node)
{
 if (!node.some(isNotBlank))
 {
  node.empty();
 }

 if (node.type === AST.TABLE)
 {
  recurseTR(node);
 }
 else if (node.type === AST.DL)
 {
  recurseDL(node);
 }
 
 node.filter(isNodeKept);
}



ASTNode.prototype.resolveBlank = function ()
{
 return this.postEach(recurseBlank, this);
};


}());


