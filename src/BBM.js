
"use strict";

var __ = require("./__.js");
var BBM = module.exports = function (type)
{
 var obj = Object.create(BBM.prototype);
 obj._type = String(type).toLocaleUpperCase();
 obj._attr = {};
 obj._nodes = [];
 obj._parent = null;
 return obj;
};


var ENUM = BBM.ENUM = (function (){

var obj = {};
var enums =
[
  "_DT"
, "_DD"
, "_TH"
, "_TD"
, "_TR"
, "_LI_UL"
, "_LI_OL"
, "_ID"
, "_CLASS"
, "_DUMMY"

, "ROOT"
, "COMMENT"
, "P"
, "BLOCKQUOTE"
, "PRE"
, "DIV"
, "LI"
, "UL"
, "OL"
, "HEADER"
, "DT"
, "DD"
, "DL"
, "TH"
, "TD"
, "HR"
, "TR"
, "TABLE"
, "LINK_INT"
, "LINK_EXT"
, "LINK_IMG"
, "LINK_WIKI"
, "DEL"
, "U"
, "SUB"
, "SUP"
, "EM"
, "BOLD"
, "CODE"
, "TEXT"
];

enums.forEach(function (name){
 obj[name] = name;
});

return obj;
}());


BBM.isNode = function (target)
{
 return BBM.prototype.isPrototypeOf(target);
};

BBM.fn = (function (fn){

// Private Methods
// ---------------

function mapArgs(node, parent)
{
 if ((__.isString(node) && node.length > 0) || __.isNumber(node))
 {
  return BBM(ENUM.TEXT).text(String(node));
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
 return node;
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



// Low Level Manipulation & Basic Accessors
// ----------------------------------------

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

fn.parent = function ()
{
 return this._parent;
};


fn.children = function (shallow)
{
 return shallow ? this._nodes.slice() : this._nodes;
};

fn.size = function ()
{
 return this.children().length;
};

fn.first = function ()
{
 return this.children()[0];
};

fn.last = function ()
{
 return this.children()[this.children().length - 1];
};

fn.isFirstChild = function ()
{
 return this.parent() && this.parent().first() === this;
};

fn.isLastChild = function ()
{
 return this.parent() && this.parent().last() === this;
};



// Manipulation
// ------------

fn.pop = function ()
{
 return nullParent(this.children().pop());
};


/**
 * Removes the node's first child.
 * 
 * @method shift
 * @return {(BBM|undefined)} The node's first child, or undefined if there's none.
 */
fn.shift = function ()
{
 return nullParent(this.children().shift());
};


fn.append = function (content)
{
 var eles = procArgs(content, this);
 var kids = this.children();
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


fn.prepend = function (content)
{
 var eles = procArgs(content, this);
 var kids = this.children();
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


fn.replaceWith = function (content)
{
 var pos = this.parent() ? this.parent().children().indexOf(this) : -1;
 if (pos > -1)
 {
  this.parent().splice(pos, 1, content);
 }
 return this;
};

fn.replace = function (target)
{
 if (BBM.isNode(target))
 {
  target.replaceWith(this);
 }
 return this;
};


/**
 * Detaches all child nodes from the current node.
 *
 * @method empty
 * @return {BBM} The current node with an empty children list.
 */
fn.empty = function ()
{
 empty(this);
 return this;
};






// Children Modification
// ---------------------

/**
 * Rebuilds the current node's children list, reattaching each node that 
 * returns truthy in the callback function.
 *
 * @method filterChild
 * @param {function} callback Called on each child node being visited.
 * @return {BBM} The current node after modification.
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
 * Rebuilds the current node's children list. As BBM.filterChild, except the 
 * callback function is responsible for explicitly adding the child nodes 
 * back.
 *
 * @method rebuildChild
 * @param {function} callback Called on each child node being visited.
 * @return {BBM} The current node after modification.
 */
fn.rebuildChild = function (callback)
{
 var that = this;
 empty(that).forEach(function (node, index, sibs){
  callback(that, node, index, sibs);
 });
 return that;
};




// Subtree Iteration
// -----------------


fn.eachPre = function (callback, params)
{
 return eachPre(this, this, callback, params);
};


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


fn.eachPost = function (callback, params)
{
 return eachPost(this, this, callback, params);
};



// Attributes, Properties, and Class Extension
// -------------------------------------------

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
  this._attr[key] = String(val);
 }
 return this;
};


fn.removeAttr = function (key)
{
 if (arguments.length >= 1)
 {
  delete this._attr[key];
 }
 else
 {
  this._attr = {};
 }
 return this;
};


/**
 * Retrieves or sets the node's type.
 * 
 * @method type
 * @param {(String|Number)} [newType] The type String to set the node into.
 * @return {(String|BBM)} If no parameters, the node's type name; Otherwise, 
   the modified BBM instance with a new type.
 */
fn.type = function (newType)
{
 if (arguments.length === 0)
 {
  return this._type;
 }
 this._type = String(newType).toLocaleUpperCase();
 return this;
};


fn.toJSON = function ()
{
 var obj = __.extend({}, this);
 delete obj._parent;
 return obj;
};


return fn;
}(BBM.prototype));
