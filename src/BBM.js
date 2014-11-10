
"use strict";


/*
Constructor TODO: Cleaner variable declarations.
-----------
*/

var __ = require("./__.js");
var BBM = module.exports = function (type)
{
 var obj = Object.create(BBM.prototype);
 obj._type = (__.isString(type) ? type : "").toLocaleUpperCase();
 obj._attr = {};
 obj._nodes = [];
 obj._parent = null;
 return obj;
};

var ENUM = BBM.ENUM =
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




/**
 * 
 */
BBM.isNode = function (target)
{
 return BBM.prototype.isPrototypeOf(target);
};
BBM.__ = __;





/*
Low Level Manipulation & Basic Accessors
----------------------------------------
*/

BBM.fn = BBM.prototype = (function (fn){


/*
Private Methods
---------------
*/

function mapArgs(node, parent)
{
 if ((__.isString(node) && node.length > 0) || __.isNumber(node))
 {
  return BBM(ENUM.TEXT).text(node + "");
 }
 if (BBM.isNode(node))
 {
  node.replaceWith();
  node._parent = parent;
 }
 return node;
}

function procArgs(elems, parent)
{
 return __.isArray(elems)
 ? __.map(__.flatten(elems), mapArgs, parent).filter(BBM.isNode)
 : mapArgs(elems, parent);
}

function nullParent(node)
{
 if (BBM.isNode(node))
 {
  node._parent = null;
 }
}

function empty(node)
{
 var kids = node.children();
 var nodes = kids.length > 0 ? kids.splice(0, kids.length) : kids;
 nodes.forEach(nullParent);
 return nodes;
}

function eachPre(start, curr, callback, params)
{
 callback.call(start, curr, params);
 curr.children().forEach(function (node){
  eachPre(start, node, callback, params);
 });
 return start;
}

function eachPost(start, curr, callback, params)
{
 curr.children().forEach(function (node){
  eachPost(start, node, callback, params);
 });
 callback.call(start, curr, params);
 return start;
}



/**
 * 
 */
fn.splice = function (from, count, elems)
{
 var eles = procArgs(elems, this);
 var kids = this.children();
 var args = __.isArray(eles) ? [from, count].concat(eles) : eles;
 var removed = __.isArray(args)
 ? kids.splice.apply(kids, args)
 : BBM.isNode(args)
 ? kids.splice(from, count, args)
 : kids.splice(from, count);
 
 removed.forEach(nullParent);
 return this;
};



/**
 * 
 */
fn.parent = function ()
{
 return this._parent;
};



/**
 * 
 */
fn.children = function (shallow)
{
 return shallow ? this._nodes.slice() : this._nodes;
};



/**
 * 
 */
fn.size = function ()
{
 return this.children().length;
};


/**
 * 
 */
fn.first = function ()
{
 return this.children()[0];
};


/**
 * 
 */
fn.last = function ()
{
 return this.children()[this.children().length - 1];
};


/**
 * 
 */
fn.isFirstChild = function ()
{
 return this.parent() && this.parent().first() === this;
};


/**
 * 
 */
fn.isLastChild = function ()
{
 return this.parent() && this.parent().last() === this;
};



/*
Manipulation
------------
*/

/**
 * 
 */
fn.pop = function ()
{
 nullParent(this.children().pop());
 return this;
};


/**
 * 
 */
fn.shift = function ()
{
 nullParent(this.children().shift());
 return this;
};


/**
 * 
 */
fn.append = function (content)
{
 var eles = procArgs(content, this), kids = this.children();
 if (BBM.isNode(eles))
 {
  kids.push(eles);
 }
 else if (__.isArray(eles))
 {
  kids.push.apply(kids, eles);
 }
 return this;
};


/**
 * 
 */
fn.prepend = function (content)
{
 var eles = procArgs(content, this), kids = this.children();
 if (BBM.isNode(eles))
 {
  kids.unshift(eles);
 }
 else if (__.isArray(eles))
 {
  kids.unshift.apply(kids, eles);
 }
 return this;
};


/**
 * 
 */
fn.replaceWith = function (content)
{
 var pos = this.parent() ? this.parent().children().indexOf(this) : -1;
 if (pos > -1)
 {
  this.parent().splice(pos, 1, content);
 }
 return this;
};


/**
 * 
 */
fn.replace = function (target)
{
 if (BBM.isNode(target))
 {
  target.replaceWith(this);
 }
 return this;
};


/**
 * 
 */
fn.empty = function ()
{
 empty(this);
 return this;
};






/*
Children Iteration
------------------
*/

/**
 * 
 */
fn.filterChild = function (callback)
{
 var that = this;
 empty(that).forEach(function (node, index, sibs){
  that.append(callback.call(that, node, index, sibs) ? node : null);
 });
 return that;
};


/**
 * 
 */
fn.rebuildChild = function (callback)
{
 var that = this;
 empty(that).forEach(function (node, index, sibs){
  callback(that, node, index, sibs);
 });
 return that;
};



/*
Subtree Iteration
-----------------
*/

/**
 * 
 */
fn.eachPre = function (callback, params)
{
 return eachPre(this, this, callback, params);
};


/**
 * 
 */
fn.find = function (callback, params)
{
 var res = [];
 this.eachPre(function (node){
  if (callback.call(this, node, params))
  {
   res.push(this);
  }
 });
 return res;
};


/**
 * 
 */
fn.eachPost = function (callback, params)
{
 return eachPost(this, this, callback, params);
};



/*
Attributes, Properties, and Class Extension
-------------------------------------------
*/

/**
 * 
 */
fn.text = function (val)
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
};


/**
 * 
 */
fn.attr = function (key, val)
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
};


/**
 * 
 */
fn.removeAttr = function (key)
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
};


/**
 * 
 */
fn.type = function (newType)
{
 if (arguments.length === 0)
 {
  return this._type;
 }
 this._type = (newType + "").toLocaleUpperCase();
 return this;
};


/**
 * 
 */
fn.extend = function (extendObj)
{
 return __.extend(this, extendObj);
};


/**
 * 
 */
fn.toJSON = function ()
{
 var obj = __.extend({}, this);
 delete obj._parent;
 return obj;
};


return fn;
}(BBM.prototype));
