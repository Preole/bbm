
(function (){
"use strict";


var __ = require("./__.js");
var ENUM =
{
  _DT : "_DT"
, _DD : "_DD"
, _TH : "_TH"
, _TD : "_TD"
, _TR : "_TR"
, _LI_UL : "_LI_UL"
, _LI_OL : "_LI_OL"
, _ID : "_ID"
, _CLASS : "_CLASS"
, _DUMMY : "_DUMMY"

, ROOT : "ROOT"
, COMMENT : "COMMENT"
, P : "P"
, BLOCKQUOTE : "BLOCKQUOTE"
, PRE : "PRE"
, DIV : "DIV"
, LI : "LI"
, UL : "UL"
, OL : "OL"
, HEADER : "HEADER"
, DT : "DT"
, DD : "DD"
, DL : "DL"
, TH : "TH"
, TD : "TD"
, HR : "HR"
, TR : "TR"
, TABLE : "TABLE"
, LINK_INT : "LINK_INT"
, LINK_EXT : "LINK_EXT"
, LINK_IMG : "LINK_IMG"
, LINK_WIKI : "LINK_WIKI"
, DEL : "DEL"
, U : "U"
, SUB : "SUB"
, SUP : "SUP"
, EM : "EM"
, BOLD : "BOLD"
, CODE : "CODE"
, TEXT : "TEXT"
};



/*
Private Methods
---------------
*/

function __mapArgs(node)
{
 var res = node;
 if ((__.isString(res) && res.length > 0) || __.isNumber(res))
 {
  res = BBM(ENUM.TEXT).text(res + "");
 }
 if (isNode(res))
 {
  res.replaceWith();
  res._parent = this;
 }
 return res;
}

function __procArgs(elems, node)
{
 return __.isArray(elems)
 ? __.flatten(elems).map(__mapArgs, node).filter(isNode)
 : __mapArgs.call(node, elems);
}

function __nullParent(node)
{
 if (isNode(node))
 {
  node._parent = null;
 }
}

function __empty(node)
{
 var kids = node.children();
 var nodes = kids.length > 0 ? kids.splice(0, kids.length) : kids;
 nodes.forEach(__nullParent);
 return nodes;
}



/*
Basic & Low-Level Accessors
---------------------------
*/

function splice(from, count, elems)
{
 var eles = __procArgs(elems, this);
 var kids = this.children();
 var args = __.isArray(eles) ? [from, count].concat(eles) : eles;
 var removed = __.isArray(args)
 ? kids.splice.apply(kids, args)
 : isNode(args)
 ? kids.splice(from, count, args)
 : kids.splice(from, count);
 
 removed.forEach(__nullParent);
 return this;
}

function parent()
{
 return this._parent;
}

function children(shallow)
{
 return shallow ? this._nodes.slice() : this._nodes;
}

function size()
{
 return this.children().length;
}

function last()
{
 return this.children()[this.children().length - 1];
}

function first()
{
 return this.children()[0];
}

function isFirstChild()
{
 return this.parent() && this.parent().first() === this;
}

function isLastChild()
{
 return this.parent() && this.parent().last() === this;
}




/*
Manipulation
------------
*/

function pop()
{
 __nullParent(this.children().pop());
 return this;
}

function shift()
{
 __nullParent(this.children().shift());
 return this;
}


function append(content)
{
 var eles = __procArgs(content, this), kids = this.children();
 if (isNode(eles))
 {
  kids.push(eles);
 }
 else if (__.isArray(eles))
 {
  kids.push.apply(kids, eles);
 }
 return this;
}

function prepend(content)
{
 var eles = __procArgs(content, this), kids = this.children();
 if (isNode(eles))
 {
  kids.unshift(eles);
 }
 else if (__.isArray(eles))
 {
  kids.unshift.apply(kids, eles);
 }
 return this;
}

function replaceWith(content)
{
 var pos = this.parent() ? this.parent().children().indexOf(this) : -1;
 if (pos > -1)
 {
  this.parent().splice(pos, 1, content);
 }
 return this;
}

function replace(target)
{
 if (isNode(target))
 {
  target.replaceWith(this);
 }
 return this;
}

function empty()
{
 __empty(this);
 return this;
}



/*
Children Iteration
------------------
*/

function filterChild(callback)
{
 var that = this;
 __empty(that).forEach(function (node, index, sibs){
  that.append(callback.call(that, node, index, sibs) ? node : null);
 });
 return that;
}

function rebuildChild(callback)
{
 __empty(this).forEach(callback, this);
 return this;
}



/*
Subtree Iteration
-----------------
*/

/**
 * @desc Depth-first pre-order traversal.
 */
function eachPre(callback, params)
{
 return __eachPre(this, this, callback, params);
}

function __eachPre(start, curr, callback, params)
{
 callback.call(start, curr, params);
 curr.children().forEach(function (node){
  __eachPre(start, node, callback, params);
 });
 return start;
}

function find(callback, params)
{
 var res = [];
 this.eachPre(function (node){
  if (callback.call(this, node, params))
  {
   res.push(this);
  }
 });
 return res;
}

/**
 * @desc Depth-first post-order traversal.
 */
function eachPost(callback, params)
{
 return __eachPost(this, this, callback, params);
}

function __eachPost(start, curr, callback, params)
{
 curr.children().forEach(function (node){
  __eachPost(start, node, callback, params);
 });
 callback.call(start, curr, params);
 return start;
}


/*
Attributes, Properties, and Class Extension
-------------------------------------------
*/

function text(val)
{
 if (arguments.length === 0)
 {
  return this._value || "";
 }
 if ((__.isString(val) && val.length > 0) || __.isNumber(val))
 {
  this._value = val;
 }
 return this;
}

function attr(key, val)
{
 if (__.isObject(key))
 {
  __.extend(this._attr, key);
 }
 else if (arguments.length === 0)
 {
  return this._attr;
 }
 else if (arguments.length === 1)
 {
  return __.get(this._attr, key);
 }
 else if (arguments.length > 1)
 {
  this._attr[key] = val + "";
 }
 return this;
}

function removeAttr(key)
{
 if (arguments.length === 1)
 {
  delete this._attr[key];
 }
 if (arguments.length === 0)
 {
  this._attr = {};
 }
 return this;
}

function type(newType)
{
 if (arguments.length === 0)
 {
  return this._type;
 }
 this._type = (newType + "").toLocaleUpperCase();
 return this;
}

function extend(extendObj)
{
 return __.extend(this, extendObj);
}

function toJSON()
{
 var obj = __.extend({}, this);
 delete obj._parent;
 return obj;
}



/*
Public: Constructors & Static Methods
-------------------------------------
*/

function BBM(type)
{
 var obj = Object.create(BBM.prototype);
 obj._type = (__.isString(type) ? type : "").toLocaleUpperCase();
 obj._attr = {};
 obj._nodes = [];
 obj._parent = null;
 return obj;
}

function isNode(target)
{
 return BBM.prototype.isPrototypeOf(target);
}




/*
Export basic API
----------------
*/

BBM.fn = BBM.prototype =
{
  splice : splice
, parent : parent
, children : children
 
, size : size
, last : last
, first : first
, isLastChild : isLastChild
, isFirstChild : isFirstChild

, pop : pop
, shift : shift
, append : append
, prepend : prepend
, replaceWith : replaceWith
, replace : replace
, empty : empty

, filterChild : filterChild
, rebuildChild : rebuildChild

, eachPre : eachPre
, find : find
, eachPost : eachPost

, text : text
, attr : attr
, type : type
, removeAttr : removeAttr
, extend : extend
, toJSON : toJSON
};


module.exports = __.extend(BBM, __, {ENUM : ENUM, isNode : isNode});
}());

