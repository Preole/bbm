
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
 linkAnchors = [enumLex.LINK_INT, enumLex.LINK_WIKI, enumLex.LINK_EXT],
 
 //Maps text-formatting lexical tokens to ASTNode types.
 fmtASTMap =
 {
  LINK_INT : enumAST.LINK_INT,
  LINK_EXT : enumAST.LINK_EXT,
  LINK_IMG : enumAST.LINK_IMG,
  LINK_WIKI : enumAST.LINK_WIKI,
  INS : enumAST.INS,
  DEL : enumAST.DEL,
  INS_END : enumAST.INS,
  DEL_END : enumAST.DEL,
  BOLD : enumAST.BOLD,
  EM : enumAST.EM,
  SUP : enumAST.SUP,
  SUB : enumAST.SUB,
  UNDER : enumAST.UNDER,
  CODE : enumAST.CODE,
  PRE : enumAST.CODE
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

 
 function untilCode(token, tokStart)
 {
  return (token.type === enumLex.CODE || token.type === enumLex.PRE) &&
   (tokStart.type === enumLex.CODE || tokStart.type === enumLex.PRE) &&
   token.lexeme === tokStart.lexeme;
 }

 function untilBracket(token)
 {
  return token.type === enumLex.BRACKET_R;
 }

 function untilAngle(token)
 {
  return token.type === enumLex.GT;
 }
 
 function untilLinkCont(token)
 {
  return token.type === enumLex.LINK_CONT || 
   token.type !== enumLex.WS ||
   token.type !== enumLex.NL;
 }
 
 function untilInline(token)
 {
  return token.type === enumLex.BRACKET_R || fmtASTMap[token.type]; 
 }

 function parsePara(fmtStack, premade)
 {
  var fStack = fmtStack ? fmtStack : [],
   node = premade || ASTNode.create(enumAST.P),
   isNotAbuse = fStack.length < (this.options.maxSpans || 8),
   txtStart = this.currPos,
   hasBracket = fStack.indexOf(enumLex.BRACKET_R) > -1,
   hasNode = 0,
   fIndex = -1,
   endOffset = 0,
   token = null;
   
  while (token = this.lookAt(this.shiftUntil(untilInline)))
  {
   fIndex = fStack.indexOf(token.type);
   hasNode = true;
   if (txtStart < this.currPos) //Collect text.
   {
    node.append(this.sliceText(txtStart, this.currPos));
   }
   if (txtStart <= this.currPos) //Break Infinite Loop, Skip past token.
   {
    txtStart = this.shift();
   }
   
   if (token.type === enumLex.CODE || token.type === enumLex.PRE)
   {
    node.append(parseCode.call(this, token));
   }
   else if (token.type === enumLex.LINK_IMG)
   {
    node.append(parseImg.call(this, token));
   }
   else if (!hasBracket && linkAnchors.indexOf(token.type) !== -1)
   {
    node.append(parseLink.call(this, token, fStack));
   }
   else if (fIndex === -1 && isNotAbuse && fmtStartEndMap[token.type])
   {
    fStack.push(fmtStartEndMap[token.type]);
    node.append(parsePara.call(this, fStack, ASTNode.create(fmtASTMap[token.type])));
    fStack.pop();
   }
   else
   {
    hasNode = false;
   }
   
   txtStart = hasNode ? this.currPos : this.currPos - 1;    
   if (fIndex > -1) //Case Format tag end
   {
    endOffset = -1;
    break;
   }
  }
  
  if (txtStart < this.currPos)
  {
   node.append(this.sliceText(txtStart, this.currPos + endOffset));
  }
  
  return node.nodes.length > 0 ? node : null;
 }

 function parseLink(lexTok, fStack)
 {
  var callback = lexTok.type === enumLex.LINK_INT ? untilBracket : untilAngle,
   startPos = this.currPos,
   endPos = this.shiftUntilPast(callback) - 1,
   href = this.sliceText(startPos, endPos).trim();

  if (utils.isBlankString(href))
  {
   return;
  }
  var node = ASTNode.create(fmtASTMap[lexTok.type], {href : href});
  
  this.shiftUntil(untilLinkCont);
  if (this.lookAheadT(enumLex.LINK_CONT))
  {
   this.shift();
   fStack.push(enumLex.BRACKET_R);
   parsePara.call(this, fStack, node);
   fStack.pop();
  }
  return node;
 }

 function parseImg(lexTok)
 {
  var startPos = this.currPos,
   endPos = this.shiftUntilPast(untilAngle) - 1,
   src = this.sliceText(startPos, endPos).trim(),
   alt = "";

  if (utils.isBlankString(src))
  {
   return;
  }
  this.shiftUntil(untilLinkCont);
  
  if (this.lookAheadT(enumLex.LINK_CONT))
  {
   alt = this.sliceText(this.shift(), this.shiftUntilPast(untilBracket) - 1);
  }
  alt = utils.isBlankString(alt) ? src : alt.trim();
  return ASTNode.create(enumAST.LINK_IMG, {src : src, alt : alt});
 }

 function parseCode(lexTok)
 {
  var node = ASTNode.create(enumAST.CODE),
   startPos = this.currPos,
   endPos = this.shiftUntilPast(untilCode, lexTok) - 1,
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
  this.root = parsePara.call(this);
  if (this.root && forceType)
  {
   this.root.type = forceType;
  }
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
