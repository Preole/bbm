
"use strict";

var BBM = module.exports = require("./BBM.js");
var __ = require("./utils.js");

function pruneID(node, idList)
{
 var id = __.rmCTRL(node.attr("id") || "");
 if (id && !__.has(idList, id))
 {
  node.attr("id", (idList[id] = id));
 }
 else
 {
  node.removeAttr("id");
 }
}

BBM.fn.pruneID = function ()
{
 return this.eachPre(pruneID, {});
};

