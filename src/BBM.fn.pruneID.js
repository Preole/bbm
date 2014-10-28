
"use strict";

var BBM = require("./BBM.js");
var __ = BBM.__;

function pruneID(node, idList)
{
 var id = node.attr("id");
 if (!id)
 {
  return;
 }
 
 if (idList.indexOf(id) === -1)
 {
  idList.push(id);
 }
 else
 {
  node.removeAttr("id");
 }
}

BBM.fn.pruneID = function (idList)
{
 return this.eachPre(pruneID, __.isArray(idList) ? idList : []);
};

module.exports = BBM;

