
"use strict";

var BBM = module.exports = require("./BBM.js");
var __ = require("./__.js");
var AST = BBM.ENUM;
var LINKS = [AST.LINK_EXT, AST.LINK_INT, AST.LINK_WIKI];

function pruneURL(node, symTable)
{
 var nType = node.type();
 var attr = node.attr();
 if (nType === AST.LINK_IMG)
 {
  attr.src = __.get(symTable, attr.src) || attr.src;
 }
 else if (LINKS.indexOf(nType) > -1)
 {
  attr.href = __.get(symTable, attr.href) || attr.href;
 }
}

/**
 * Performs URL substitution within the subtree, changing ID-URL pairs in 
 * the symbol table to corresponding identifiers inside hyperlink and image
 * elements.
 *
 * @method pruneURL
 * @return {BBM} The current node after URL substitution.
 */
BBM.fn.pruneURL = function ()
{
 return __.isObject(this.symTable)
 ? this.eachPre(pruneURL, this.symTable)
 : this;
};

