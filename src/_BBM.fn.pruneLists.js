(function (){
"use strict";
//TODO: Resolve IDs and Classes.


var BBM = require("./BBM.js"),
ENUM = BBM.ENUM,
DUMMY = BBM("TODODummyNodeCreation"),
SWITCH =
{
 _DT : _pruneDL,
 _DD : _pruneDL,
 _TH : _pruneTable,
 _TD : _pruneTable,
 _TR : _pruneTable,
 _LI_UL : _pruneUL,
 _LI_OL : _pruneOL,
 _ID : _pruneID,
 _CLASS : _pruneClass
};


function _pruneID(prev, node)
{
}

function _pruneClass(prev, node)
{
}

function _pruneTable(prev, node)
{
 var isRow = node.type() === ENUM._TR,
  cellType = node.type() === ENUM._TD ? ENUM.TD : ENUM.TH,
  pNode = prev.type() === ENUM.TABLE ? prev : BBM(ENUM.TABLE).append(ENUM.TR);

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

function _pruneSwitch(parent, node)
{
 //TODO: Determine the accumulator. The node object itself? An empty array?
 var prev = parent.last() || TODODummyNode;
 var res = node;
 
 
 if (TODO.has(SWITCH, node.type()))
 {
  res = SWITCH[node_.type](prev, node); 
 }
 if (TODO.isNode(res) && res !== prev)
 {
  /*
  TODO: Mapping/Resolution.
  */
 }
}

function _prunable(node)
{
 return TODO.has(SWITCH, node.type());
}

function _pruneList(node)
{
 if (node.someChild(_prunable))
 {
  //TODO: New accumulator.
  node.reduceChild(_pruneSwitch);
 }
}

function pruneList()
{
 return this.postEach(_pruneList);
}


BBM.fn.extend({
 //TODO: Extension.
});
}());


