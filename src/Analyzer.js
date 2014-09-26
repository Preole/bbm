module.exports = (function (){
"use strict";

var utils = require("./utils.js"),
AST = require("./ASTNode").ENUM,

SYMTABLE = {},
AST_LONEPARA = [AST.DD, AST.LI, AST.TH, AST.TD, AST.BLOCKQUOTE],
AST_ALONE = [AST.PRE, AST.TD, AST.TH],
AST_LINKS = [AST.LINK_EXT, AST.LINK_INT, AST.LINK_WIKI, AST.LINK_IMG],
AST_INLINE = AST_LINKS.concat([
 AST.DEL,
 AST.INS,
 AST.UNDER,
 AST.SUB,
 AST.SUP,
 AST.EM,
 AST.BOLD,
 AST.CODE,
 AST.TEXT
]);


//Remove empty block elements, post-order traversal.
function reduceBlock(acc, node, index, sibs)
{
 var first = node.first();
 
 if (node.type !== AST.PRE && first && AST_INLINE.indexOf(first.type) > -1)
 {
  node.nodes = node.nodes.some(someNotWS) ? node.nodes : [];
 }
 else if (Array.isArray(node.nodes) && node.nodes.length > 0)
 {
  node.nodes = node.nodes.reduce(reduceBlock, []);
 }

 if (node.type === AST.TABLE)
 {
  node.nodes = node.nodes.reduce(reduceTR, []);
 }
 else if (node.type === AST.DL)
 {
  pruneDL(node);
 }
 else if ((node.type === AST.ID || node.type === AST.CLASS))
 {
  pruneIDClass(node, sibs[index + 1]);
 }
 else if (AST_LONEPARA.indexOf(node.type) !== -1)
 {
  pruneLonePara(node);
 }
 
 if (AST_ALONE.indexOf(node.type) !== -1 || node.nodes.length > 0)
 {
  acc.push(node);
 }
 return acc;
}

function reduceTR(acc, rowNode)
{
 var gCol = acc[0] ? acc[0].nodes.length : rowNode.nodes.length;
  rCol = rowNode.nodes.length;
  
 if (rCol <= 0)
 {
  return acc;
 }
 else if (rCol > gCol)
 {
  rowNode.nodes = rowNode.nodes.slice(0, gCol);
 }
 else if (rCol < gCol)
 {
  rowNode.nodes = rowNode.nodes.concat(createCells(gCol - rCol));
 }
 acc.push(rowNode);
 return acc;
}

function pruneDL(node)
{
 var first = node.first();
 while (first && first.type === AST.DD)
 {
  node.nodes.shift();
 }
 
 var last = node.last();
 while (last && last.type === AST.DT)
 {
  node.nodes.pop();
 }
}

function pruneIDClass(node, next)
{
 if (node.attr["class"])
 {
  if (!utils.isString(next.attr["class"]))
  {
   next.attr["class"] = "";
  }
  next.attr["class"] += node.attr["class"] + " ";
 }
 else if (node.attr.id)
 {
  next.attr.id = node.attr.id;
 }
}

function pruneLonePara(node)
{
 var first = node.first(),
  nodeCount = node.nodes.length;

 if (nodeCount === 1 && first.type === AST.P)
 {
  node.attr = first.attr;
  node.append(first.nodes);
 }
}

function createCells(cellCount)
{
 var cells = Array(cellCount);
 cells.forEach(function (val, index, array){
  array[index] = ASTNode(AST.TD);
 });
 return cells;
}



function someNotWS(node)
{
 if (node.type === AST.TEXT)
 {
  return !utils.isBlankString(node.nodes.join(""));
 }
 return linksImgAST.indexOf(node.type) > -1 || node.nodes.some(someNotWS);
}

//this = The root node.
function resolveEach(node)
{
 if (node.type !== AST.TEXT && Array.isArray(node.nodes))
 {
  node.nodes.forEach(resolveEach, this);
 }
 else if (node.type === AST.IMG)
 {
  resolveSRC.call(this, node);
 }
 else if (AST_LINKS.indexOf(node.type) > -1)
 {
  resolveURL.call(this, node);
 }
}

function resolveURL(node)
{
 var href = node.attr.href,
  refTable = this.refTable || SYMTABLE;
 
 node.attr.href = utils.hasOwn(refTable, href) ? refTable[href] : href;
 if (!node.nodes.some(someNotWS))
 {
  node.empty().append(node.attr.href); //Use href as display text.
 }
}

function resolveSRC(node)
{
 var src = node.attr.src,
  refTable = this.refTable || SYMTABLE;
 
 node.attr.src = utils.hasOwn(refTable, src) ? refTable[src] : src;
}


function Analyzer(node)
{
 node.nodes = node.nodes.reduce(reduceBlock, []);
 node.nodes.forEach(resolveEach, node);
 return node;
}

return Analyzer;

}());


