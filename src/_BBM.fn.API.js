(function (){
"use strict";

var BBM = require("./BBM.js");

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
 if (BBM.isNode(res) && res !== node)
 {
  res.replaceWith();
  res._parent = this;
 }
 return res;
}

function __procArgs(elems, node)
{
 return BBM.isArray(elems)
  ? BBM.flatten(elems).map(__mapArgs, node).filter(BBM.isNode)
  : __mapArgs.call(node, elems);
}

function __nullParent(node)
{
 if (BBM.isNode(node))
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
 * @param from The index of the children to start manipulation from.
 * @param count The number of elements to remove from that index.
 * @param elems A single ASTNode (BBM), string, number, or an Array of 
 * such elements to be inserted as the node's children. 
 */
function splice(from, count, elems)
{
 var eles = __procArgs(elems, this),
  kids = this.children(),
  args = BBM.isArray(eles) ? [from, count].concat(eles) : eles,
  removed = BBM.isArray(args)
   ? Array.prototype.splice.apply(kids, args)
   : BBM.isNode(args)
   ? kids.splice(from, count, args)
   : kids.splice(from, count);
 
 removed.forEach(__nullParent);
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
 * @desc Returns a shallow or hard copy of the node's children Array.
 */
function children(shallow)
{
 return shallow ? this._nodes.slice() : this._nodes;
}

/**
 * @desc Returns the node's parent's children Array.
 */
function siblings(shallow)
{
 return this.parent() ? this.parent().children(shallow) : [];
}

/**
 * @desc Return this node's relative index (0-based) with its siblings.
 * Returns -1 if no parent or not a child of its parent.
 */
function index()
{
 return this.parent() ? this.parent().children().indexOf(this) : -1;
}

/**
 * @desc Returns the size of the node list, including holes.
 */
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


/**
 * @desc Content at the end of this node's children Array.
 */
function append(content)
{
 var eles = __procArgs(content, this);
 if (BBM.isArray(eles))
 {
  this.children().push.apply(this.children(), eles);
 }
 else if (BBM.isNode(eles))
 {
  this.children().push(eles);
 }
 return this;
}

/**
 * @desc Content at the beginning of this node's children Array. 
 */
function prepend(content)
{
 var eles = __procArgs(content, this);
 if (BBM.isArray(eles))
 {
  this.children().unshift.apply(this.children(), eles);
 }
 else if (BBM.isNode(eles))
 {
  this.children().unshift(eles);
 }
 return this;
}

/**
 * @desc Insert content as the node's previous sibling.
 */
function before(content)
{
 var pos = this.index();
 if (pos > -1)
 {
  this.parent().splice(pos, 0, content);
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
function after(content)
{
 var pos = this.index();
 if (pos > -1)
 {
  this.parent().splice(pos + 1, 0, content);
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
function replaceWith(content)
{
 var pos = this.index();
 if (pos > -1)
 {
  this.parent().splice(pos, 1, content);
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



/*
Iteration Methods: Children
---------------------------
*/

function eachChild(callback)
{
 return this.children(true).forEach(callback, this) || this;
}

function everyChild(callback)
{
 return this.children(true).every(callback, this);
}

function someChild(callback)
{
 return this.children(true).some(callback, this);
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
 var newKids = this.children(true).map(callback, this);
 return __clone(this).append(newKids).replace(this);
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
 var newKids = this.children(true).filter(callback, this);
 return __clone(this).append(newKids).replace(this);
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
 var newNode = __clone(this);
 this.children(true).forEach(callback, newNode);
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
 return __eachPre.call(this, callback, thisArg, []);
}

function __eachPre(callback, thisArg, stack)
{
 callback.call(thisArg, this, stack);
 this.__nodes.forEach(function (node){
  stack.push(node);
  __eachPre.call(node, callback, thisArg, stack);
  stack.pop(node);
 });
 return this;
}


/**
 * @desc As eachPre, but returns the accumulator instead.
 */
function reducePre(callback, acc, thisArg)
{
 return __reducePre.call(this, callback, acc, thisArg, []);
}

function __reducePre(callback, acc, thisArg, stack)
{
 this.__nodes.forEach(function (node){
  stack.push(node);
  acc = __reducePre.call(node, callback, acc, thisArg, stack);
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
 this.children().forEach(function (node){
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
 acc = callback.call(thisArg, acc, this, stack);
 this.children().forEach(function (node){
  stack.push(node);
  acc = __reducePost.call(node, callback, acc, thisArg, stack);
  stack.pop(node);
 });
 return callback.call(thisArg, acc, this, stack);
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
 children : children,
 siblings : siblings,
 
 size : size,
 last : last,
 first : first,
 index : index,

 append : append,
 prepend : prepend,
 before : before,
 insertBefore : insertBefore,
 after : after,
 insertAfter : insertAfter,
 
 empty : empty,
 replaceWith : replaceWith,
 replace : replace,

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

