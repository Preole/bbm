(function (){
"use strict";

var BBM = require("./BBM.js"), ENUM = BBM.ENUM;

/*
Private Methods
---------------
*/

function __mapArgs(node)
{
 var res = node;
 if (BBM.isString(res) || BBM.isNumber(res))
 {
  res = BBM(ENUM.TEXT).text(res);
 }
 if (BBM.isNode(res))
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

function __empty(node)
{
 var nodes = node._nodes.splice(0, node._nodes.length);
 nodes.forEach(__nullParent);
 return nodes;
}






/*
Basic & Low-Level Accessors
---------------------------
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
 var eles = __procArgs(content, this);
 if (BBM.isNode(eles))
 {
  this.children().push(eles);
 }
 else if (BBM.isArray(eles))
 {
  this.children().push.apply(this.children(), eles);
 }
 return this;
}

function prepend(content)
{
 var eles = __procArgs(content, this);
 if (BBM.isNode(eles))
 {
  this.children().unshift(eles);
 }
 else if (BBM.isArray(eles))
 {
  this.children().unshift.apply(this.children(), eles);
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
 if (BBM.isNode(target))
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
function eachPre(callback, thisArg)
{
 __reducePre.call(this, callback, thisArg, [], null);
 return this;
}

function reducePre(callback, acc, thisArg)
{
 return __reducePre.call(this, callback, thisArg, [], acc);
}

function __reducePre(callback, thisArg, stack, acc)
{
 acc = callback.call(thisArg, this, stack, acc);
 this.children().forEach(function (node){
  stack.push(node);
  acc = __reducePre.call(node, callback, thisArg, stack, acc);
  stack.pop(node);
 });
 return acc;
}

/**
 * @desc Depth-first post-order traversal.
 */
function eachPost(callback, thisArg)
{
 __reducePost.call(this, callback, thisArg, [], null);
 return this;
}

function reducePost(callback, acc, thisArg)
{
 return __reducePost.call(this, callback, thisArg, [], acc);
}

function __reducePost(callback, thisArg, stack, acc)
{
 this.children().forEach(function (node){
  stack.push(node);
  acc = __reducePost.call(node, callback, thisArg, stack, acc);
  stack.pop(node);
 });
 return callback.call(thisArg, this, stack, acc);
}



/*
Attributes & Properties
-----------------------
*/

/**
 * @desc If supplied a string argument, converts the node into a text 
 * node with that string value. Otherwise, return the node's text value.
 * If this method returns a non-empty string value, it's a text node.
 */
function text(val)
{
 if (arguments.length === 0)
 {
  return this._val || "";
 }
 if (BBM.isString(val) && val.length > 0)
 {
  this._value = val;
 }
 return this;
}

function attr(key, val)
{
 if (BBM.isObject(key))
 {
  BBM.extend(this._attr, key);
 }
 else if (arguments.length > 1)
 {
  this._attr[key] = String(val);
 }
 else if (arguments.length === 1)
 {
  return BBM.get(this._attr, key);
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
 
 size : size,
 last : last,
 first : first,

 pop : pop,
 shift : shift,
 append : append,
 prepend : prepend,
 replaceWith : replaceWith,
 replace : replace,
 empty : empty,

 rebuildChild : rebuildChild,
 
 eachPre : eachPre,
 reducePre : reducePre,
 eachPost : eachPost,
 reducePost : reducePost,
 
 text : text,
 attr : attr,
 type : type
});

}());

