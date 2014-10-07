(function (){
"use strict";

var BBM = require("./BBM.js");



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
 * @desc Returns the pointer to the node's children Array.
 * If a shallow copy is desired: node.children().slice().yourFunction.
 */
function children()
{
 return this._nodes;
}


/**
 * @desc If this node has parent, then return the parent's 
 * children Array. Returns a new empty Array if this node 
 * has no parent.
 * @dec verifyParent
 */
function siblings()
{
 if (this.index() > -1)
 {
  return this._parent.children();
 }
 return [];
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
 * @desc Iterates on the node's children. No side effects!
 */
function eachChild(callback, thisArg)
{
 var that = (arguments.length > 1 ? thisArg : this);
 this._nodes.slice().forEach(callback, that); 
 return this;
}

/**
 * @desc Performs one-to-X mapping (Projection) of the node's children 
 * into a new list.
 */
function mapChild(callback, thisArg)
{
 var that = (arguments.length > 1 ? thisArg : this);
 
 this.empty().eachChild(function (node, index, arr){
  callback.call(that, this, node, index, arr);
 });
 /*
 this._nodes
 this.eachChild()
 */
 
 
 this._nodes.forEach(function (node, index, arr){
  callback.call(that, nodes, node, index, arr);
  return nodes;
 });
 this._nodes = this._nodes.filter(TODOValidate);
 return this;
}

function filterChild(callback, thisArg)
{
 var that = (arguments.length > 1 ? thisArg : this),
  func = TODO.isFunction(callback) ? callback : _filterChild;
  
 
 return this;
}

function everyChild(callback, thisArg)
{
 var that = (arguments.length > 1 ? thisArg : this);
 return this._nodes.every(callback, that);
}

function someChild(callback, thisArg)
{
 var that = (arguments.length > 1 ? thisArg : this);
 return this._nodes.some(callback, that);
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
 return Number(this._parent && this._parent.indexOf(this)) || -1;
}

/**
 * @desc Returns the size of the node list, including holes.
 */
function size()
{
 return this._nodes.length;
}






BBM.fn.extend({
 children : children,
 siblings : siblings,
 parent : parent,
 eachChild : eachChild,
 eachPre : eachPre,
 reducePre : reducePre,
 eachPost : eachPost,
 reducePost : reducePost
});

}());