(function (){
"use strict";

var BBM = require("./BBM.js");
var ENUM = BBM.ENUM;
var DUMMY = BBM("_DUMMY");
var IDCLASS = {_ID : __pruneID, _CLASS : __pruneClass};
var SWITCH =
{
  _DT : __pruneDL
, _DD : __pruneDL
, _TH : __pruneTable
, _TD : __pruneTable
, _TR : __pruneTable
, _LI_UL : __pruneUL
, _LI_OL : __pruneOL
};

function __pruneID(prev, node)
{
 return node.attr("id", prev.attr("id"));
}

function __pruneClass(prev, node)
{
 var nClass = (node.attr("class") || " ");
 return node.attr("class", (prev.attr("class") + " " + nClass).trim());
}

function __pruneTable(prev, node)
{
 var isRow = node.type() === ENUM._TR;
 var cellType = node.type() === ENUM._TD ? ENUM.TD : ENUM.TH;
 var pNode = prev.type() === ENUM.TABLE
 ? prev
 : BBM(ENUM.TABLE).append(BBM(ENUM.TR));

 if (!isRow)
 {
  pNode.last().append(cellType);
 }
 else if (pNode.last().size() > 0)
 {
  pNode.append(BBM(ENUM.TR));
 }
 return pNode;
}

function __pruneUL(prev, node)
{
 var pNode = prev.type() === ENUM.UL ? prev : BBM(ENUM.UL);
 return pNode.append(node.type(ENUM.LI));
}

function __pruneOL(prev, node)
{
 var pNode = prev.type() === ENUM.OL ? prev : BBM(ENUM.OL);
 return pNode.append(node.type(ENUM.LI));
}

function __pruneDL(prev, node)
{
 var pNode = prev.type() === ENUM.DL ? prev : BBM(ENUM.DL);
 return pNode.append(node.type() === ENUM._DD ? ENUM.DD : ENUM.DT);
}

function __pruneSwitch(node)
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
  res = IDCLASS[pType](prev, res);
  this.pop();
 }
 if (res !== prev)
 {
  this.append(res);
 }
}

function __prunable(node)
{
 return BBM.has(SWITCH, node.type()) || BBM.has(IDCLASS, node.type());
}

function __pruneList(node)
{
 if (node.children().some(__prunable))
 {
  node.rebuildChild(__pruneSwitch);
 }
}

function pruneList()
{
 return this.eachPost(__pruneList);
}

BBM.fn.pruneList = pruneList;
}());


