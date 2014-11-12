
"use strict";

var BBM = module.exports = require("./BBM.js");
var __ = require("./__.js");
var AST = BBM.ENUM;
var LINKS =
{
  LINK_EXT : 1
, LINK_INT : 1
, LINK_WIKI : 1
};

var ALONE =
{
  PRE : 1
, TD : 1
, TH : 1
, LI : 1
, BLOCKQUOTE : 1
, DD : 1
, DT : 1
, HR : 1
, DIV : 1
, LINK_EXT : 1
, LINK_INT : 1
, LINK_WIKI : 1
, LINK_IMG : 1
, COMMENT : 1
};


function isBlank(node)
{
 return __.isBlankString(node.text())
 && node.size() === 0
 && !ALONE[node.type()];
}

function isKept(node)
{
 return node.text() || !isBlank(node);
}

function pruneTR(node)
{
 var maxCol = node.first() ? node.first().size() : 0;
 node.children().forEach(function (rNode){
  if (rNode.size() > 0)
  {
   while (rNode.size() > maxCol)
   {
    rNode.pop();
   }
   while (rNode.size() < maxCol)
   {
    rNode.append(BBM(AST.TD));
   }
  }
 });
}

function pruneDL(node)
{
 var ht = null;
 while ((ht = node.first()) && ht.type() === AST.DD)
 {
  node.shift();
 }
 
 while ((ht = node.last()) && ht.type() === AST.DT)
 {
  node.pop();
 }
}

function pruneBlank(node)
{
 var type = node.type();
 if (node.children().every(isBlank))
 {
  return node.empty().append(LINKS[type] ? node.attr("href") : null);
 }
 
 
 if (type === AST.TABLE)
 {
  pruneTR(node);
 }
 else if (type === AST.DL)
 {
  pruneDL(node);
 }
 node.filterChild(isKept);
}


/**
 * Removes blank subtrees and nodes from the current node. A subtree is 
 * considered empty if it's not the following element, and it contains no 
 * visible text content: (That is, only blank strings such as " ")
 *
 * - TD
 * - TH
 * - PRE
 * - LI
 * - BLOCKQUOTE
 * - DD
 * - DT
 * - HR
 * - DIV
 * - LINK_* (Hyperlink and image nodes)
 * - COMMENT 
 *
 * In short, nested inline formatting containing nothing but blank strings 
 * shall be removed from the tree, such as `** -- __ __ -- **`.
 *
 * @method pruneBlank
 * @return {BBM} The current node with empty subtrees pruned.
 */
BBM.fn.pruneBlank = function ()
{
 return this.eachPost(pruneBlank);
};

