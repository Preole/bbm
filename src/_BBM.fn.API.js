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
1. Special append + Filtering. (Current: Bit too coupled)
2. Full filtering... One big step? Or in two small steps?
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

function __reduceDuplicate(newArr, node)
{
 if (newArr.indexOf(node) === -1)
 {
  newArr.push(node);
 }
 return newArr;
}



/**
 * @desc Swaps the current node with another node.
 */
function swap(target)
{
 if (TODO.isNode(target))
 {
  this.before(TMP);
  target.before(this);
  TMP.replaceWith(target);
 }
 return this;
}

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
 * @desc Insert content as the node's next siblings.
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
 this._nodes = this._nodes.filter(_empty, this);
 return this;
}

function _empty(node, index, sibs)
{
 if (node._parent === this)
 {
  node._parent = null;
 }
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
 * @desc Wrapper for Array.prototype.splice. Low level method for
 * carrying out the actual insertion & deletion.
 */
function splice(from, count)
{
 var newElems = toArray(arguments, 2).filter(_TODOProcessArg);
 __.splice.apply(this._nodes, [from, count].concat(newElems));
 return this;
}

/**
 * Gets or sets the text value of this node.
 */
function text(valueOf)
{
 if (this._type === ENUM.TEXT && (__.isString(value) || __.isNumber(value)))
 {
  this._value = String(value);
 }
 else if (arguments.length === 0)
 {
  return this._value;
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
 text : text
});

}());