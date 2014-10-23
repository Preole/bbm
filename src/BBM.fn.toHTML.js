(function (){
"use strict";

var BBM = require("./BBM.js");
var AST = BBM.ENUM;
var XHTML = [AST.HR, AST.LINK_IMG];
var NOOP = {};
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

/*
Options:

rmNL
headerOffset
maxAttrChars
XHTML
*/

function hasEndTag(node)
{
 return XHTML.indexOf(node.type()) === -1;
}

function printBlockEnd(node)
{
 return INLINES.indexOf(node.type()) === -1 ? "\n" : ""; 
}

function printXHTML(node, opts)
{
 var isXHTML = !!opts.options.XHTML;
 return (isXHTML && XHTML.indexOf(node.type()) > -1) ? " /" : ""; 
}

function printIndent(node, opts)
{
 return INLINES.indexOf(node.type()) === -1
 ? BBM.repeatString(" ", parseInt(opts.depth, 10) || 0)
 : "";
}

function printHeader(node, opts)
{
 var off = Math.abs(parseInt(opts.options.headerOffset, 10) || 0);
 var lvl = Math.abs(parseInt(node.level) || 1);
 return "h" + Math.min(lvl + off, 6);
}

function printAttr(node, opts)
{
 var res = "";
 var attr = node.attr();
 var maxChars = Math.abs(parseInt(opts.options.maxAttrLength, 10) || 2048);
 
 for (var key in attr)
 {
  if (BBM.has(attr, key))
  {
   res += BBM.escapeATTR(key).substring(0, maxChars)
   + "=\"" 
   + BBM.escapeATTR(attr[key]).substring(0, maxChars)
   + "\" ";
  }
 }
 return res.length === 0 ? "" : " " + res.trim();
}

function printTagName(node, opts)
{
 var tagName = node.type() === AST.HEADER
 ? printHeader(node, opts)
 : MAP_HTML[node.type()];

 return BBM.escapeATTR(tagName || "");
}

function printTagOpen(node, opts)
{
 var tagName = printTagName(node, opts);
 if (tagName)
 {
  return printIndent(node, opts)
  + "<"
  + tagName
  + printAttr(node, opts)
  + printXHTML(node, opts)
  + ">"
  + printBlockEnd(node, opts);
 }
 return "";
}

function printTagClose(node, opts)
{
 var tagName = printTagName(node, opts);
 var isLastChild = node.parent() && node.parent().last() === node;
 if (tagName && hasEndTag(node, opts))
 {
  return printBlockEnd(node, opts)
  + printIndent(node, opts)
  + "</" 
  + tagName
  + ">" 
  + (isLastChild ? printIndent(node, opts) : printBlockEnd(node, opts));
 }
 return "";
}

function printComment(node, opts)
{
 var depth = opts.depth;
 return "\n"
 + printIndent(depth)
 + "<!--\n"
 + node.children().map(printHTML, opts).join("");
 + printIndent(depth)
 + "-->\n";
}

function printText(node, opts)
{
 var rmNL = !!opts.options.rmNL;
 return BBM.escapeHTML(rmNL ? BBM.rmNL(node.text()) : node.text()); 
}

function printHTML(node)
{
 var str = "";
 this.depth += 1;
 str = node.text().length > 0
 ? printText(node, this)
 : node.type() === AST.COMMENT
 ? printComment(node, this)
 : printTagOpen(node, this)
   + node.children().map(printHTML, this).join("")
   + printTagClose(node, this);
 this.depth -= 1;
 return str;
}


function toHTML(options)
{
 var opts =
 {
   options : BBM.isObject(options) ? options : NOOP
 , depth : this.type() === AST.ROOT ? -2 : -1
 };
 return printHTML.call(opts, this);
}

BBM.fn.toHTML = toHTML;

}());