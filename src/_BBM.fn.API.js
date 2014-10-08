(function (){
"use strict";

var BBM = require("./BBM.js"),
__TMP = ASTNode("TODO: Temporary Node Type"),
__aProto = Array.prototype,
__aSplice = __aProto.splice,
__aPush = __aProto.push,
__aUnshift = __aProto.unshift;


//require("./BBM.fn.traversing.js");
//
/*
TODO: Regarding the table structure... 
1. Special append + Filtering. (Current: Bit too coupled...)
2. Full filtering... One big step? Or in two small steps? (Guess this is the way)
3. Modify compiler to create such a structure (Too complicated).

TODO: Privacy convention:

1. "__" Two underscores for private static variables.
2. "_" One underscore for private instance variables.
*/

function __filterInserts(value, index, array)
{
 var val = value;
 if (TODO.isString(val) && val.length > 0)
 {
  val = TODO.textNode(val);
  array[index] = val;
 }
 if (TODO.isNode(val))
 {
  //Update parent pointers: val._parent = this;
 }
 return TODO.isNode(val);
}

/**
 * Default filtering: Remove all children and nullify their parent pointers.
 */
function _filterChild(node, index, sibs)
{
 if (node._parent === this)
 {
  node._parent = null;
 }
}



/**
 * TODO: Use null object or decorator pattern.
 */
function parent()
{
 return this._parent;
}

/**
 * @desc Returns the node's parents chain contained in an Array. 
 * Returns an empty Array if the node has no parent. The nodes returned 
 * are in ascending order by their distance from the current node.
 *
 * [parent, grandparent, ... , root];
 */
function parents()
{
 var list = [], par = this._parent;
 while (par = this._parent)
 {
  list.push(par);
 }
 return list;
}

function eachChild(callback, thisArg)
{
 var that = (arguments.length > 1 ? thisArg : this);
 this.children().forEach(callback, that); 
 return this;
}

function mapChild(callback, thisArg)
{
 var that = (arguments.length > 1 ? thisArg : this);
 return this.children().map(callback, that);
}

function everyChild(callback, thisArg)
{
 var that = (arguments.length > 1 ? thisArg : this);
 return this.children().every(callback, that);
}

function someChild(callback, thisArg)
{
 var that = (arguments.length > 1 ? thisArg : this);
 return this.children().some(callback, that);
}

/**
 * TODO: Better name?
 * @desc Re-builds the node's children 
 */
function reduceChild(callback, thisArg)
{
 var that = (arguments.length > 1 ? thisArg : this);
 var nodes = this.children(); //Keep a copy of the current children list.
 
 //Empty this node, remove their pointers.
 this.empty();
 
 //Rebuild the children list from scratch.
 nodes.forEach(function (node, index, sibs){
  callback.call(that, this, node, index, sibs);
 });
 
 return this;
}



/**
 * @desc Depth-first pre-order traversal. Returns itself.
 */
function eachPre(callback, thisArg)
{
 var that = (arguments.length > 1 ? thisArg : this);
 return _eachPre.call(this, callback, that, []);
}

function _eachPre(callback, thisArg, stack)
{
 callback.call(thisArg, this, stack);
 this._nodes.forEach(function (node){
  stack.push(node);
  _eachPre.call(node, callback, thisArg, stack);
  stack.pop(node);
 });
 return this;
}


/**
 * @desc As eachPre, but returns the accumulator instead.
 */
function reducePre(callback, acc, thisArg)
{
 var that = (arguments.length > 2 ? thisArg : this);
 return _reducePre.call(this, callback, acc, that, []);
}

function _reducePre(callback, acc, thisArg, stack)
{
 acc = callback.call(thisArg, acc, this, stack);
 this._nodes.forEach(function (node){
  stack.push(node);
  acc = reducePre.call(node, callback, acc, thisArg, stack);
  stack.pop(node);
 });
 return acc;
}


/**
 * @desc Depth-first post-order traversal. Returns itself.
 */
function eachPost(callback, thisArg)
{
 var that = (arguments.length > 1 ? thisArg : this);
 return _eachPost.call(this, callback, that, []);
}

function _eachPost(callback, thisArg, stack)
{
 this._nodes.forEach(function (node){
  stack.push(node);
  _eachPost.call(node, callback, thisArg, stack);
  stack.pop(node);
 });
 callback.call(thisArg, this, stack);
 return this;
}


/**
 * As reducePre, except it accumulates the value in post-order.
 */
function reducePost(callback, acc, thisArg)
{
 return _reducePost.call(this, callback, acc, thisArg, []);
}

function _reducePost(callback, acc, thisArg, stack)
{
 this._nodes.forEach(function (node){
  stack.push(node);
  acc = _reducePost.call(node, callback, acc, thisArg, stack);
  stack.pop(node);
 });
 acc = callback.call(thisArg, acc, this, stack);
 return acc;
}


/**
 * @desc Wrapper for Array.prototype.splice. Low level method for
 * carrying out the actual insertion & deletion.
 */
function splice(from, count)
{
 var newElems = toArray(arguments, 2).filter(_TODOProcessArg),
  oldElems = __.splice.apply(this._nodes, [from, count].concat(newElems));
  
 newElems.forEach(_TODOSetPointers); //New elements point at this node.
 oldElems.forEach(_TODORemovePointers); //Old elements no longer have parents.
 return this;
}


/**
 * @desc Returns a shallow copy of the node's children Array.
 */
function children()
{
 return this._nodes.slice();
}


/**
 * @desc Returns a shallow copy of the parent's children array.
 * @dec verifyParent
 */
function siblings()
{
 if (this._parent)
 {
  return this._parent.children();
 }
 return [];
}

/**
 * @desc Wrapper for Array.prototype.indexOf;
 */
function indexOf(node)
{
 return this._nodes.indexOf(node);
}

/**
 * @desc Return this node's relative index (0-based) with its siblings.
 * Returns -1 if no parent, or this node is actually not a child of its 
 * parent pointer.
 */
function index()
{
 return this.siblings().indexOf(this);
}

/**
 * @desc Returns the size of the node list, including holes.
 */
function size()
{
 return this._nodes.length;
}

function last()
{
 return this._nodes[this._nodes.length - 1];
}

function first()
{
 return this._nodes[0];
}

function get(index)
{
 return this._nodes[index];
}



/**
 * TODO: Distinguish text nodes from other node types.
 */
function text(value)
{
 if (arguments.length === 0)
 {
  return this._value;
 }
 if (this.type() === ENUM.TEXT)
 {
  this._value = String(value);
 }
 return this;
}

//TODO: no-op on 0 parameters. Good or bad?
function attr(key, val)
{
 var argLen = arguments.length;
 if (argLen === 1)
 {
  if (TODO.isString(key) || TODO.isNumber(key))
  {
   return TODO.get(this._attr, key); //Get direct properties.
  }
  else if (TODO.isObject(key))
  {
   this._attr = key;
  }
 }
 if (argLen > 1)
 {
  this._attr[String(key)] = String(val);
 }
 return this;
}

function type(newType)
{
 if (arguments.length === 0)
 {
  return this._type;
 }
 this._type = String(newType).toLocaleUpperCase();
 return this;
}






/*
Manipulation Addons
-------------------
*/


/**
 * @desc Content at the end of this node's children Array.
 */
function append()
{
 __aPush.apply(this._nodes, TODO.toArray(arguments).filter(_TODOProcessArg));
 return this;
}

/**
 * @desc Content at the beginning of this node's children Array.
 */
function prepend()
{
 __aUnshift.apply(this._nodes, TODO.toArray(arguments).filter(_TODOProcessArg));
 return this;
}

/**
 * @desc Insert content as the node's previous sibling.
 */
function before()
{
 var pos = this.index();
 if (pos > -1)
 {
  splice.apply(this._parent, [pos, 0].concat(TODO.toArray(arguments)));
 }
 return this;
}

/**
 * @desc Insert the node as the target's previous sibling.
 */
function insertBefore(target)
{
 target.before(this);
 return this;
}

/**
 * @desc Insert content as the node's next sibling.
 */
function after()
{
 var pos = this.index();
 if (pos > -1)
 {
  splice.apply(this._parent, [pos + 1, 0].concat(TODO.toArray(arguments)));
 }
 return this;
}

/**
 * @desc Insert the node as the target's next sibling.
 */
function insertAfter(target)
{
 target.after(this);
 return this;
}

/**
 * @desc Empties this node's children Array.
 */
function empty()
{
 return this.splice(0, this.size());
}


/**
 * @desc Replace this node with arbitrary content.
 * @alt remove, detach: this.replaceWith();
 * @alt unwrap: this.replaceWith(this.children());
 */
function replaceWith()
{
 var pos = this.index();
 if (pos > -1)
 {
  splice.apply(this._parent, [pos, 1].concat(TODO.toArray(arguments)));
 }
 this._parent = null;
 return this;
}

/**
 * @desc Swaps the current node with another node.
 */
function swap(target)
{
 if (TODO.isNode(target) && target.parent() && this.parent())
 {
  this.before(TMP);
  target.before(this);
  TMP.replaceWith(target);
 }
 return this;
}






BBM.fn.extend({
 swap : swap,
 append : append,
 prepend : prepend,
 before : before,
 after : after,
 insertBefore : insertBefore,
 insertAfter : insertAfter,
 empty : empty,
 replaceWith : replaceWith,
 splice : splice,
 text : text,
 attr : attr,
 type : type
});

}());