(function (){
"use strict";

var BBM = require("./BBM.js");
var AST = BBM.ENUM;
var LINKS = [AST.LINK_EXT, AST.LINK_INT, AST.LINK_WIKI];

function pruneURL(node, symTable)
{
 var nType = node.type();
 if (nType === AST.IMG)
 {
  node.attr("src", BBM.get(symTable, node.attr("src")) || node.attr("src"));
 }
 else if (LINKS.indexOf(nType) > -1)
 {
  node.attr("href", BBM.get(symTable, node.attr("href")) || node.attr("href"));
 }
}


BBM.fn.pruneURL = function ()
{
 return BBM.isObject(this.symTable)
 ? this.eachPre(pruneURL, this.symTable)
 : this;
};

module.exports = BBM;
}());

