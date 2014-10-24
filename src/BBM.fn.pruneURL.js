(function (){
"use strict";

var BBM = require("./BBM.js");
var ENUM = BBM.ENUM;
var LINKS = [ENUM.LINK_EXT, ENUM.LINK_INT, ENUM.LINK_WIKI];

function pruneURL(node)
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


BBM.fn.pruneURL = function ()
{
 return BBM.isObject(this.symTable)
 ? this.eachPre(pruneURL, this.symTable)
 : this;
};

}());

