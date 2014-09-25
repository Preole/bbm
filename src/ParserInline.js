
module.exports = (function (){
"use strict";

var utils = require("./utils.js"),
enumLEX = require("./Lexer.js").types,
ASTNode = require("./ASTNode.js"),
enumAST = ASTNode.types,
ParserBase = require("./ParserBase.js"),

linkCont = [enumLEX.WS, enumLEX.NL, enumLEX.LINK_CONT],
linksLex = [enumLEX.LINK_INT, enumLEX.LINK_WIKI, enumLEX.LINK_EXT],
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
 INS : enumLEX.INS_END,
 DEL : enumLEX.DEL_END,
 BOLD : enumLEX.BOLD,
 EM : enumLEX.EM,
 SUP : enumLEX.SUP,
 SUB : enumLEX.SUB,
 UNDER : enumLEX.UNDER
};

 
function untilCode(token, tokStart)
{
 return (token.type === enumLEX.CODE || token.type === enumLEX.PRE) &&
  (tokStart.type === enumLEX.CODE || tokStart.type === enumLEX.PRE) &&
  token.lexeme === tokStart.lexeme;
}

function untilBracket(token)
{
 return token.type === enumLEX.BRACKET_R;
}

function untilAngle(token)
{
 return token.type === enumLEX.GT;
}

function untilLinkCont(token)
{
 return token.type === enumLEX.LINK_CONT || 
  token.type !== enumLEX.WS ||
  token.type !== enumLEX.NL;
}

function untilInline(token)
{
 return token.type === enumLEX.BRACKET_R || fmtASTMap[token.type]; 
}

function parsePara(fStack, premade)
{
 var node = premade || ASTNode.create(enumAST.P),
  isNotAbuse = fStack.length < (this.options.maxSpans || 8),
  txtStart = this.currPos,
  hasBracket = fStack.indexOf(enumLEX.BRACKET_R) > -1,
  fIndex = -1,
  token = null;
  
 while ((token = this.lookAt(this.shiftUntil(untilInline))))
 {
  fIndex = fStack.indexOf(token.type);
  if (txtStart < this.currPos) //Collect text.
  {
   node.append(this.sliceText(txtStart, this.currPos));
  }
  if (txtStart <= this.currPos) //Break Infinite Loop, Skip past token.
  {
   txtStart = this.shift();
  }
  
  if (token.type === enumLEX.CODE || token.type === enumLEX.PRE)
  {
   node.append(parseCode.call(this, token));
  }
  else if (token.type === enumLEX.LINK_IMG)
  {
   node.append(parseImg.call(this, token));
  }
  else if (!hasBracket && linksLex.indexOf(token.type) !== -1)
  {
   node.append(parseLink.call(this, token, fStack));
  }
  else if (fIndex === -1 && isNotAbuse && fmtStartEndMap[token.type])
  {
   fStack.push(fmtStartEndMap[token.type]);
   node.append(parsePara.call(this, fStack, ASTNode.create(fmtASTMap[token.type])));
   fStack.pop();
  }
  
  txtStart = txtStart === this.currPos ? this.currPos - 1 : this.currPos;
  if (fIndex > -1) //Case Format tag end
  {
   break;
  }
 }
 
 if (txtStart < this.currPos)
 {
  node.append(this.sliceText(txtStart, this.currPos + (fIndex > -1 ? -1 : 0)));
 }
 
 return node;
}

function parseLink(lexTok, fStack)
{
 var callback = lexTok.type === enumLEX.LINK_INT ? untilBracket : untilAngle,
  startPos = this.currPos,
  endPos = this.shiftUntilPast(callback) - 1,
  href = this.sliceText(startPos, endPos).trim();

 if (utils.isBlankString(href))
 {
  return;
 }
 var node = ASTNode.create(fmtASTMap[lexTok.type], {href : href});
 
 this.shiftUntil(untilLinkCont);
 if (this.lookAheadT(enumLEX.LINK_CONT))
 {
  this.shift();
  fStack.push(enumLEX.BRACKET_R);
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
 
 if (this.lookAheadT(enumLEX.LINK_CONT))
 {
  alt = this.sliceText(this.shift(), this.shiftUntilPast(untilBracket) - 1);
 }
 return ASTNode.create(enumAST.LINK_IMG, {src : src, alt : alt.trim()});
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



function ParseInline(bbmTokens, options)
{
 return parsePara.call(ParserBase.create(bbmTokens, options), []);
}

return ParseInline;
}());
