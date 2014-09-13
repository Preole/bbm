
//TODO: Implement prototype methods for manipulating and walking the tree.
//TODO: Where to put the CSS ID List? Root Node again?
(function (){
"use strict";

var utils = require("./utils.js");
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
 LI : "LI", //After Transform
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

 var switchAppend =
 {
  TRSEP : appendTable,
  TH : appendTable,
  TD : appendTable,
  DT : appendDL,
  DD : appendDL,
  UL_LI : appendUL,
  OL_LI : appendULOL,
  LI : appendULOL,
 },

 /*
 Private Methods : Append
 ------------------------
 */
 function appendTable(node)
 {
  var last = this.last(),
   isCell = node.type === enumAST.TD || node.type === enumAST.TH,
   isRow = node.type === enumAST.TRSEP;

  if (!(last && last.type === enumAST.TABLE))
  {
   if (isRow) {return;}
   last = ASTNode.create(enumAST.TABLE);
   appendNode.call(this, last);
  }
  if (last.nodes.length <= 0)
  {
   appendNode.call(last, ASTNode.create(enumAST.TR));
  }

  if (isCell)
  {
   appendNode.call(last.last(), node);
  }
  else if (isRow)
  {
   node.type = enumAST.TR;
   appendNode.call(last, node);
  }
 }
 
 function appendDL(node)
 {
  var last = this.last();
  if (!(last && last.type === enumAST.DL))
  {
   last = ASTNode.create(enumAST.DL);
   appendNode.call(this, last);
  }
  appendNode.call(last, node);
 }
 
 function appendULOL(node)
 {
  var listType = node.type === enumAST.OL_LI ? enumAST.OL : enumAST.UL,
   last = this.last();

  if (!(last && last.type === listType))
  {
   last = ASTEnum.create(listType);
   appendNode.call(this, last);
  }
  appendNode.call(last, node);
  node.type = enumAST.LI;
 }
 
 function appendText(text)
 {
  var textNode = ASTNode.create(ENUM.TEXT);
  textNode.nodes.push(text);
  this.nodes.push(textNode);
 }
 
 function appendNode(node)
 {
  this.nodes.push(node);
 }

 /*
 TODO: AST Manipulation API.
 */
 
 /*
 Public Methods
 --------------
 */
 
 function append(nodeText)
 {
  var isNode = nodeText instanceof ASTNode,
   nodeFunc = isNode ? switchAppend[nodeText.type] : null;
 
  if (utils.isString(nodeText))
  {
   appendText.call(this, nodeText);
  }
  else if (nodeFunc instanceof Function)
  {
   nodeFunc.call(this, nodeText);
  }
  else if (isNode)
  {
   appendNode.call(this, nodeText);
  }
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
