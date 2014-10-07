(function (){
"use strict";

var BBM = require("./BBM.js"),
ENUM = BBM.ENUM,
SWITCH =
{
 _DT : _pruneDL,
 _DD : _pruneDL,
 _TH : _pruneTable,
 _TD : _pruneTable,
 _TR : _pruneTable,
 _LI_UL : _pruneUL,
 _LI_OL : _pruneOL
};

function _pruneTable(prev, node)
{
 var prevNode = (/*prev._type ===  ? prev : BBM(BBM.ENUM.TABLE)*/),
  isRow = node._type === ENUM._TR;
 
 if (last.size() <= 0 && isRow)
 {
  appendSimple.call(last, ASTNode(ENUM.TR));
 }
 prevNode.append(node);
 return prevNode;
}

function _pruneUL(prev, node)
{
 var prevNode = (/*isLastUL ? prev : BBM(ENUM.UL)*/);
 prevNode.append(node);
 node._type = ENUM.LI;
 return prevNode;
}

function _pruneOL(prev, node)
{
 var prevNode = (/*isLastOL ? prev : BBM(ENUM.OL)*/);
 return prevNode;
}

function _pruneDL(prev, node)
{
 var prevNode = (/*isLastDL ? prev : BBM(ENUM.DL)*/);
 return prevNode;
}

function _pruneSwitch(nodes, node)
{
 var prev = nodes[nodes.length - 1] || TODODummyNode, res = node;
 if (TODO.has(SWITCH, node_.type))
 {
  res = SWITCH[node_.type](prev, node); //If special node type, merge node into previous.
 }
 if (TODO.isNode(res) && res !== prev)
 {
  nodes.push(res);
 }
}

function _pruneList(node)
{
 if (/*TODO.indexOf(node._type) > -1*/)
 {
  node.mapChild(_pruneSwitch);
 }
}

function pruneList()
{
 return this.postEach(_pruneList);
}


BBM.fn.extend({
 
});


}());


