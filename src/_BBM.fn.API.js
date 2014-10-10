(function (){
"use strict";

var BBM = require("./BBM.js"),
__aSplice = Array.prototype.splice,


/*
TODO: Privacy convention:

1. "__" Two underscores for private static variables and methods.
2. "_" One underscore for private instance variables.
*/


/**
 * Create new node with an empty children array and no parent, but clones
 * everything else.
 */
function __clone(node)
{
 var obj = BBM.extend(Object.create(BBM.prototype), node);
 obj._nodes = [];
 obj._attr = BBM.extend({}, obj._attr);
 obj._parent = null;
 return obj;
}

function __mapArgs(node)
{
 var res = node;
 if (BBM.isString(res) || BBM.isNumber(res))
 {
  res = BBM.textNode(res);
 }
 if (BBM.isNode(res))
 {
  res.remove();
  res._parent = this;
 }
 return BBM.isNode(res) ? res : void(0);
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
 var elems = toArray(arguments, 2).map(__mapArgs, this).filter(BBM.isNode);
 var args = [from, count].concat(elems);
  
 //Apply removal for each children removed from this node.
 __aSplice.apply(this.children(), args).forEach(remove, this);
 return this;
}

/**
 * 
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
 var list = [], par = this.parent();
 while (par = this.parent())
 {
  list.push(par);
 }
 return list;
}



/**
 * @desc Returns a shallow or hard copy of the node's children Array.
 */
function children(shallow)
{
 return shallow ? this._nodes.slice() : this._nodes;
}

/**
 * @desc Returns the pointer to the node's children Array.
 */
function siblings(shallow)
{
 if (this.parent())
 {
  return this.parent().children(shallow);
 }
 return [];
}

/**
 * @desc Wrapper for Array.prototype.indexOf;
 */
function indexOf(node, fromIndex)
{
 return this._nodes.indexOf(node, fromIndex);
}

/**
 * @desc Return this node's relative index (0-based) with its siblings.
 * Returns -1 if no parent or not a child of its parent.
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
 return this.splice(this.size(), 0, BBM.toArray(arguments));
}

/**
 * @desc Content at the beginning of this node's children Array.
 */
function prepend()
{
 return this.splice(0, 0, BBM.toArray(arguments));
}

/**
 * @desc Insert content as the node's previous sibling.
 */
function before()
{
 var pos = this.index();
 if (pos > -1)
 {
  splice.apply(this.parent(), [pos, 0].concat(BBM.toArray(arguments)));
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
  splice.apply(this.parent(), [pos + 1, 0].concat(BBM.toArray(arguments)));
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
  splice.apply(this.parent(), [pos, 1].concat(BBM.toArray(arguments)));
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

function remove()
{
 return this.replaceWith();
}



/*
Iteration Methods: Children
---------------------------
*/

function eachChild(callback)
{
 this.children(true).forEach(callback, this);
 return this;
}

function everyChild(callback)
{
 return __everyChild.call(this, true, callback);
}

function someChild(callback)
{
 return __everyChild.call(this, false, callback);
}

function __everyChild(isEvery, callback)
{
 var name = isEvery ? "every" : "some";
 return this.children(true)[name](callback, this);
}

/**
 * Executes callback once per child node, appending results that are of 
 * type node (BBM) into a new replacement copy of the current node.
 *
 * To map one node into multiple node, return an Array that contains the 
 * collection of nodes.
 * 
 * @param {function} callback The function to execute once per node.
 * @returns {BBM} A new clone of the current node.
 */
function mapChild(callback)
{
 return __mapChild.apply(this, true, callback);
}

/**
 * Executes callback once per child node, appending nodes that returned
 * "truthy" in the callback into a new replacement copy of the current node.
 * 
 * @param {function} callback The function to execute once per node.
 * @returns {BBM} A new clone of the current node.
 */
function filterChild(callback)
{
 return __mapChild.apply(this, false, callback);
}

function __mapChild(isMap, callback)
{
 var name = isMap ? "map" : "filter",
  newKids = BBM.flatten(this.children(true)[name](callback, this)),
  newNode = append.apply(__clone(this), newKids);
  
 return newNode.replace(this);
}

/**
 * Executes callback once per child node, which are to be explicitly 
 * attached to the new replacement copy of the current node by the 
 * callback.
 * 
 * @param {function} callback The function to execute once per node.
 * @returns {BBM} A new clone of the current node.
 */
function reduceChild(callback)
{
 var that = this, newNode = __clone(this);
 this.children(true).forEach(function (node, pos, sibs){
  callback.call(that, newNode, node, pos, sibs);
 });
 return newNode.replace(this);
}




/*
Iteration Methods: Whole Subtree
--------------------------------
*/

/**
 * @desc Depth-first pre-order traversal. Returns itself.
 */
function eachPre(callback, thisArg)
{
 return _eachPre.call(this, callback, thisArg, []);
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
 return _reducePre.call(this, callback, acc, thisArg, []);
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
 return __eachPost.call(this, callback, thisArg, []);
}

function __eachPost(callback, thisArg, stack)
{
 this._nodes.forEach(function (node){
  stack.push(node);
  __eachPost.call(node, callback, thisArg, stack);
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
 return __reducePost.call(this, callback, acc, thisArg, []);
}

function __reducePost(callback, acc, thisArg, stack)
{
 this._nodes.forEach(function (node){
  stack.push(node);
  acc = __reducePost.call(node, callback, acc, thisArg, stack);
  stack.pop(node);
 });
 acc = callback.call(thisArg, acc, this, stack);
 return acc;
}



/*
Attributes & Properties
-----------------------
*/

//TODO: How to best create a text node?
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
 splice : splice,
 parent : parent,
 parents : parents,
 children : children,
 siblings : siblings,
 
 indexOf : indexOf,
 size : size,
 last : last,
 first : first,
 index : index,
 get : get,

 append : append,
 prepend : prepend,
 before : before,
 insertBefore : insertBefore,
 after : after,
 insertAfter : insertAfter,
 
 empty : empty,
 replaceWith : replaceWith,
 replace : replace,
 remove : remove,

 eachChild : eachChild,
 everyChild : everyChild,
 someChild : someChild,
 mapChild : mapChild,
 filterChild : filterChild,
 reduceChild : reduceChild,
 
 eachPre : eachPre,
 reducePre : reducePre,
 eachPost : eachPost,
 reducePost : reducePost,
 text : text,
 attr : attr,
 type : type
});

}());

