(function (){
"use strict";

var utils = require("./utils.js"),
ASTNode = require("./ASTNode.js"),
AST = ASTNode.ENUM,
LINKS = [AST.LINK_EXT, AST.LINK_INT, AST.LINK_WIKI],
SYMTABLE = {};


function resolveHREF(node)
{
 var href = node.attr.href,
  refTable = utils.isObject(this.refTable) ? this.refTable : SYMTABLE;
 
 node.attr.href = utils.hasOwn(refTable, href) ? refTable[href] : href;
 if (node.length() === 0)
 {
  node.append(node.attr.href); //Use href as display text.
 }
}

function resolveIMG(node)
{
 var src = node.attr.src,
  refTable = utils.isObject(this.refTable) ? this.refTable : SYMTABLE;
 
 node.attr.src = utils.hasOwn(refTable, src) ? refTable[src] : src;
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