(function (){
"use strict";

var BBM = require("./BBM.js"),
ENUM = BBM.ENUM,
DUMMY = BBM(ENUM._DUMMY),
SWITCH =
{
 _DT : _pruneDL,
 _DD : _pruneDL,
 _TH : _pruneTable,
 _TD : _pruneTable,
 _TR : _pruneTable,
 _LI_UL : _pruneUL,
 _LI_OL : _pruneOL
},
IDCLASS = {_ID : _pruneID, _CLASS : _pruneClass},
PRUNABLE = [
 ENUM._DT,
 ENUM._DD,
 ENUM._TH,
 ENUM._TD,
 ENUM._TR,
 ENUM._LI_OL,
 ENUM._LI_UL,
 ENUM._ID,
 ENUM._CLASS
];


function _pruneID(prev, node)
{
 return node.attr("id", prev.attr("id"));
}

function _pruneClass(prev, node)
{
 var nClass = (node.attr("class") || " ");
 return node.attr("class", (prev.attr("class") + " " + nClass).trim());
}

function _pruneTable(prev, node)
{
 var isRow = node.type() === ENUM._TR,
  cellType = node.type() === ENUM._TD ? ENUM.TD : ENUM.TH,
  pNode = prev.type() === ENUM.TABLE ? prev : BBM(ENUM.TABLE).append(BBM(ENUM.TR));

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

function _pruneUL(prev, node)
{
 var pNode = prev.type() === ENUM.UL ? prev : BBM(ENUM.UL);
 return pNode.append(node.type(ENUM.LI));
}

function _pruneOL(prev, node)
{
 var pNode = prev.type() === ENUM.OL ? prev : BBM(ENUM.OL);
 return pNode.append(node.type(ENUM.LI));
}

function _pruneDL(prev, node)
{
 var pNode = prev.type() === ENUM.DL ? prev : BBM(ENUM.DL);
 return pNode.append(node.type() === ENUM._DD ? ENUM.DD : ENUM.DT);
}

function _pruneSwitch(newNode, node)
{
 var prev = newNode.last() || DUMMY,
  nType = node.type(),
  pType = prev.type(),
  res = node;
 
 if (BBM.has(SWITCH, nType))
 {
  res = SWITCH[nType](prev, node); 
 }
 if (BBM.has(IDCLASS, pType))
 {
  res = IDCLASS[pType](prev, res);
  prev.remove();
 }
 if (BBM.isNode(res) && res !== prev)
 {
  newNode.append(res);
 }
}

function _prunable(node)
{
 return PRUNABLE.indexOf(node.type()) > -1;
}

function _pruneList(node)
{
 if (node.children().some(_prunable))
 {
  node.reduceChild(_pruneSwitch);
 }
}

function pruneList()
{
 return this.eachPost(_pruneList);
}

BBM.prototype.pruneList = pruneList;
}());

