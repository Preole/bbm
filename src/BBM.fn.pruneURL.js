
"use strict";

var BBM = require("./BBM.js");
var __ = BBM.__;
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


BBM.fn.pruneURL = function ()
{
 return __.isObject(this.symTable)
 ? this.eachPre(pruneURL, this.symTable)
 : this;
};

module.exports = BBM;

