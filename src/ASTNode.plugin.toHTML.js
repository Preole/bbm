(function (){
"use strict";

var utils = require("./utils.js"),
AST = require("./ASTNode.js").ENUM,
EMPTY = {},
XHTML = [AST.HR, AST.LINK_IMG],
INLINES =
[
 AST.DEL,
 AST.INS,
 AST.U,
 AST.SUB,
 AST.SUP,
 AST.EM,
 AST.BOLD,
 AST.CODE,
 AST.LINK_IMG,
 AST.LINK_INT,
 AST.LINK_WIKI,
 AST.LINK_EXT
],
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
 CODE : "code"
};

function hasEndTag(node)
{
 return XHTML.indexOf(node.type) > -1;
}

function printBlockEnd(node)
{
 return INLINES.indexOf(node.type) === -1 ? "\n" : ""; 
}

function printXHTML(node, xFlag)
{
 return (xFlag && XHTML.indexOf(node.type) > -1) ? " /" : ""; 
}

function printIndent(level)
{
 return utils.repeatString(" ", Number(level) || 0);
}

function printHeader(node)
{
 var headerLevel = Number(node.level) || 1) + Number(node.offset || 0);
 return "h" + Math.min(headerLevel, 6);
}

//TODO: Formalize options for the HTML processor.
function printAttr(node)
{
 var res = " ", attr = utils.isObject(node.attr) ? node.attr : EMPTY;
 for (var key in attr)
 {
  if (utils.hasOwn(attr, key))
  {
   res += utils.escapeATTR(key).substring(0, 2048)
    + "=\"" 
    + utils.escapeATTR(attr[key]).substring(0, 2048)
    + "\"";
  }
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
  printHeader(node) : 
  MAP_HTML[node.type];

 return utils.escapeATTR(tagName || "");
}

function printTagOpen(node, stack)
{
 var tagName = printTagName(node);
 if (tagName)
 {
  return printIndent(stack.length)
   + "<"
   + tagName
   + printAttr(node)
   + printXHTML(node, this.XHTML)
   + ">" 
   + printBlockEnd(node);
 }
 return "";
}

function printTagClose(node, stack)
{
 var tagName = printTagName(node);
 if (tagName && hasEndTag(node))
 {
  return printIndent(stack.length)
   + "</" 
   + tagName
   + ">" 
   + printBlockEnd(node);
 }
 return "";
}

//TODO: Account for indentation and NL removal: str.replace(NL, NL + Spaces);
function printText(node, stack)
{
 return utils.escapeHTML(node.value); 
}

/*
TODO: Steps before outputting HTML:

- Remove empty inline and block elements.
- Remove NL from TEXT nodes (Unless it's inside a PRE block)
- Resolve URL references.
- Determine header offsets.
- Strip excessive characters from attributes.
- 
*/
function printRecurse(accu, node, stack)
{
 if (utils.isString(node.value))
 {
  accu += printText.call(this, node, stack);
 }
 else
 {
  accu = printTagOpen.call(this, node, stack)
   + accu
   + printTagClose.call(this, node, stack);
 }
 return accu;
}

//Export
ASTNode.prototype.toHTML = function (options)
{
 return this.postReduce(printRecurse, "", options);
};

}());

