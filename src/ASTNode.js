
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
  OL_LI : appendOL
 },
 inlineList = [enumAST.P, enumAST.HEADER, enumAST.DT];
 blockList = (function (){
  return [
   enumAST.ID,
   enumAST.CLASS,
   enumAST.TD,
   enumAST.TH,
   enumAST.PRE,
   enumAST.COMMENT
  ];
 }());
 tableList = [enumAST.TD, enumAST.TH];


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
  var listType = node.type === enumAST.UL_LI ? enumAST.UL : enumAST.OL,
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

 //TODO: Filter paragraphs with blank content/text; That is:
 //<p>  <strong>   </strong>   <em>   </em>   </p>
 
 //(p, dt)
 /*
 If a <p> or <dt> node contains only blanks, return true.
 */
 function isNotEmptyInline(node)
 {
  if (!(node instanceof ASTNode))
  {
   return false;
  }
  if (node.type === enumAST.LINK_IMG)
  {
   return true;
  }
  if (node.type === enumAST.TEXT)
  {
   return !utils.isBlankString(node.nodes[0]);
  }
  return node.nodes.length > 0 && node.nodes.every(isNotEmptyInline);
 }
 
 //Filter blockNode:empty... TODO: Use .filter instead?
 function isNotEmptyBlock(node)
 {
  if (!(node instanceof ASTNode))
  {
   return false;
  }
  if (blockList.indexOf(node.type) !== -1)
  {
   if (tableList.indexOf(node.type) !== -1)
   {
    //TODO: Clean TD, TH subtree, but do not remove such empty elements.
    node.nodes = node.nodes.filter(isNotEmptyBlock);
   }
   return true;
  }
  if (inlineList.indexOf(node.type) !== -1)
  {
   return node.nodes.every(isNotEmptyInline);
  }
  return node.nodes.length > 0 && node.nodes.every(isNotEmptyBlock);
 }
 
 function isNotLeafBlock(node)
 {
  return node instanceof ASTNode && node.nodes.length > 0;
 }
 
 function pruneTableRows(rowNode, index, siblings)
 {
  var gCol = siblings[0].nodes.length, //TODO: Type checking, guards.
   rCol = rowNode.nodes.length;

  if (rCol > gCol)
  {
   rowNode.nodes = rowNode.nodes.slice(0, gCol);
  }
  else if (rCol < gCol)
  {
   rowNode.nodes = rowNode.nodes.concat(TODO); //TODO: Add cells in this row.
  }
 }

 function pruneTable(node)
 {
  var first = node.first(),
   cols = first instanceof ASTNode ? first.nodes.length : 0;
   
  node.nodes = node.nodes.filter(isNotLeafBlock); //Kill empty rows
  node.nodes.forEach(pruneTableRows); //Uniform row columns.
 }

 function pruneDL(node)
 {
  var first = node.first();
  while (first && first.type === enumAST.DD)
  {
   node.nodes.shift();
  }
  
  var last = node.last();
  while (last && last.type === enumAST.DT)
  {
   node.nodes.pop();
  }
 }

 //(li, th, td, bq, dd) > p:only-child -> take its descendants.
 function pruneLonePara(node)
 {
  var first = node.first(),
   nodeCount = node.nodes.length;

  if (nodeCount === 1 && first.type === enumAST.P)
  {
   node.nodes = first.nodes;
  }
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
  //TODO: Start the tree traversal method.
  return this;
 }
 
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
  prune : prune,
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
