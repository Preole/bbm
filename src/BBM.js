
"use strict";

var __ = require("./__.js");


/**
 * BareBonesMarkup node object. Each instance of this class represents a 
 * node within the abstract syntax tree. The `new` operator is not required. 
 * Instance properties prefixed with an underscore are meant for private use.
 *
 * @constructor
 * @type BBM
 * @param {String} type The node's type name. @see BBM.ENUM
 * @property {String} _type The node's type name.
 * @property {Object} _attr Attribute key-value (String-String) pairs.
 * @property {BBM[]} _nodes An array of child nodes.
 * @property {BBM} _parent The node's parent node.
 * @return {BBM} The newly created node with a specific type. 
 */
var BBM = module.exports = function (type)
{
 var obj = Object.create(BBM.prototype);
 obj._type = String(type).toLocaleUpperCase();
 obj._attr = {};
 obj._nodes = [];
 obj._parent = null;
 return obj;
};


/**
 * Enumeration of officially recognized node types. Names preceding with an 
 * underscore are private and for internal use only.
 * 
 * @memberOf BBM {Object} ENUM
 * @enum {String}
 * @readonly
 * @static 
 */
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




/**
 * Queries the target object if it is an instance of BBM.
 * 
 * @method isNode
 * @static
 * @param {anything} The object to check against.
 * @return {Boolean} True if instance of BBM; False otherwise.
 */
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

/**
 * Low Level method for manipulating the node's children.
 * 
 * @method splice
 * @param {Number} from The index to begin manipulation. (Zero or more)
 * @param {Number} count The Number of children to remove. (Zero or more)
 * @param {(BBM[]|BBM|String)} [elems] The new child nodes to insert. 
   Child nodes inserted in this manner will be detached from their belonging 
   parent nodes.

 * @return {BBM} The modified node instance.
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
 * Retrieves the node's parent node.
 * 
 * @method parent
 * @return {(BBM|undefined)} The parent node, or undefined if there's none.
 */
fn.parent = function ()
{
 return this._parent;
};



/**
 * Retrieves the node's children list.
 * 
 * @method children
 * @param {Boolean} [shallow] If true, retrieves a shallow copy instead.
 * @return {BBM[]} The pointer to the children Array, or a copy of the 
   Array if the shallow parameter is truthy.
 */
fn.children = function (shallow)
{
 return shallow ? this._nodes.slice() : this._nodes;
};



/**
 * Retrieves the size of the node's children list.
 * 
 * @method size
 * @return {Number} The Number of children this node contains.
 */
fn.size = function ()
{
 return this.children().length;
};


/**
 * Retrieves the node's first child node.
 * 
 * @method first
 * @return {(BBM|undefined)} The first child, or undefined if there's none.
 */
fn.first = function ()
{
 return this.children()[0];
};


/**
 * Retrieves the node's last child node.
 * 
 * @method last
 * @return {(BBM|undefined)} The last child, or undefined if there's none.
 */
fn.last = function ()
{
 return this.children()[this.children().length - 1];
};


/**
 * Queries whether the node is the first sibling within its parent.
 * 
 * @method isFirstChild
 * @return {Boolean} True if the node has a parent, and it's the first sibling 
   within its subtree; False otherwise.
 */
fn.isFirstChild = function ()
{
 return this.parent() && this.parent().first() === this;
};


/**
 * Queries whether the node is the last sibling within its parent.
 * 
 * @method isLastChild
 * @return {Boolean} True if the node has a parent, and it's the last sibling 
   within its subtree; False otherwise.
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
 * Removes the node's last child.
 * 
 * @method pop
 * @return {(BBM|undefined)} The node's last child, or undefined if there's none.
 */
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


