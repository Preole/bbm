
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

function create(options)
{
 return new ParserInline(options);
}

ParserInline.create = create;
ParserInline.prototype = (function (){
 var base = new ParserBase(),
 linkCont = [enumLex.WS, enumLex.NL, enumLex.LINK_CONT],
 
 //Maps Links and Code token types to functions
 inlineSwitch =
 {
  LINK_INT : parseLink,
  LINK_WIKI : parseLink,
  LINK_EXT : parseLink,
  LINK_IMG : parseLinkImg,
  CODE : parseCode,
 },
 
 //Maps link tokens types to ASTNode types.
 linkASTMap =
 { 
  LINK_INT : enumAST.LINK_INT,
  LINK_EXT : enumAST.LINK_EXT,
  LINK_IMG : enumAST.LINK_IMG,
  LINK_WIKI : enumAST.LINK_WIKI
 },
 
 //Maps text-formatting lexical tokens to ASTNode types.
 fmtASTMap =
 { 
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
  
  return node.nodes.length > 0 ? node : null;
 }

 function parseLink(lexTok)
 {
  var callback = lexTok.type === enumLex.LINK_INT ? 
   untilLinkSquareEnd : 
   untilLinkAngleEnd,
   startPos = this.currPos,
   endPos = this.shiftUntilPast(callback) - 1,
   href = this.sliceText(startPos, endPos).trim();

  if (utils.isBlankString(href))
  {
   return;
  }
  this.shiftUntil(untilLinkContNot);


  var node = ASTNode.create(linkASTMap[lexTok.type], {href : href}),
   text = this.lookAheadT(enumLex.LINK_CONT, -1) ? parseCont.call(this) : "";

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
  var startPos = this.currPos,
   endPos = this.shiftUntilPast(untilLinkAngleEnd) - 1,
   src = this.sliceText(startPos, endPos).trim();

  if (utils.isBlankString(src))
  {
   return;
  }
  this.shiftUntil(untilLinkContNot);
  
  var alt = this.lookAheadT(enumLex.LINK_CONT, -1) ? parseCont.call(this) : "";
  if (!utils.isBlankString(alt))
  {
   alt = alt.trim();
  }
  return ASTNode.create(enumAST.LINK_IMG, {src : src, alt : alt});
 }

 function parseCont()
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

 function parse(bbmTokens, forceType)
 {
  this.tokens = bbmTokens;
  this.root = parsePara.call(this, forceType);
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
