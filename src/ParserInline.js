(function (){
"use strict";

var utils = require("./utils.js"),
LEX = require("./Lexer.js").ENUM,
ASTNode = require("./ASTNode.js"),
AST = require("./ASTNode.js").ENUM,
ParserBase = require("./ParserBase.js"),

linkCont = [LEX.WS, LEX.NL, LEX.LINK_CONT],
linksLex = [LEX.LINK_INT, LEX.LINK_WIKI, LEX.LINK_EXT],
fmtASTMap =
{
 LINK_INT : AST.LINK_INT,
 LINK_EXT : AST.LINK_EXT,
 LINK_IMG : AST.LINK_IMG,
 LINK_WIKI : AST.LINK_WIKI,
 INS : AST.INS,
 DEL : AST.DEL,
 INS_END : AST.INS,
 DEL_END : AST.DEL,
 BOLD : AST.BOLD,
 EM : AST.EM,
 SUP : AST.SUP,
 SUB : AST.SUB,
 UNDER : AST.U,
 CODE : AST.CODE,
 PRE : AST.CODE
},

fmtStartEndMap =
{
 INS : LEX.INS_END,
 DEL : LEX.DEL_END,
 BOLD : LEX.BOLD,
 EM : LEX.EM,
 SUP : LEX.SUP,
 SUB : LEX.SUB,
 UNDER : LEX.UNDER
};

 
function untilCode(tok, tokStart)
{
 return (tok.type === LEX.CODE || tok.type === LEX.PRE) &&
  (tokStart.type === LEX.CODE || tokStart.type === LEX.PRE) &&
  tok.lexeme === tokStart.lexeme;
}

function untilBracket(tok)
{
 return tok.type === LEX.BRACKET_R;
}

function untilAngle(tok)
{
 return tok.type === LEX.GT;
}

function untilLinkCont(tok)
{
 return tok.type === LEX.LINK_CONT || 
  tok.type !== LEX.WS ||
  tok.type !== LEX.NL;
}

function untilInline(tok)
{
 return tok.type === LEX.BRACKET_R || fmtASTMap[tok.type]; 
}

function parsePara(fStack, premade)
{
 var node = premade || ASTNode(AST.P),
  isNotAbuse = fStack.length < (this.options.maxSpans || 8),
  txtStart = this.currPos,
  hasBracket = fStack.indexOf(LEX.BRACKET_R) > -1,
  fIndex = -1,
  tok = null;
  
 while ((tok = this.peekAt(this.shiftUntil(untilInline))))
 {
  fIndex = fStack.indexOf(tok.type);
  if (txtStart < this.currPos) //Collect text.
  {
   node.append(this.sliceText(txtStart, this.currPos));
  }
  if (txtStart <= this.currPos) //Break Infinite Loop, Skip past token.
  {
   txtStart = this.shift();
  }
  
  if (tok.type === LEX.CODE || tok.type === LEX.PRE)
  {
   node.append(parseCode.call(this, tok));
  }
  else if (tok.type === LEX.LINK_IMG)
  {
   node.append(parseImg.call(this, tok));
  }
  else if (!hasBracket && linksLex.indexOf(tok.type) !== -1)
  {
   node.append(parseLink.call(this, tok, fStack));
  }
  else if (fIndex === -1 && isNotAbuse && fmtStartEndMap[tok.type])
  {
   fStack.push(fmtStartEndMap[tok.type]);
   node.append(parsePara.call(this, fStack, ASTNode(fmtASTMap[tok.type])));
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
 var callback = lexTok.type === LEX.LINK_INT ? untilBracket : untilAngle,
  startPos = this.currPos,
  endPos = this.shiftUntilPast(callback) - 1,
  href = this.sliceText(startPos, endPos).trim();

 if (utils.isBlankString(href))
 {
  return;
 }
 var node = ASTNode(fmtASTMap[lexTok.type], {href : href});
 
 this.shiftUntil(untilLinkCont);
 if (this.peekT(LEX.LINK_CONT))
 {
  this.shift();
  fStack.push(LEX.BRACKET_R);
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
  alt = src;

 if (utils.isBlankString(src))
 {
  return;
 }
 this.shiftUntil(untilLinkCont);
 
 if (this.peekT(LEX.LINK_CONT))
 {
  alt = this.sliceText(this.shift(), this.shiftUntilPast(untilBracket) - 1);
 }
 return ASTNode(AST.LINK_IMG, {src : src, alt : alt.trim()});
}

function parseCode(lexTok)
{
 var node = ASTNode(AST.CODE),
  startPos = this.currPos,
  endPos = this.shiftUntilPast(untilCode, lexTok) - 1;

 return node.append(this.sliceText(startPos, endPos));
}

function ParseInline(bbmTokens, options)
{
 return parsePara.call(ParserBase(bbmTokens, options), []);
}



module.exports = ParseInline;
}());