/**
 * Adds one or more nodes to the end of this node's children list.
 * 
 * @method append
 * @param {(String|BBM[]|BBM)} [content] An Array of BBM nodes, a single 
   BBM node, or a non-empty String to append to the current node. If no 
   valid content is supplied, this operation does nothing.
 * @return {BBM} The modified BBM instance.
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
 * Adds one or more nodes to the beginning of this node's children list.
 * 
 * @method prepend
 * @param {(String|BBM[]|BBM)} [content] @see BBM.append
 * @return {BBM} The modified BBM instance.
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
 * Replaces the current node with some other content in its belonging subtree. 
 * If the current node has no parent, this operation does nothing.
 * 
 * @method replaceWith
 * @param {(String|BBM[]|BBM)} [content] @see BBM.append
 * @return {BBM} The current node detached from its belonging subtree.
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
 * The inverse operation of BBM.replaceWith; The current node will take 
 * the place of the target node, if the target is a BBM instance and it 
 * has a parent node. Otherwise, this operation does nothing.
 *
 * @method replace
 * @param {BBM} [target] The target node to replace with the current node.
 * @return {BBM} The current node attached to the target's subtree.
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

/**
 * Iterates the node's subtree using depth-first, pre-order traversal, 
 * executing the callback once per node.
 *
 * @method eachPre
 * @param {function} callback Called on each child node being visited.
 * @param {anything} [params] Extra parameter to be supplied to the callback.
 * @return {BBM} The current node that started the traversal.
 */
fn.eachPre = function (callback, params)
{
 return eachPre(this, this, callback, params);
};


/**
 * As BBM.eachPre, but returns an Array of nodes that the returns a truthy 
 * value within the callback function.
 *
 * @method find
 * @param {function} callback Called on each child node being visited.
 * @param {anything} [params] Extra parameter to be supplied to the callback.
 * @return {BBM} The current node that started the traversal.
 * @see BBM.eachPre 
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
 * Iterates the node's subtree using depth-first, post-order traversal, 
 * executing the callback once per node.
 *
 * @method eachPost
 * @param {function} callback Called on each child node being visited.
 * @param {anything} [params] Extra parameter to be supplied to the callback.
 * @return {BBM} The current node that started the traversal.
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
 * Retrieves or sets the text value of this node. If the text value retrieved
 * is not the empty String `""`, this node is considered a text node.
 *
 * This method adds an extra property `_value` to the current BBM instance.
 * 
 * @method text
 * @param {(String|Number)} [val] The text value to set the node's value to.
 * @return {(this|String)} The current node if no parameter is supplied; 
   Returns the node's text value otherwise.
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
 * Retrieves or sets the attributes of this node.
 * @name BBM
 * @method attr
 * @param {(String|Object)} [key] An object to merge its properties into
   the node's attributes, or a String denoting the attribute key to set.
 * @param {(String|Number)} [val] The attribute value for the corresponding 
   key. Omitted if the key parameter is an object.
 * @return {(Object|String|BBM)} 
   - If no parameter is supplied, returns the node's attribute object.
   - If only the key is supplied and it's not an object, returns the 
     corresponding attribute value.
   - Returns the current node otherwise.
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
  this._attr[key] = String(val);
 }
 return this;
};


/**
 * Removes attributes from the node.
 * 
 * @method removeAttr
 * @param {(String|Number)} [key] The attribute key to remove. If omitted,
   removes all attribute key value pairs instead.
 * @return {BBM} The modified BBM instance with attributes removed.
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


/**
 * Merge the contents of an object onto the BBM prototype to add BBM methods.
 *
 * @method extend
 * @param {Object} extendObj The object to merge into the prototype.
 * @return {BBM} The calling instance.
 */
fn.extend = function (extendObj)
{
 return __.extend(this, extendObj);
};


/**
 * Converts the current node into JSON-compatible format for use with 
 * `JSON.stringify()`. Do not use this method to obtain a JSON string of the 
 * subtree; Use `JSON.stringify(node, null, " ")` instead.
 *
 * @method toJSON
 * @return {Object} A clone of the current node without the BBM prototype.
 */
fn.toJSON = function ()
{
 var obj = __.extend({}, this);
 delete obj._parent;
 return obj;
};


return fn;
}(BBM.prototype));
