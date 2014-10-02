
//TODO: AST Manipulation API.
(function (){
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
 TH_TMP : "TH_TMP", //Private
 TD_TMP : "TD_TMP", //Private
 TR_TMP : "TR_TMP", //Private
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


 
/*
Method: Append
--------------
*/

MAP_APPEND =
{
 TR_TMP : appendTable,
 TH_TMP : appendTable,
 TD_TMP : appendTable,
 DT : appendDL,
 DD : appendDL,
 UL_LI : appendULOL,
 OL_LI : appendULOL,
 LI : appendULOL,
};

function appendTable(node)
{
 var last = this.last(), isRow = node.type === ENUM.TR_TMP;
 if (!(last && last.type === ENUM.TABLE))
 {
  if (isRow) {return;}
  last = ASTNode(ENUM.TABLE);
  appendSimple.call(this, last);
 }
 if (last.size() <= 0)
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
  node.type = node.type === ENUM.TD_TMP ? ENUM.TD : ENUM.TH;
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

function appendAfterLabel(node)
{
 var prev = this.last(),
  pAttr = prev.attr || {},
  nAttr = node.attr || {};

 if (!(prev && (prev.type === ENUM.ID || prev.type === ENUM.CLASS)))
 {
  return;
 }
 
 if (pAttr.id)
 {
  nAttr.id = pAttr.id;
 }
 else if (pAttr["class"])
 {
  nAttr["class"] = utils.isString(nAttr["class"]) ? nAttr["class"] : "";
  nAttr["class"] = nAttr["class"] + " " + last.attr["class"];
 }
}

function appendSimple(node)
{
 appendAfterClassID.call(this, node);
 this.nodes.push(node);
}

function append(nodeText)
{
 if (arguments.length > 1)
 {
  utils.toArray(arguments).forEach(this.append, this);
 }
 else if (Array.isArray(nodeText))
 {
  nodeText.forEach(this.append, this);
 }
 else if (utils.isString(nodeText) && nodeText.length > 0)
 {
  appendText.call(this, nodeText);
 }
 else if (nodeText instanceof ASTNode)
 {
  appendNode.call(this, nodeText);
 }
 return this;
}



function size()
{
 return this.nodes.length;
}

function pop()
{
 return this.nodes.pop();
}

function shift()
{
 return this.nodes.shift();
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
 this.nodes = [];
 return this;
}



/**
 * Sets the node's value, which can be anything. Currently, TEXT node
 * uses this to store the text it needs to serialize.
 */
function val(value)
{
 if (utils.isString(value))
 {
  this.value = value;
  return this;
 }
 return this.value;
}

/**
 * Flat forEach: Executes callback once for each direct child this node
 * contains.
 */
function each(callback, thisArg)
{
 if (Array.isArray(this.nodes))
 {
  this.nodes.forEach(function (node, index, sibs){
   callback.call(thisArg, node, index, sibs);
  });
 }
 return this;
}

/**
 * Flat filter: As .each(), except remove nodes that return a falsy value.
 */
function filter(callback, thisArg)
{
 if (Array.isArray(this.nodes))
 {
  this.nodes = this.nodes.filter(function (node, index, sibs){
   return callback.call(thisArg, node, index, sibs);
  });
 }
 return this;
}


/**
 * Traverses the abstract syntax tree in pre-order, executing callback 
 * once per node. Returns the starting node.
 */
function preEach(callback, thisArg)
{
 return preEachDo.call(this, callback, thisArg, []);
}

function preEachDo(callback, thisArg, stack)
{
 callback.call(thisArg, this, stack);
 this.each(function (node){
  stack.push(node);
  preEachDo.call(node, callback, thisArg, stack);
  stack.pop(node);
 });
 return this;
}


/**
 * As preEach, except it returns the accumulator instead.
 */
function preReduce(callback, acc, thisArg)
{
 return preReduceDo.call(this, callback, acc, thisArg, []);
}

function preReduceDo(callback, acc, thisArg, stack)
{
 acc = callback.call(thisArg, acc, this, stack);
 this.each(function (node){
  stack.push(node);
  acc = postReduceDo.call(node, callback, acc, thisArg, stack);
  stack.pop(node);
 });
 return acc;
}


/**
 * As preEach, except it traverses the tree in post-order.
 */
function postEach(callback, thisArg)
{
 return postEachDo.call(this, callback, thisArg, []);
}

function postEachDo(callback, thisArg, stack)
{
 this.each(function (node){
  stack.push(node);
  postEachDo.call(node, callback, thisArg, stack);
  stack.pop(node);
 });
 callback.call(thisArg, this, stack);
 return this;
}


/**
 * As preReduce, except it accumulates the value in post-order.
 */
function postReduce(callback, acc, thisArg)
{
 return postReduceDo.call(this, callback, acc, thisArg, []);
}

function postReduceDo(callback, acc, thisArg, stack)
{
 this.each(function (node){
  stack.push(node);
  acc = postReduceDo.call(node, callback, acc, thisArg, stack);
  stack.pop(node);
 });
 acc = callback.call(thisArg, acc, this, stack);
 return acc;
}



//TODO: Rewrite constructor to avoid double creation.
function ASTNode(type, attr)
{
 var obj = (this instanceof ASTNode) ? this : new ASTNode;
 obj.type = type || "";
 obj.attr = utils.isObject(attr) ? attr : {};
 obj.nodes = [];
 return obj;
}


module.exports = utils.extend(ASTNode,
{
 ENUM : ENUM,
 prototype :
 {
  append : append,
  size : size,
  pop : pop,
  shift : shift,
  first : first,
  last : last,
  empty : empty,
  val : val,
  each : each,
  filter : filter,
  preEach : preEach,
  preReduce : preReduce,
  postEach : postEach,
  postReduce : postReduce
 }
});

}());



