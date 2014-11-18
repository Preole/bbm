
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
 return (opts.xhtml && !hasEndTag(node)) ? " /" : ""; 
}

function printIndent(node, opts)
{
 return INLINES[node.type()] ? "" : __.repeatString(" ", opts.depth);
}

function printBlockEnd(node)
{
 return INLINES[node.type()] ? "" : "\n";
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
   res += __.escapeATTR(key).substr(0, opts.maxAttrChars)
   + "=\""
   + ((nType === AST.LINK_INT && key === "href") ? "#" : "")
   + __.escapeATTR(attr[key]).substr(0, opts.maxAttrChars)
   + "\" ";
  }
 }
 return res.length === 0 ? "" : " " + res.trim();
}

function printTagName(node, opts)
{
 var name = MAP_HTML[node.type()] || "";
 if (name && node.level > 0)
 {
  name += Math.min(Math.floor(node.level) + opts.headerOffset, 6);
 }
 return name;
}

function printTagOpen(node, opts)
{
 var name = printTagName(node, opts);
 if (name)
 {
  return printIndent(node, opts)
  + "<"
  + name
  + printAttr(node, opts)
  + printXHTML(node, opts)
  + ">"
  + printBlockEnd(node, opts);
 }
 return "";
}

function printTagClose(node, opts)
{
 var name = printTagName(node, opts);
 if (name && hasEndTag(node, opts))
 {
  return printBlockEnd(node, opts)
  + printIndent(node, opts)
  + "</" 
  + name
  + ">" 
  + (node.isLastChild() ? "" : printBlockEnd(node, opts));
 }
 return "";
}

function printComment(node, opts)
{
 return !opts.comment ? "" : printIndent(node, opts)
 + "<!--\n"
 + __.map(node.children(), printHTML, opts).join("")
 + printIndent(node, opts)
 + "-->"
 + (node.isLastChild() ? "" : printBlockEnd(node, opts));
}

function printText(node, opts)
{
 var rmNL = opts.rmNL && opts.stack.indexOf(AST.PRE) === -1;
 return __.escapeHTML(rmNL ? __.rmNL(node.text()) : node.text());
}

function printHTML(node, opts)
{
 var str = "";
 
 opts.depth += 1;
 opts.stack.push(node.type());
 
 str = node.text()
 ? printText(node, opts)
 : node.type() === AST.COMMENT
 ? printComment(node, opts)
 : printTagOpen(node, opts)
   + __.map(node.children(), printHTML, opts).join("")
   + printTagClose(node, opts);
 
 opts.stack.pop();
 opts.depth -= 1;
 
 return str;
}


/**
 * @method BBM.fn.toHTML
 * @param {Object} options Configuration object for code generation. The
 * following options are available:
 * 
 *   - **[maxAttrChars=2048]** *Number* The maximum number of characters 
 *     allowed in attribute values and keys.
 *
 *   - **[headerOffset=0]** *Number* Increments header tags' level in the 
 *     output. E.g: For a headerOffset of 1, `<h1>` will become `<h2>`, and 
 *     `<h2>` will become `<h3>`, and so on, up to a maximum of `<h6>`.
 *
 *   - **[xhtml=false]** *Boolean* If true, output XHTML-compliant HTML.
 *
 *   - **[comments=false]** *Boolean* If true, output HTML comments.
 * 
 * @return {String} The HTML Output of this Subtree.
 */
BBM.fn.toHTML = function (options)
{
 var opts = __.extend({}, options);
 opts.depth = printTagName(this) ? -1 : -2;
 opts.stack = [];
 opts.maxAttrChars = Math.abs(parseInt(opts.maxAttrChars, 10) || 2048);
 opts.headerOffset = Math.abs(parseInt(opts.headerOffset, 10) || 0);
 return printHTML(this, opts);
};

