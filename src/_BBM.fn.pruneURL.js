(function (){
"use strict";

var BBM = require("./BBM.js"),
ENUM = BBM.ENUM,
LINKS = [AST.LINK_EXT, AST.LINK_INT, AST.LINK_WIKI],
SYMTABLE = {};


function _pruneHREF(node)
{
 node.attr("href", BBM.get(this, node.attr("href")) || node.attr("href"));
 if (node.size() === 0)
 {
  node.append(node.attr("href"));
 }
}

function _pruneIMG(node)
{
 node.attr("src", BBM.get(this, node.attr("src")) || node.attr("src"));
}

function _pruneURL(node)
{
 var nType = node.type();
 if (nType === ENUM.IMG)
 {
  _pruneIMG(node, this);
 }
 else if (LINKS.indexOf(nType) > -1)
 {
  _pruneHREF(node, this);
 }
}

function pruneURL()
{
 var refTable = BBM.isObject(this.refTable) ? this.refTable : SYMTABLE;
 return this.eachPost(_pruneURL, refTable);
}

BBM.prototype.pruneURL = pruneURL;

}());