(function (){
"use strict";

var BBM = require("./BBM.js"),
__TMP = ASTNode("TODO: Temporary Node Type"),
__aSplice = Array.prototype.splice,


/*
TODO: Privacy convention:

1. "__" Two underscores for private static variables and methods.
2. "_" One underscore for private instance variables.
*/

function __filterInserts(value, index, array)
{
 var val = value;
 if (BBM.isString(val) && val.length > 0)
 {
  val = TODO.textNode(val);
  array[index] = val;
 }
 if (BBM.isNode(val))
 {
  //Update parent pointers: val._parent = this;
 }
 return BBM.isNode(val);
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








/*
Basic Accessor Methods
----------------------
*/


/**
 * @desc Low level method for carrying out the actual insertion & deletion.
 */
function splice(from, count)
{
 //Filter non-elements, remove them from their belonging sub-tree.
 var elems = toArray(arguments, 2).filter(_TODOProcessArg),
  args = [from, count].concat(elems);
  
 //For each element removed in this tree, remove their parent pointers.
 __aSplice.apply(this._nodes, args).forEach(_TODORemovePointers);
 return this;
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



/**
 * @desc Returns a shallow or hard copy of the node's children Array.
 */
function children()
{
 return this._nodes;
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
 * @desc Content at the end of this node's children Array.
 */
function append()
{
 return this.splice(this.size(), 0, BBM.toArray(arguments).filter(_TODOProcessArg));
}

/**
 * @desc Content at the beginning of this node's children Array.
 */
function prepend()
{
 return this.splice(0, 0, BBM.toArray(arguments).filter(_TODOProcessArg));
}

/**
 * @desc Insert content as the node's previous sibling.
 */
function before()
{
 var pos = this.index();
 if (pos > -1)
 {
  splice.apply(this._parent, [pos, 0].concat(BBM.toArray(arguments)));
 }
 return this;
}

/**
 * @desc Insert the node as the target's previous sibling.
 */
function insertBefore(target)
{
 if (BBM.isNode(target))
 {
  target.before(this);
 }
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
  splice.apply(this._parent, [pos + 1, 0].concat(BBM.toArray(arguments)));
 }
 return this;
}

/**
 * @desc Insert the node as the target's next sibling.
 */
function insertAfter(target)
{
 if (BBM.isNode(target))
 {
  target.after(this);
 }
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
  splice.apply(this._parent, [pos, 1].concat(BBM.toArray(arguments)));
  this._parent = null; //Null out parent only if replacement is successful.
 }
 return this;
}

/**
 * @desc Replace the target with this node.
 */
function replace(target)
{
 if (BBM.isNode(target))
 {
  target.replaceWith(this);
 }
 return this;
}


/**
 * @desc Swaps the current node with another node.
 */
function swap(target)
{
 if (BBM.isNode(target) && target.parent() && this.parent())
 {
  this.before(TMP);
  target.before(this);
  TMP.replaceWith(target);
 }
 return this;
}







//Rebuild the node's children Array by returning nodes.
//TODO: thisArg for mapChild, filterChild; BBM.prototype.clone(), replace
function mapChild(callback, thisArg)
{ 
 var newKids = BBM.flatten(this.children().map(callback, thisArg)),
  newNode = append.apply(this.clone(), newKids);
  
 return newNode.replace(this);
}

/**
 * @desc Rebuilds the node's children.
 */
function reduceChild(callback)
{
 var newNode = this.clone();
 this.children().forEach(function (node, index, sibs){
  callback.call(TODO, newNode, node, index, sibs);
 });
 return newNode.replace(this);
}

function reverseChild()
{
 this.children().reverse();
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
 var that = (arguments.length > 2 ? thisArg : this);
 return _reducePost.call(this, callback, acc, that, []);
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


/*
Attributes & Properties
-----------------------
*/

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
  if (BBM.isString(key) || BBM.isNumber(key))
  {
   return BBM.get(this._attr, key); //Get direct properties.
  }
  else if (BBM.isObject(key))
  {
   BBM.extend(this._attr, key);
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






BBM.fn.extend({
 TODO
});

}());