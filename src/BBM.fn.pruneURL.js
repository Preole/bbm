
"use strict";

var BBM = module.exports = require("./BBM.js");
var __ = require("./utils.js");
var AST = BBM.ENUM;
var LINKS = {LINK_EXT : 1, LINK_INT : 1, LINK_WIKI : 1};

function pruneURL(node, symTable)
{
 var nType = node.type();
 var attr = node.attr();
 if (nType === AST.LINK_IMG)
 {
  attr.src = __.get(symTable, attr.src) || attr.src;
 }
 else if (__.has(LINKS, nType))
 {
  attr.href = __.get(symTable, attr.href) || attr.href;
 }
}

BBM.fn.pruneURL = function ()
{
 return __.isObject(this.symTable)
 ? this.eachPre(pruneURL, this.symTable)
 : this;
};

