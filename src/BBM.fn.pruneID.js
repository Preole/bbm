
"use strict";

var BBM = module.exports = require("./BBM.js");
var __ = require("./__.js");

function pruneID(node, idList)
{
 var id = __.rmWS(__.rmCTRL(node.attr("id") || ""));
 if (!id)
 {
  return;
 }
 
 if (idList.indexOf(id) === -1)
 {
  idList.push(id);
  node.attr("id", id);
 }
 else
 {
  node.removeAttr("id");
 }
}

/**
 * Eliminate duplicate CSS identifiers
 *
 * @method pruneID
 * @return {BBM} The current node with no duplicate IDs in its subtree.
 */
BBM.fn.pruneID = function ()
{
 return this.eachPre(pruneID, []);
};

