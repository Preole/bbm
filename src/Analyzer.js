(function (){
"use strict";

var utils = require("./utils.js"),
ASTNode = require("./ASTNode"),
AST = ASTNode.ENUM,

SYMTABLE = {},
AST_LONEPARA = [AST.DD, AST.LI, AST.TH, AST.TD, AST.BLOCKQUOTE],
AST_LINKS = [AST.LINK_EXT, AST.LINK_INT, AST.LINK_WIKI, AST.LINK_IMG],
AST_ALONE = AST_LINKS.concat([AST.PRE, AST.TD, AST.TH, AST.HR, AST.TEXT]);



function isNotBlank(node)
{
 return !utils.isBlankString(node.value) || AST_LINKS.indexOf(node.type) > -1;
}

function isNode(node)
{
 return (node instanceof ASTNode);
}


//Remove empty block elements, post-order traversal
function prune(acc, node, index, sibs)
{
 if (node.nodes.length > 0)
 {
  node.nodes = node.nodes.reduce(prune, []);
  node.nodes = node.nodes.some(isNotBlank) ? node.nodes : [];
 }

 if (node.type === AST.TABLE)
 {
  node.nodes = node.nodes.filter(pruneTR);
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
 
 if (AST_ALONE.indexOf(node.type) > -1 || node.nodes.length > 0)
 {
  acc.push(node);
 }
 return acc;
}

function pruneTR(rowNode, index, sibs)
{
 var gCol = sibs[0].nodes.length;
 
 if (rowNode.nodes.length <= 0)
 {
  return false;
 }
 while (rowNode.nodes.length > gCol)
 {
  rowNode.nodes.pop();
 }
 while (rowNode.nodes.length < gCol)
 {
  rowNode._append(ASTNode(AST.TD), true);
 }
 return true;
}

function pruneDL(node)
{
 var ht = null;
 while ((ht = node.first()) && ht.type === AST.DD)
 {
  node.nodes.shift();
 }
 
 while ((ht = node.last()) && ht.type === AST.DT)
 {
  node.nodes.pop();
 }
}

function pruneIDClass(node, next)
{
 if (!isNode(next))
 {
  return;
 }
 
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
  node.empty()._append(first.nodes);
 }
}




//this = The root node.
function resolveEach(node)
{
 if (!isNode(node))
 {
  return;
 }
 
 node.nodes.forEach(resolveEach, this);
 if (node.type === AST.IMG)
 {
  resolveSRC.call(this, node);
 }
 if (AST_LINKS.indexOf(node.type) > -1)
 {
  resolveURL.call(this, node);
 }
}

function resolveURL(node)
{
 var href = node.attr.href,
  refTable = this.refTable || SYMTABLE;
 
 node.attr.href = utils.hasOwn(refTable, href) ? refTable[href] : href;
 if (node.nodes.length === 0)
 {
  node.empty()._append(node.attr.href); //Use href as display text.
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
 node.nodes = node.nodes.reduce(prune, []);
 node.nodes.forEach(resolveEach, node);
 return node;
}

module.exports = Analyzer;
}());


