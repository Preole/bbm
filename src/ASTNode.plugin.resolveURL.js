(function (){
"use strict";

var __ = require("./__.js"),
ASTNode = require("./ASTNode.js"),
AST = ASTNode.ENUM,
LINKS = [AST.LINK_EXT, AST.LINK_INT, AST.LINK_WIKI],
SYMTABLE = {};


function resolveHREF(node)
{
 var href = node.attr.href,
  refTable = __.isObject(this.refTable) ? this.refTable : SYMTABLE;
 
 node.attr.href = __.hasOwn(refTable, href) ? refTable[href] : href;
 if (node.size() === 0)
 {
  node.append(node.attr.href);
 }
}

function resolveIMG(node)
{
 var src = node.attr.src,
  refTable = __.isObject(this.refTable) ? this.refTable : SYMTABLE;
 
 node.attr.src = __.hasOwn(refTable, src) ? refTable[src] : src;
}

function recurseURL(currNode)
{
 if (node.type === AST.IMG)
 {
  resolveIMG.call(this, currNode);
 }
 else if (LINKS.indexOf(node.type) > -1)
 {
  resolveHREF.call(this, currNode);
 }
}


ASTNode.prototype.resolveURL = function ()
{
 return this.postEach(recurseURL, this);
};

}());