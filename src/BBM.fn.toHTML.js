(function (){
"use strict";

var BBM = require("./BBM.js");
var AST = BBM.ENUM;
var XHTML = [AST.HR, AST.LINK_IMG];
var INLINES =
[
  AST.DEL
, AST.INS
, AST.U
, AST.SUB
, AST.SUP
, AST.EM
, AST.BOLD
, AST.CODE
, AST.LINK_IMG
, AST.LINK_INT
, AST.LINK_WIKI
, AST.LINK_EXT
];

var MAP_HTML =
{
  P : "p"
, BLOCKQUOTE : "blockquote"
, PRE : "pre"
, DIV : "div"
, LI : "li"
, UL : "ul"
, OL : "ol"
, HEADER : "h"
, DT : "dt"
, DD : "dd"
, DL : "dl"
, TH : "th"
, TD : "td"
, HR : "hr"
, TR : "tr"
, TABLE : "table"
, LINK_INT : "a"
, LINK_EXT : "a"
, LINK_IMG : "img"
, LINK_WIKI : "a"
, DEL : "del"
, INS : "ins"
, U : "u"
, SUB : "sub"
, SUP : "sup"
, EM : "em"
, BOLD : "strong"
, CODE : "code"
};

function hasEndTag(node)
{
 return XHTML.indexOf(node.type()) === -1;
}

function printBlockEnd(node)
{
 return INLINES.indexOf(node.type()) === -1 ? "\n" : ""; 
}

function printXHTML(node, isXHTML)
{
 return (isXHTML && XHTML.indexOf(node.type()) > -1) ? " /" : ""; 
}

function printIndent(level)
{
 return BBM.repeatString(" ", Number(level) || 0);
}

function printHeader(node)
{
 return "h" + Math.min(Math.abs(Math.floor(Number(node.level) || 1)), 6);
}

function printAttr(node)
{
 var res = " ", attr = node.attr();
 for (var key in attr)
 {
  if (BBM.has(attr, key))
  {
   res += BBM.escapeATTR(key).substring(0, 2048)
   + "=\"" 
   + BBM.escapeATTR(attr[key]).substring(0, 2048)
   + "\"";
  }
 }
 return res.length === 1 ? "" : res;
}

function printTagName(node)
{
 var tagName = node.type() === AST.HEADER
 ? printHeader(node)
 : MAP_HTML[node.type()];

 return BBM.escapeATTR(tagName || "");
}

function printTagOpen(node)
{
 var tagName = printTagName(node);
 if (tagName)
 {
  return printIndent()
  + "<"
  + tagName
  + printAttr(node)
  + printXHTML(node)
  + ">"
  + printBlockEnd(node);
 }
 return "";
}

function printTagClose(node)
{
 var tagName = printTagName(node);
 if (tagName && hasEndTag(node))
 {
  return printBlockEnd(node)
  + printIndent()
  + "</" 
  + tagName
  + ">" 
  + printBlockEnd(node);
 }
 return "";
}

function printComment(node)
{
 return "\n"
 + printIndent()
 + "<!--\n"
 + node.children().map(printHTML, this).join("");
 + printIndent(stack.length)
 + "-->\n";
}

//TODO: NL removal for text nodes not in PRE or COMMENT.
function printText(node)
{
 return BBM.escapeHTML(node.text()); 
}

//TODO: Implement call stack size and indentation.
function printHTML(node, index, sibs)
{
 if (node.text().length > 0)
 {
  return printText(node);
 }
 if (node.type() === AST.COMMENT)
 {
  return printComment(node);
 }
 return printTagOpen(node, this)
 + node.children().map(printHTML, this).join("")
 + printTagClose(node);
}


function toHTML()
{
 return this.children().map(printHTML).join("");
}

BBM.fn.toHTML = toHTML;

}());