
//TODO: AST Manipulation API.
(function (){
"use strict";

var utils = require("./utils.js");
var ENUM =
{
 ROOT : "ROOT",
 P : "P",
 BLOCKQUOTE : "BLOCKQUOTE",
 PRE : "PRE",
 DIV : "DIV",
 ID : "ID", //Private
 CLASS : "CLASS", //Private
 UL_LI : "UL_LI", //Private
 OL_LI : "OL_LI", //Private
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
 TRSEP : "TRSEP", //Private
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
 BOLD : "BOLD",
 CODE : "CODE",
 TEXT : "TEXT" //After Transform
};

//Nodes that should have no descendants.
var NODESC = [ENUM.HR, ENUM.CLASS, ENUM.ID, ENUM.LINK_IMG];

function ASTNode(type, attr)
{
 this.type = type || "";
 if (type !== ENUM.TEXT)
 {
  this.attr = utils.isObject(attr) ? attr : {};
 }
 if (NODESC.indexOf(type) === -1)
 {
  this.nodes = [];
 }
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
  UL_LI : appendULOL,
  OL_LI : appendULOL,
  LI : appendULOL,
 };

 /*
 Private Methods : Append
 ------------------------
 */
 function appendTable(node)
 {
  var last = this.last(),
   isCell = node.type === ENUM.TD || node.type === ENUM.TH,
   isRow = node.type === ENUM.TRSEP;

  if (!(last && last.type === ENUM.TABLE))
  {
   if (isRow) {return;}
   last = ASTNode.create(ENUM.TABLE);
   appendNode.call(this, last);
  }
  if (last.nodes.length <= 0)
  {
   appendNode.call(last, ASTNode.create(ENUM.TR));
  }

  if (isCell)
  {
   appendNode.call(last.last(), node);
  }
  else if (isRow)
  {
   node.type = ENUM.TR;
   appendNode.call(last, node);
  }
 }
 
 function appendDL(node)
 {
  var last = this.last();
  if (!(last && last.type === ENUM.DL))
  {
   last = ASTNode.create(ENUM.DL);
   appendNode.call(this, last);
  }
  appendNode.call(last, node);
 }
 
 function appendULOL(node)
 {
  var listType = node.type === ENUM.OL_LI ? ENUM.OL : ENUM.UL,
   last = this.last();
   
  if (!(last && last.type === listType))
  {
   last = ASTNode.create(listType);
   appendNode.call(this, last);
  }
  appendNode.call(last, node);
  node.type = ENUM.LI;
 }
 
 function appendText(text)
 {
  var last = this.last();
  if (last && last.type === ENUM.TEXT)
  {
   last.nodes[0] += text;
  }
  else
  {
   last = ASTNode.create(ENUM.TEXT);
   last.nodes.push(text);
   this.nodes.push(last);
  }
 }
 
 function appendNode(node)
 {
  if (!utils.hasOwn(ENUM, node.type))
  {
   throw TypeError(node.type + " is not member of ASTNode.types");
  }
  this.nodes.push(node);
 }

 /*
 Public Methods
 --------------
 */
 
 function append(nodeText)
 {
  var isNode = nodeText instanceof ASTNode,
   nodeFunc = isNode ? switchAppend[nodeText.type] : null;
 
  if (utils.isString(nodeText) && nodeText.length > 0)
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
 
 function empty()
 {
  if (this.nodes instanceof Array)
  {
   this.nodes = [];
  }
  return this;
 }


 return {
  append : append,
  first : first,
  last : last,
  empty : empty
 };

}());


if (typeof module === "object" && module.exports)
{
 module.exports = ASTNode;
}
}());
