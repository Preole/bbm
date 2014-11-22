
"use strict";

var BBM = module.exports = require("./BBM.js");
var __ = require("./utils.js");
var AST = BBM.ENUM;
var DUMMY = BBM("_DUMMY");
var IDCLASS = {_ID : 1, _CLASS : 1};
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
 return __.has(SWITCH, node.type()) || __.has(IDCLASS, node.type());
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
 var isRow = node.type() === AST._TR;
 var cellType = node.type() === AST._TD ? AST.TD : AST.TH;
 var pNode = prev.type() === AST.TABLE
 ? prev
 : BBM(AST.TABLE).append(BBM(AST.TR));

 if (!isRow)
 {
  pNode.last().append(node.type(cellType));
 }
 else if (pNode.last().size() > 0)
 {
  pNode.append(node.type(AST.TR));
 }
 return pNode;
}

function pruneUL(prev, node)
{
 var pNode = prev.type() === AST.UL ? prev : BBM(AST.UL);
 return pNode.append(node.type(AST.LI));
}

function pruneOL(prev, node)
{
 var pNode = prev.type() === AST.OL ? prev : BBM(AST.OL);
 return pNode.append(node.type(AST.LI));
}

function pruneDL(prev, node)
{
 var pNode = prev.type() === AST.DL ? prev : BBM(AST.DL);
 var type = node.type();
 return pNode.append(node.type(type === AST._DD ? AST.DD : AST.DT));
}

function pruneSwitch(parent, node)
{
 var prev = parent.last() || DUMMY;
 var nType = node.type();
 var pType = prev.type();
 var res = node;
 
 if (__.has(SWITCH, nType))
 {
  res = SWITCH[nType](prev, res);
 }
 if (__.has(IDCLASS, pType))
 {
  res = pruneIDClass(prev, res);
 }
 if (res !== prev)
 {
  parent.append(res);
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



