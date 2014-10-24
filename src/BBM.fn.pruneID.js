(function (){
"use strict";

var BBM = require("./BBM.js");

function __pruneID(node)
{
 var idList = this;
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

BBM.fn.pruneID = function ()
{
 return this.eachPre(__pruneID, []);
};

}());

