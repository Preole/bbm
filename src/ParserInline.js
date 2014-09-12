
(function (){
"use strict";

var utils = require("./utils.js"),
 enumLex = require("./Lexer.js").types,
 ASTNode = require("./ASTNode.js"),
 enumAST = ASTNode.types,
 ParserBase = require("./ParserBase.js");


function ParserInline(options)
{
 this.reset(options);
}

function create(tokens)
{
 return new ParserInline(tokens);
}

ParserInline.create = create;
ParserInline.prototype = (function (){
 var base = ParserBase.prototype,
 linkCont = [enumLex.WS, enumLex.NL, enumLex.LINK_CONT],
 inlineSwitch =
 {
  LINK_INT : parseLink,
  LINK_WIKI : parseLink,
  LINK_EXT : parseLink,
  LINK_IMG : parseImg,
  CODE : parseCode,
 },
 linkASTMap =
 { //Maps link tokens types to ASTNode types.
  LINK_INT : enumAST.LINK_INT,
  LINK_EXT : enumAST.LINK_EXT,
  LINK_IMG : enumAST.LINK_IMG,
  LINK_WIKI : enumAST.LINK_WIKI
 },
 fmtASTMap =
 { //Maps text-formatting lexical tokens to ASTNode types.
  INS : enumAST.INS,
  DEL : enumAST.DEL,
  INS_END : enumAST.INS,
  DEL_END : enumAST.DEL,
  BOLD : enumAST.BOLD,
  EM : enumAST.EM,
  SUP : enumAST.SUP,
  SUB : enumAST.SUB,
  UNDER : enumAST.UNDER
 },
 fmtStartEndMap =
 {
  INS : enumLex.INS_END,
  DEL : enumLex.DEL_END,
  BOLD : enumLex.BOLD,
  EM : enumLex.EM,
  SUP : enumLex.SUP,
  SUB : enumLex.SUB,
  UNDER : enumLex.UNDER
 };

 
 function untilCodeEnd(token, tokStart)
 {
  return token.type === tokStart.type && token.lexeme === tokStart.lexeme;
 }

 function untilLinkSquareEnd(token)
 {
  return token.type === enumLex.BRACKET_R;
 }

 function untilLinkAngleEnd(token)
 {
  return token.type === enumLex.GT;
 }

 function untilLinkContNot(token)
 {
  return linkCont.indexOf(token.type) === -1;
 }
 
 function untilInline(token)
 {
  return !!inlineSwitch[token.type] || !!fmtASTMap[token.type]; 
 }

 function parsePara(formatStack, typeAST)
 {
  var fmtStack = formatStack ? formatStack : [],
   node = ASTNode.create(typeAST || enumAST.P),
   isNotAbuse = fmtStack.length < (this.options.maxSpans || 8),
   hasFmtMatch = false,
   txtStart = this.currPos,
   token = null;
   
  while (token = this.lookAt(this.shiftUntil(untilInline)))
  {
   hasFmtMatch = fmtStack.indexOf(token.type) !== -1;

   if (txtStart < this.currPos) //Collect text.
   {
    node.append(this.sliceText(txtStart, this.currPos));
   }
   
   if (txtStart <= this.currPos) //Break Infinite Loop, Skip past token.
   {
    txtStart = this.shift();
   }
   
   if (inlineSwitch[token.type] instanceof Function) //Case code, link, img.
   {
    node.append(inlineSwitch[token.type].call(this, token));
   }
   else if (!hasFmtMatch && isNotAbuse) //Case Format tag start
   {
    fmtStack.push(fmtStartEndMap[token.type]);
    node.append(parsePara.call(this, fmtStack, fmtASTMap[token.type]));
    fmtStack.pop();
   }

   txtStart = !hasFmtMatch && isNotAbuse ? this.currPos : this.currPos - 1;
   if (hasFmtMatch) //Case Format tag 
   {
    break;
   }
  }

  if (txtStart < this.currPos)
  {
   node.append(this.sliceText(txtStart, this.currPos));
  }
  
  return node;
 }

 function parseLink(lexTok)
 {
  var callback = lexTok.type === enumLex.LINK_INT ? 
   untilLinkSquareEnd : 
   untilLinkAngleEnd;

  var node = ASTNode.create(linkASTMap[lexTok.type]),
   startPos = this.currPos,
   endPos = this.shiftUntilPast(cb) - 1,
   href = this.sliceText(startPos, endPos).trim(),
   text = "";

  if (utils.isBlankString(href))
  {
   return;
  }
  
  node.attr = {};
  node.attr.href = this.sliceText(startPos, endPos);
  this.shiftUntil(untilLinkContNot);
  text = this.lookAheadType(enumLex.LINK_CONT) ? 
   parseLinkCont.call(this) : text;

  if (utils.isBlankString(text))
  {
   node.append(href);
  }
  else
  {
   node.append(text);
  }
  return node;
 }

 function parseLinkImg(lexTok)
 {
  var node = ASTNode.create(enumAST.LINK_IMG),
   startPos = this.currPos,
   endPos = this.shiftUntilPast(untilLinkAngleEnd) - 1,
   src = this.sliceText(startPos, endPos).trim(),
   alt = "";

  if (utils.isBlankString(src))
  {
   return;
  }
  
  node.attr = {};
  node.attr.src = src;
  this.shiftUntil(untilLinkContNot);
  alt = this.lookAheadType(enumLex.LINK_CONT) ?
   parseLinkCont.call(this) : alt;
   
  if (!utils.isBlankString(alt))
  {
   node.attr.alt = alt.trim();
  }
  return node;
 }

 function parseLinkCont()
 {
  var startPos = this.shift(),
   endPos = this.shiftUntilPast(untilLinkSquareEnd) - 1;
   
  return this.sliceText(startPos, endPos);
 }

 function parseCode(lexTok)
 {
  var node = ASTNode.create(enumAST.CODE),
   startPos = this.currPos,
   endPos = this.shiftUntilPast(untilCodeEnd) - 1,
   text = this.sliceText(startPos, endPos);
   
  node.append(text);
  return node;
 }



 /*
 Public Methods
 --------------
 */

 function parse(bbmTokens)
 {
  this.tokens = bbmTokens;
  this.root = parsePara.call(this);
  return this.reset();
 }

 base.parse = parse;
 return base;
}());

if (typeof module === "object" && module.exports)
{
 module.exports = ParserInline;
}
}());
