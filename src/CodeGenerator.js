(function (){
"use strict";

var utils = require("./utils.js"),
AST = require("./ASTNode.js").ENUM,
XHTML = [AST.HR, AST.LINK_IMG],
INLINES = [AST.DEL, AST.INS, AST.U, AST.SUB, AST.SUP, AST.EM, AST.BOLD, AST.CODE],
MAP_HTML =
{
 P : "p",
 BLOCKQUOTE : "blockquote",
 PRE : "pre",
 DIV : "div",
 LI : "li",
 UL : "ul",
 OL : "ol",
 HEADER : "h",
 DT : "dt",
 DD : "dd",
 DL : "dl",
 TH : "th",
 TD : "td",
 HR : "hr",
 TR : "tr",
 TABLE : "table",
 LINK_INT : "a",
 LINK_EXT : "a",
 LINK_IMG : "img",
 LINK_WIKI : "a",
 DEL : "del",
 INS : "ins",
 U : "u",
 SUB : "sub",
 SUP : "sup",
 EM : "em",
 BOLD : "strong",
 CODE : "code",
};

function hasEndTag(node)
{
 return XHTML.indexOf(node.type) > -1;
}

function printBlockEnd(node)
{
 return INLINES.indexOf(node.type) === -1 ? "\n" : ""; //TODO: Choose standard NL.
}

function printXHTML(node)
{
 return XHTML.indexOf(node.type) > -1 ? " /" : ""; //TODO: options.target === "XHTML" toLowerCase.
}

function printIndent(level)
{
 return utils.repeatString(" ", Number(level) || 0);
}


function printHeader(node, hOffset)
{
 var level = node.level || 1,
  offset = hOffset || 0;
 
 return "h" + Math.min(level, level + Math.floor(Math.abs(offset)));
}

function printAttr(node)
{
 var res = " ", attr = node.attr;
 for (var key in attr)
 {
  res += TODOSanitize(key) + "=\"" + TODOSanitize(attr[key]) + "\"";
 }
 if (res.length === 1)
 {
  res = "";
 }
 return res;
}

function printTagName(node)
{
 var tagName = node.type === AST.HEADER ? 
  printHeader(node, /*TODO: Pass options to printHeader*/) : 
  MAP_HTML[node.type];

 return TODOSanitize(tagName);
}

function printTagOpen(node)
{
 var tagName = printTagName(node);
 if (tagName)
 {
  return printIndent(TODO) + "<"
   + TODOSanitize(tagName) + printAttr(node) 
   + printXHTML(node) + ">" + printBlockEnd(node);
 }
 return "";
}

function printTagClose(node)
{
 var tagName = printTagName(node);
 if (tagName && hasEndTag(node))
 {
  return printIndent(TODO) + "</" 
   + printTagName(node)
   + ">" + printBlockEnd(node);
 }
 return "";
}

function printText(node, rmEOL)
{
 return TODOSanitize(rmEOL ? node.value.replace(TODO_NL, "") : node.value);
}

function printMiddle(node)
{
 return utils.isString(node.value) ? 
  printText(node, node.parent.type !== AST.PRE && options.rmEOLTODO) : 
  node.nodes.map(printTag, this).join("");
}

function printTag(node)
{
 return printTagOpen.call(this, node)
  + printMiddle.call(this, node)
  + printTagClose.call(this, node);
}

function CodeGenerator(node, options)
{
 return printTag.call(options, node);
}

module.exports = CodeGenerator;
}());

