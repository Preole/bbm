
(function (){
"use strict";

var util = require("./util.js"),
 enumLex = require("./Lexer.js").types,
 ASTNode = require("./ASTNode.js"),
 enumAST = require("./ASTNodeEnum.js"),
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
   isNotAbuse = fmtStack.length < this.options.maxSpans;
   txtStart = this.currPos,
   token = null;
   
  while (token = this.lookAt(this.shiftUntil(untilInline)))
  {
   //Collect text, skip past the offending token.
   if (txtStart < this.currPos)
   {
    node.nodes.push(this.sliceText(txtStart, this.currPos));
    this.shift();
    txtStart = this.currPos;
   }
   
   //Case: code, link, and image
   if (isNotAbuse && inlineSwitch[token.type] instanceof Function)
   {
    node.nodes.push(inlineSwitch[token.type](token));
   }
   //Case: end of a formatting tag: Terminate immediately.
   else if (fmtStack.indexOf(token.type) !== -1)
   {
    break;
   }
   //Case: start of a formatting tag: Recursion.
   else
   {
    fmtStack.push(fmtStartEndMap[token.type]);
    node.nodes.push(parsePara.call(this, fmtStack, fmtASTMap[token.type]));
    fmtStack.pop();
   }
  }

  if (txtStart < this.currPos)
  {
   node.nodes.push(this.sliceText(txtStart, this.currPos));
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
   href = util.trim(this.sliceText(startPos, endPos));

  if (href.length > 0)
  {
   node.attr.href = this.sliceText(startPos, endPos);
   this.shiftUntil(untilLinkContNot);
   if (this.lookAheadType(enumLex.LINK_CONT))
   {
    node.nodes.push(parseLinkCont.call(this));
   }
   return node;
  }
 }

 function parseLinkImg(lexTok)
 {
  var node = ASTNode.create(enumAST.LINK_IMG),
   startPos = this.currPos,
   endPos = this.shiftUntilPast(untilLinkAngleEnd) - 1,
   src = util.trim(this.sliceText(startPos, endPos));

  if (src.length > 0)
  {
   node.attr.src = src;
   this.shiftUntil(untilLinkContNot);
   if (this.lookAheadType(enumLex.LINK_CONT))
   {
    node.attr.alt = util.trim(parseLinkCont.call(this));
   }
   return node;
  }
 }

 function parseLinkCont(lexTok)
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
   
  node.nodes.push(text);
  return node;
 }


 //TODO: Consolidate ParserBase, ParserInline, and ParserBlock about root nodes.
 function parse(bbmTokens)
 {
  var rootNode;
  this.tokens = bbmTokens;
  
  this.root = parsePara.call(this);
  this.root.errors = this.errors;
  rootNode = this.root;
  
  this.reset(); //Code smell.
  return rootNode;
 }

 base.parse = parse;
 return base;
}());

if (typeof module === "object" && module.exports)
{
 module.exports = ParserInline;
}
}());
