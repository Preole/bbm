(function (){
"use strict";

var BBM = require("./BBM.js");
var ENUM = BBM.ENUM;
var DUMMY = BBM("_DUMMY");
var IDCLASS = {_ID : true, _CLASS : true};
var SWITCH =
{
  _DT : pruneDL
, _DD : pruneDL
, _TH : pruneTable
, _TD : pruneTable
, _TR : pruneTable
, _LI_UL : pruneUL
, _LI_OL : pruneOL
};



function isPrunable(node)
{
 return BBM.has(SWITCH, node.type()) || BBM.has(IDCLASS, node.type());
}

function pruneIDClass(prev, node)
{
 var nClass = (node.attr("class") || " ");
 if (prev.attr("id"))
 {
  node.attr("id", prev.attr("id"));
 }
 if (prev.attr("class"))
 {
  node.attr("class", (prev.attr("class") + " " + nClass).trim());
 }
 return node;
}

function pruneTable(prev, node)
{
 var isRow = node.type() === ENUM._TR;
 var cellType = node.type() === ENUM._TD ? ENUM.TD : ENUM.TH;
 var pNode = prev.type() === ENUM.TABLE
 ? prev
 : BBM(ENUM.TABLE).append(BBM(ENUM.TR));

 if (!isRow)
 {
  pNode.last().append(node.type(cellType));
 }
 else if (pNode.last().size() > 0)
 {
  pNode.append(node.type(ENUM.TR));
 }
 return pNode;
}

function pruneUL(prev, node)
{
 var pNode = prev.type() === ENUM.UL ? prev : BBM(ENUM.UL);
 return pNode.append(node.type(ENUM.LI));
}

function pruneOL(prev, node)
{
 var pNode = prev.type() === ENUM.OL ? prev : BBM(ENUM.OL);
 return pNode.append(node.type(ENUM.LI));
}

function pruneDL(prev, node)
{
 var pNode = prev.type() === ENUM.DL ? prev : BBM(ENUM.DL);
 var type = node.type();
 return pNode.append(node.type(type === ENUM._DD ? ENUM.DD : ENUM.DT));
}

function pruneSwitch(node)
{
 var prev = this.last() || DUMMY;
 var nType = node.type();
 var pType = prev.type();
 var res = node;
 
 if (BBM.has(SWITCH, nType))
 {
  res = SWITCH[nType](prev, res);
 }
 if (BBM.has(IDCLASS, pType))
 {
  res = pruneIDClass(prev, res);
 }
 if (res !== prev)
 {
  this.append(res);
 }
}

function pruneList(node)
{
 if (node.children().some(isPrunable))
 {
  node.rebuildChild(pruneSwitch);
 }
}

BBM.fn.pruneList = function ()
{
 return this.eachPost(pruneList);
};

}());


