
"use strict";

var BBM = require("./BBM.js");
var __ = BBM.__;
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

function printXHTML(node, opts)
{
 return (opts.XHTML && XHTML.indexOf(node.type()) > -1) ? " /" : ""; 
}

function printIndent(node, opts)
{
 return INLINES.indexOf(node.type()) === -1
 ? __.repeatString(" ", opts.depth)
 : "";
}

function printBlockEnd(node)
{
 return INLINES.indexOf(node.type()) === -1 ? "\n" : ""; 
}

function printHeader(node, opts)
{
 var lvl = Math.abs(parseInt(node.level, 10) || 1);
 return "h" + Math.min(lvl + opts.headerOffset, 6);
}

function printAttr(node, opts)
{
 var res = "";
 var attr = node.attr();
 
 for (var key in attr)
 {
  if (__.has(attr, key))
  {
   res += __.escapeATTR(key).substring(0, opts.maxAttrChars)
   + "=\""
   + ((node.type() === AST.LINK_INT && key === "href") ? "#" : "")
   + __.escapeATTR(attr[key]).substring(0, opts.maxAttrChars)
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

 return __.escapeATTR(tagName || "");
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
 if (tagName && hasEndTag(node, opts))
 {
  return printBlockEnd(node, opts)
  + printIndent(node, opts)
  + "</" 
  + tagName
  + ">" 
  + (node.isLastChild()
    ? printIndent(node, opts)
    : printBlockEnd(node, opts));
 }
 return "";
}

function printComment(node, opts)
{
 var indent = printIndent(node, opts);
 return indent
 + "<!--\n"
 + node.children().map(printHTML, opts).join("")
 + indent
 + "-->"
 + (node.isLastChild() ? printIndent(node, opts) : printBlockEnd(node, opts));
}

function printText(node, opts)
{
 return __.escapeHTML(opts.rmNL ? __.rmNL(node.text()) : node.text()); 
}

function printHTML(node)
{
 var str = "";
 var opts = this;
 
 opts.depth += 1;
 str = node.text().length > 0
 ? printText(node, opts)
 : node.type() === AST.COMMENT
 ? printComment(node, opts)
 : printTagOpen(node, opts)
   + node.children().map(printHTML, opts).join("")
   + printTagClose(node, opts);
 opts.depth -= 1;
 return str;
}

BBM.fn.toHTML = function (options)
{
 var opts = __.extend({}, options);
 opts.depth = (parseInt(opts.depth, 10) || 0) + (printTagName(this) ? -1 : -2);
 opts.maxAttrChars = Math.abs(parseInt(opts.maxAttrChars, 10) || 2048);
 opts.headerOffset = Math.abs(parseInt(opts.headerOffset, 10) || 0);
 opts.XHTML = !!opts.XHTML;
 opts.rmNL = !!opts.rmNL;
 return printHTML.call(opts, this);
};

module.exports = BBM;

