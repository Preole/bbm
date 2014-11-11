
"use strict";

var BBM = module.exports = require("./BBM.js");
var __ = require("./__.js");
var AST = BBM.ENUM;
var INLINES =
{
  U : 1
, EM : 1
, DEL : 1
, INS : 1
, SUB : 1
, SUP : 1
, BOLD : 1
, CODE : 1
, LINK_IMG : 1
, LINK_INT : 1
, LINK_WIKI : 1
, LINK_EXT : 1
};

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
 return node.type() !== AST.LINK_IMG && node.type() !== AST.HR;
}

function printXHTML(node, opts)
{
 return (opts.XHTML && !hasEndTag(node)) ? " /" : ""; 
}

function printIndent(node, opts)
{
 return INLINES[node.type()] ? "" : __.repeatString(" ", opts.depth);
}

function printBlockEnd(node)
{
 return INLINES[node.type()] ? "" : "\n";
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
 var nType = node.type();
 
 for (var key in attr)
 {
  if (__.has(attr, key) && !__.isBlankString(key))
  {
   res += __.escapeATTR(key).substring(0, opts.maxAttrChars)
   + "=\""
   + ((nType === AST.LINK_INT && key === "href") ? "#" : "")
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
  + (node.isLastChild() ? "" : printBlockEnd(node, opts));
 }
 return "";
}

function printComment(node, opts)
{
 var indent = printIndent(node, opts);
 return indent
 + "<!--\n"
 + __.map(node.children(), printHTML, opts).join("")
 + indent
 + "-->"
 + (node.isLastChild() ? "" : printBlockEnd(node, opts));
}

function printText(node, opts)
{
 return __.escapeHTML(opts.rmNL ? __.rmNL(node.text()) : node.text()); 
}

function printHTML(node, opts)
{
 var str = "";
 
 opts.depth += 1;
 str = node.text().length > 0
 ? printText(node, opts)
 : node.type() === AST.COMMENT
 ? (opts.comment ? printComment(node, opts) : "")
 : printTagOpen(node, opts)
   + __.map(node.children(), printHTML, opts).join("")
   + printTagClose(node, opts);
 opts.depth -= 1;
 
 return str;
}


//TODO; Document this method.
BBM.fn.toHTML = function (options)
{
 var opts = __.isObject(options) ? options : {};
 opts.depth = (parseInt(opts.depth, 10) || 0) + (printTagName(this) ? -1 : -2);
 opts.maxAttrChars = Math.abs(parseInt(opts.maxAttrChars, 10) || 2048);
 opts.headerOffset = Math.abs(parseInt(opts.headerOffset, 10) || 0);
 opts.XHTML = !!opts.XHTML;
 opts.comment = !!opts.comment;
 opts.rmNL = !!opts.rmNL;
 return printHTML(this, opts);
};

