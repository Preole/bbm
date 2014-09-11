
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
 
 //TODO: Special append case for DL, UL, OL, and Table.
 function appendDL()
 {
 }

 function appendUL()
 {
 }
 
 function appendOL()
 {
 }
 
 function appendTable()
 {
 }
 
 function appendText(text)
 {
  var textNode = ASTNode.create(ENUM.TEXT);
  textNode.nodes.push(text);
  this.nodes.push(textNode);
 }

 function pruneBlock()
 {
  return this; //TODO: Actual filtering/pruning work.
 }
 

 /*
 Public Methods
 --------------
 */

 function prune()
 {
  return pruneBlock.call(this);
 }
 
 function append(nodeText)
 {
  if (util.isString(nodeText))
  {
   appendText.call(this, nodeText);
  }
  else if (nodeText instanceof ASTNode)
  {
   this.nodes.push(nodeText); //TODO: Delegate.
  }
  else
  {
   throw TypeError("ASTNode.append() expects ASTNode or String. (Was: " + typeof nodeText + ")");
  }
  return this;
 }

 function appendChildren(node)
 {
  if (!(node instanceof ASTNode))
  {
   throw TypeError("ASTNode.appendChildren() expects ASTNode. (Was: " + typeof nodeText + ")");
  }
  node.forEach(append, this); //Delegate to ASTNode.append;
  delete node.nodes;
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
  append : append
 };

}());


if (typeof module === "object" && module.exports)
{
 module.exports = ASTNode;
}
}());
