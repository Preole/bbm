module.exports = (function (){
"use strict";

var utils = require("./utils.js"),
Lexer = require("./Lexer.js"),
enumLEX = Lexer.types,
ASTNode = require("./ASTNode.js"),
enumAST = ASTNode.types,
ParserInline = require("./ParserInline.js"),
ParserBase = require("./ParserBase.js"),

EOF = {},
reTailWSNL = /\s$/,
lexBlockSwitch =
{
 TH : parseListPre,
 TD : parseListPre,
 GT : parseListPre,
 DD : parseListPre,
 OL : parseListPre,
 UL : parseListPre,
 DT : parseListPre,
 HR : parseHRTR,
 TRSEP : parseHRTR,
 REF : parseRef,
 ATX : parseATX,
 COMMENT : parsePre,
 PRE : parsePre,
 DIV : parseDiv,
 CLASS : parseLabel,
 ID : parseLabel
},
lexListASTMap =
{
 TH : enumAST.TH,
 TD : enumAST.TD,
 GT : enumAST.BLOCKQUOTE,
 DD : enumAST.DD,
 OL : enumAST.OL_LI,
 UL : enumAST.UL_LI
},
lexListWSNL = [enumLEX.WS, enumLEX.NL],
lexListParaDelim = [enumLEX.HR, enumLEX.ATX_END, enumLEX.DIV],
lexListSetext = [enumLEX.HR, enumLEX.ATX_END],
lexListRefEnd = [enumLEX.NL, enumLEX.REF_END],
lexListATXEnd = [enumLEX.NL, enumLEX.ATX_END];


function untilNotWSNL(token)
{
 return lexListWSNL.indexOf(token.type) === -1;
}

function untilPre(token, tokStart)
{
 return token.type === tokStart.type &&
  token.col === tokStart.col &&
  token.lexeme === tokStart.lexeme &&
  isLineStart.call(this);
}

function untilNL(token)
{
 return token.type === enumLEX.NL;
}

function untilRefEnd(token)
{
 return lexListRefEnd.indexOf(token.type) !== -1;
}

function untilATXEnd(token)
{
 return lexListATXEnd.indexOf(token.type) !== -1;
}

function untilParaEnd(token, minCol)
{
 return isLineStart.call(this) && (
  isLineEnd.call(this) ||
  lexListParaDelim.indexOf(token.type) !== -1 ||
  lexListWSNL.indexOf(token.type) === -1 && token.col < minCol
 );
}

function isLineStart()
{
 var prev1 = this.lookAhead(-1),
  prev2 = this.lookAhead(-2);
  
 return !prev1 || 
  prev1.type === enumLEX.NL || 
  prev1.type === enumLEX.WS && (!prev2 || prev2.type === enumLEX.NL);
}

function isLineEnd()
{
 var now = this.lookAhead(),
  next = this.lookAhead(1);
  
 return !now || 
  now.type === enumLEX.NL ||
  now.type === enumLEX.WS && (!next || next.type === enumLEX.NL);
}

function isDivMatch(start, now)
{
 return start.type === now.type && 
  start.lexeme.length === now.lexeme.length &&
  start.col === now.col && isLineStart.call(this);
}

function accText(tok, index, tokens)
{
 var minCol = this,
  prev = tokens[index - 1];

 if (tok.type === enumLEX.WS && (!prev || prev.type === enumLEX.NL))
 {
  return tok.lexeme.slice(minCol);
 }
 return tok.lexeme;
}

function accTokens(tok, index, tokens)
{
 var minCol = this,
  prev = tokens[index - 1];

 if (tok.type === enumLEX.WS && (!prev || prev.type === enumLEX.NL))
 {
  tok.lexeme = tok.lexeme.slice(minCol);
 }
 return tok.lexeme.length > 0;
}



function parseBlock(ignoreLine)
{
 var tok = this.lookAt(this.shiftUntil(untilNotWSNL)),
  func = tok ? lexBlockSwitch[tok.type] : null,
  isNotAbuse = this.currlvl < (this.options.maxBlocks || 8),
  node = null;
  
 this.currlvl += 1;
 if (func && isNotAbuse && (ignoreLine || isLineStart.call(this)))
 {
  node = func.call(this, tok);
 }
 else if (tok)
 {
  node = parsePara.call(this, tok);
 }
 this.currlvl -= 1;
 return node;
}

function parseListPre(lexTok)
{
 this.shift();
 if (isLineEnd.call(this))
 {
  return;
 }
 this.shiftUntil(untilNotWSNL);
 
 return lexTok.type === enumLEX.DT ? 
  parsePara.call(this, this.lookAhead(), enumAST.DT) : 
  parseList.call(this, lexTok);
}

function parseList(lexTok)
{
 var node = ASTNode.create(lexListASTMap[lexTok.type]),
  col = lexTok.col + lexTok.lexeme.length,
  tok = null;
  
 while ((tok = this.lookAhead()) && tok.col >= col)
 {
  node.append(parseBlock.call(this, true));
  this.shiftUntil(untilNotWSNL);
 }
 return node;
}

function parseHRTR(lexTok)
{
 this.shiftUntilPast(untilNL);
 return ASTNode.create(lexTok.type === enumLEX.HR ? enumAST.HR : enumAST.TRSEP);
}

function parseDiv(lexTok)
{
 var node = ASTNode.create(enumAST.DIV),
  col = lexTok.col,
  tok = null;

 this.shift();
 while ((tok = this.lookAhead()) && tok.col >= col)
 {
  if (isDivMatch.call(this, lexTok, tok))
  {
   this.shiftUntilPast(untilNL);
   break;
  }
  node.append(parseBlock.call(this));
  this.shiftUntil(untilNotWSNL);
 }
 return node;
}

function parsePre(lexTok)
{
 var startPos = this.shiftUntilPast(untilNL),
  endPos = this.shiftUntilPast(untilPre, lexTok) - 1,
  text = lexTok.type === enumLEX.PRE ? this.slice(startPos, endPos)
   .map(accText, lexTok.col)
   .join("")
   .replace(reTailWSNL, "") : "";

 if (text.length > 0)
 {
  return ASTNode.create(enumAST.PRE).append(text);
 }
}

function parseATX(lexTok)
{
 var hLen = lexTok.lexeme.length,
  startPos = this.shift(),
  endPos = this.shiftUntilPast(untilATXEnd) - 1,
  text = this.sliceText(startPos, endPos).trim();

 if (!utils.isBlankString(text))
 {
  var node = ASTNode.create(enumAST.HEADER);
  node.level = hLen;
  node.append(text);
  return node;
 }
}

function parseLabel(lexTok)
{
 var nodeType = lexTok.type === enumLEX.ID ? enumAST.ID : enumAST.CLASS,
  startPos = this.currPos + 1,
  endPos = this.shiftUntilPast(untilNL) - 1,
  idClass = this.sliceText(startPos, endPos).trim();
  
 if (idClass.length <= 0)
 {
  return;
 }
 
 var node = ASTNode.create(nodeType);
 if (nodeType === enumAST.ID)
 {
  node.attr.id = idClass;
 }
 else
 {
  node.attr["class"] = idClass;
 }
 return node;
}

function parseRef(lexTok)
{
 var id = this.sliceText(this.shift(), this.shiftUntil(untilRefEnd)).trim(),
  url = this.sliceText(this.currPos + 1, this.shiftUntil(untilNL)).trim();

 if (url.length > 0 && id.length > 0)
 {
  this.root.refTable[id] = url;
 }
}

function parsePara(lexTok, forceType)
{
 if (!lexTok)
 {
  return;
 }

 var startPos = this.currPos,
  endPos = this.shiftUntil(untilParaEnd, lexTok.col),
  endTok = this.lookAhead() || EOF;
  
 if (startPos >= endPos || lexListWSNL.indexOf(endTok.type) !== -1)
 {
  this.shift();
 }
 if (startPos >= endPos)
 {
  return;
 }
 
 var paraToks = this.slice(startPos, endPos).filter(accTokens, lexTok.col),
  node = ParserInline(paraToks, this.options);
  
 if (node && forceType)
 {
  node.type = forceType;
 }
 else if (node && lexListSetext.indexOf(endTok.type) !== -1)
 {
  node.type = enumAST.HEADER;
  node.level = endTok.type === enumLEX.HR ? 2 : 1;
 }
 
 return node;
}


function ParseBlock(bbmStr, options)
{
 var parser = ParserBase.create(Lexer(bbmStr, options.disallowed), options);
 parser.root = ASTNode.create(enumAST.ROOT);
 parser.root.refTable = {};
 while (parser.lookAhead())
 {
  parser.root.append(parseBlock.call(parser));
 }
 return parser.root;
}

return ParseBlock;
}());


