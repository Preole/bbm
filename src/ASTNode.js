
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
 this.parent = null;
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


 /*
 Private Methods : Text
 ----------------------
 */
 function textReduce(accText, node)
 {
  if (node.type === enumAST.TEXT)
  {
   accText += node.nodes.join("");
  }
  else if (node.nodes instanceof Array)
  {
   accText += node.nodes.reduce(textReduce, "");
  }
  return accText;
 }

 
 /*
 Private Methods : Append
 ------------------------
 */
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
   last.parent = this;
  }
 }
 
 function appendNode(node)
 {
  if (!utils.hasOwn(ENUM, node.type))
  {
   throw TypeError(node.type + " is not member of ASTNode.types");
  }
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

 function some(callback, thisArg)
 {
  return this.nodes ? this.nodes.some(callback, this) : false;
 }
 
 function text(innerText)
 {
  if (arguments.length > 0 && utils.isString(innerText))
  {
   return this.empty().append(innerText);
  }
  return node.nodes.reduce(textReduce, "");
 }
 
 function toJSON()
 {
  var obj = utils.extend({}, this);
  delete obj.parent;
  return obj;
 }
 

 return {
  append : append,
  first : first,
  last : last,
  empty : empty,
  some : some,
  text : text,
  toJSON : toJSON
 };

}());


if (typeof module === "object" && module.exports)
{
 module.exports = ASTNode;
}
}());


