
//TODO: AST Manipulation API.
module.exports = (function (){
"use strict";

var utils = require("./utils.js"),
ENUM =
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
 LI : "LI",
 UL : "UL",
 OL : "OL",
 HEADER : "HEADER",
 DT : "DT",
 DD : "DD",
 DL : "DL",
 TH : "TH",
 TD : "TD",
 HR : "HR",
 TR : "TR",
 TRSEP : "TRSEP", //Private
 TABLE : "TABLE",
 LINK_INT : "LINK_INT",
 LINK_EXT : "LINK_EXT",
 LINK_IMG : "LINK_IMG",
 LINK_WIKI : "LINK_WIKI",
 DEL : "DEL",
 INS : "INS",
 U : "U",
 SUB : "SUB",
 SUP : "SUP",
 EM : "EM",
 BOLD : "BOLD",
 CODE : "CODE",
 TEXT : "TEXT"
},

MAP_APPEND =
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
 var last = this.last(), isRow = node.type === ENUM.TRSEP;
 if (!(last && last.type === ENUM.TABLE))
 {
  if (isRow) {return;}
  last = ASTNode(ENUM.TABLE);
  appendSimple.call(this, last);
 }
 if (last.nodes.length <= 0)
 {
  appendSimple.call(last, ASTNode(ENUM.TR));
 }

 if (isRow)
 {
  node.type = ENUM.TR;
  appendSimple.call(last, node);
 }
 else
 {
  appendSimple.call(last.last(), node);
 }
}

function appendDL(node)
{
 var last = this.last();
 if (!(last && last.type === ENUM.DL))
 {
  last = ASTNode(ENUM.DL);
  appendSimple.call(this, last);
 }
 appendSimple.call(last, node);
}

function appendULOL(node)
{
 var listType = node.type === ENUM.OL_LI ? ENUM.OL : ENUM.UL,
  last = this.last();
  
 if (!(last && last.type === listType))
 {
  last = ASTNode(listType);
  appendSimple.call(this, last);
 }
 appendSimple.call(last, node);
 node.type = ENUM.LI;
}

function appendText(text)
{
 var last = this.last();
 if (last && last.type === ENUM.TEXT)
 {
  last.value = last.value ? last.value + text : text;
 }
 else
 {
  appendSimple.call(this, ASTNode(ENUM.TEXT).val(text));
 }
}

function appendNode(node)
{
 if (MAP_APPEND[node.type])
 {
  MAP_APPEND[node.type].call(this, node);
 }
 else
 {
  appendSimple.call(this, node);
 }
}

function appendSimple(node)
{
 this.nodes.push(node);
 node.parent = this;
}



/*
Public Methods
--------------
*/
function append(nodeText)
{
 if (utils.isString(nodeText) && nodeText.length > 0)
 {
  appendText.call(this, nodeText);
 }
 else if (nodeText instanceof ASTNode)
 {
  appendNode.call(this, nodeText);
 }
 else if (Array.isArray(nodeText))
 {
  nodeText.forEach(this.append, this);
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
 if (Array.isArray(this.nodes))
 {
  this.nodes = [];
 }
 return this;
}

function val(value)
{
 if (utils.isString(value))
 {
  this.value = value;
  return this;
 }
 return this.value;
}

function toJSON()
{
 var obj = utils.extend({}, this);
 delete obj.parent;
 return obj;
}





function ASTNode(type, attr)
{
 var obj = (this instanceof ASTNode) ? this : new ASTNode;
 obj.type = type || "";
 obj.parent = null;
 obj.attr = utils.isObject(attr) ? attr : {};
 obj.nodes = [];
 return obj;
}

utils.extend(ASTNode,
{
 ENUM : ENUM,
 prototype :
 {
  append : append,
  first : first,
  last : last,
  empty : empty,
  val : val,
  toJSON : toJSON
 }
});

return ASTNode;
}());



