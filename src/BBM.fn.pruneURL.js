(function (){
"use strict";

var BBM = require("./BBM.js");
var ENUM = BBM.ENUM;
var LINKS = [ENUM.LINK_EXT, ENUM.LINK_INT, ENUM.LINK_WIKI];
var SYMTABLE = {};

function _pruneURL(node)
{
 var nType = node.type();
 if (nType === ENUM.IMG)
 {
  node.attr("src", BBM.get(this, node.attr("src")) || node.attr("src"));
 }
 else if (LINKS.indexOf(nType) > -1)
 {
  node.attr("href", BBM.get(this, node.attr("href")) || node.attr("href"));
 }
}

function pruneURL()
{
 var refTable = BBM.isObject(this.refTable) ? this.refTable : SYMTABLE;
 return this.eachPre(_pruneURL, refTable);
}

BBM.fn.pruneURL = pruneURL;
}());

