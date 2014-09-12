
//TODO: Implement prototype methods for manipulating and walking the tree.
//TODO: Where to put the CSS ID List? Root Node again?
(function (){
"use strict";

var util = require("./util.js");
var ENUM =
{
 ROOT : "ROOT",
 P : "P",
 BLOCKQUOTE : "BLOCKQUOTE",
 COMMENT : "COMMENT",
 PRE : "PRE",
 DIV : "DIV",
 ID : "ID",
 CLASS : "CLASS",
 UL_LI : "UL_LI",
 OL_LI : "OL_LI",
 UL : "UL", //After Transform
 OL : "OL", //After Transform
 HEADER : "HEADER",
 DT : "DT",
 DD : "DD",
 DL : "DL", //After Transform
 TH : "TH",
 TD : "TD",
 HR : "HR",
 TR : "TR", //After Transform
 TRSEP : "TRSEP",
 TABLE : "TABLE", //After Transform
 LINK_INT : "LINK_INT",
 LINK_EXT : "LINK_EXT",
 LINK_IMG : "LINK_IMG",
 LINK_WIKI : "LINK_WIKI",
 DEL : "DEL",
 INS : "INS",
 UNDER : "UNDER",
 SUB : "SUB",
 SUP : "SUP",
 EM : "EM",
 STRONG : "STRONG",
 CODE : "CODE",
 TEXT : "TEXT" //After Transform
};


function ASTNode(type, attr)
{
 this.type = type || "";
 this.nodes = [];
}
function create(type, attr)
{
 return new ASTNode(type, attr);
}

ASTNode.create = create;
ASTNode.types = ENUM;
ASTNode.prototype = (function (){


 /*
 Private Methods
 ---------------
 */

 function appendText(text)
 {
  var textNode = ASTNode.create(ENUM.TEXT);
  textNode.nodes.push(text);
  this.nodes.push(textNode);
 }
 
 function newTable(cellNode)
 {
  return ASTNode.create(enumAST.TABLE).append(
   ASTNode.create(enumAST.TR).append(cellNode)
  );
 }

 //TODO: prev and next consolidation
 function pruneTable(node, prev, newNodes)
 {
  var isCell = node.type === enumAST.TD || node.type === enumAST.TH;
  
  if (prev.type === enumAST.TABLE)
  {
   if (isCell)
   {
    prev.last().append(node);
   }
   else if (node.type === enumAST.TRSEP)
   {
    prev.append(node);
    node.type = enumAST.TR;
   }
  }
  else if (isCell)
  {
   newNodes.push(newTable(node));
  }
 }

 function pruneDL(node, prev, newNodes)
 {
  if (prev.type === enumAST.DL)
  {
   prev.append(node);
  }
  else
  {
   newNodes.push(ASTNode.create(enumAST.DL).append(node));
  }
 }
 
 function pruneOL(node, prev, newNodes)
 {
  if (prev.type === enumAST.OL)
  {
   prev.append(node);
  }
  else
  {
   newNodes.push(ASTNode.create(enumAST.OL).append(node));
  }
 }
 
 function pruneUL(node, prev, newNodes)
 {
  if (prev.type === enumAST.UL)
  {
   prev.append(node);
  }
  else
  {
   newNodes.push(ASTNode.create(enumAST.UL).append(node));
  }
 }
 
 function pruneDeeper(node)
 {
  node.nodes = node.nodes.reduce(pruneReduce, []);
 }
 
 //Left-associative Breadth-first-search;
 function pruneReduce(newNodes, node, index, oldNodes)
 {
  var prev = "TODO",
   next = "TODO";

  if (node instanceof ASTNode && TODOMap[node.type])
  {
   TODOMap[node.type].call(null, node, newNodes);
  }
  else
  {
   newNodes.push(node);
  }

  //TODO: Recurse deeper into the tree.
  if (index === oldNodes.length - 1)
  {
   newNodes.forEach(pruneDeeper);
  }
  return newNodes;
 }

 
 /*
 TODO: AST Manipulation API.
 */
 

 /*
 Public Methods
 --------------
 */

 function prune()
 {
  this.nodes = this.nodes.reduce(pruneReduce, []);
  return this;
 }
 
 function append(nodeText)
 {
  if (util.isString(nodeText))
  {
   appendText.call(this, nodeText);
  }
  else if (nodeText instanceof ASTNode)
  {
   this.nodes.push(nodeText);
  }
  return this;
 }

 function appendChildren(node)
 {
  if (!(node instanceof ASTNode))
  {
   throw TypeError("ASTNode.appendChildren() expects ASTNode. (Was: " + typeof nodeText + ")");
  }
  node.forEach(append, this);
  return this;
 }
 
 function first()
 {
  return this.nodes[0];
 }

 function last()
 {
  return this.nodes[this.nodes.length - 1];
 }
 



 return {
  append : append,
  first : first,
  last : last
 };

}());


if (typeof module === "object" && module.exports)
{
 module.exports = ASTNode;
}
}());
