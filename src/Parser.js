(function (){
"use strict";

var utils = require("./utils.js"),
Lexer = require("./Lexer.js"),
LEX = Lexer.ENUM,
ASTNode = require("./ASTNode.js"),
AST = ASTNode.ENUM,
ParserInline = require("./ParserInline.js"),
ParserBase = require("./ParserBase.js"),
Analyzer = require("./Analyzer.js"),

EOF = {},
lexMapBlock =
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
 TH : AST.TH_TMP,
 TD : AST.TD_TMP,
 GT : AST.BLOCKQUOTE,
 DT : AST.DT,
 DD : AST.DD,
 OL : AST.OL_LI,
 UL : AST.UL_LI
},
lexListWSNL = [LEX.WS, LEX.NL],
lexListParaDelim = [LEX.HR, LEX.ATX_END, LEX.DIV],
lexListSetext = [LEX.HR, LEX.ATX_END],
lexListRefEnd = [LEX.NL, LEX.REF_END],
lexListATXEnd = [LEX.NL, LEX.ATX_END];


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
 return token.type === LEX.NL;
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
 var prev1 = this.peek(-1),
  prev2 = this.peek(-2);
  
 return !prev1 || 
  prev1.type === LEX.NL || 
  prev1.type === LEX.WS && (!prev2 || prev2.type === LEX.NL);
}

function isLineEnd()
{
 var now = this.peek(),
  next = this.peek(1);
  
 return !now || 
  now.type === LEX.NL ||
  now.type === LEX.WS && (!next || next.type === LEX.NL);
}

function isDivMatch(start, now)
{
 return start.type === now.type && 
  start.lexeme.length === now.lexeme.length &&
  start.col === now.col && isLineStart.call(this);
}

function popUntil(tokens)
{
 var token = null;
 while (token = tokens.pop())
 {
  if (untilNotWSNL(token))
  {
   tokens.push(token);
   break;
  }
 }
 return tokens;
}



function parseBlock(ignoreLine)
{
 var tok = this.peekAt(this.shiftUntil(untilNotWSNL)),
  func = tok ? lexMapBlock[tok.type] : null,
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
 
 return lexTok.type === LEX.DT ? 
  parsePara.call(this, this.peek(), AST.DT) : 
  parseList.call(this, lexTok);
}

function parseList(lexTok)
{
 var node = ASTNode(lexListASTMap[lexTok.type]),
  col = lexTok.col + lexTok.lexeme.length,
  tok = null;
  
 while ((tok = this.peekAt(this.shiftUntil(untilNotWSNL))) && tok.col >= col)
 {
  node.append(parseBlock.call(this, true));
 }
 return node;
}

function parseHRTR(lexTok)
{
 this.shiftUntilPast(untilNL);
 return ASTNode(lexTok.type === LEX.HR ? AST.HR : AST.TR_TMP);
}

function parseDiv(lexTok)
{
 var node = ASTNode(AST.DIV),
  col = lexTok.col,
  tok = null;

 this.shiftUntilPast(untilNL);
 while ((tok = this.peekAt(this.shiftUntil(untilNotWSNL))) && tok.col >= col)
 {
  if (isDivMatch.call(this, lexTok, tok))
  {
   break;
  }
  node.append(parseBlock.call(this));
 }
 this.shiftUntilPast(untilNL);
 return node;
}

function parsePre(lexTok)
{
 var startPos = this.shiftUntilPast(untilNL),
  endPos = this.shiftUntilPast(untilPre, lexTok) - 1,
  text = utils.rmNLTail(this.sliceText(startPos, endPos, lexTok.col));

 if (lexTok.type === LEX.PRE && text.length > 0)
 {
  return ASTNode(AST.PRE).append(text);
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
  var node = ASTNode(AST.HEADER);
  node.level = hLen;
  node.append(text);
  return node;
 }
}

function parseLabel(lexTok)
{
 var nodeType = lexTok.type === LEX.ID ? AST.ID : AST.CLASS,
  startPos = this.currPos + 1,
  endPos = this.shiftUntilPast(untilNL) - 1,
  idClass = this.sliceText(startPos, endPos).trim();
  
 if (idClass.length <= 0)
 {
  return;
 }
 
 var node = ASTNode(nodeType);
 if (nodeType === AST.ID)
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
  endTok = this.peek() || EOF;
  
 if (startPos >= endPos || lexListWSNL.indexOf(endTok.type) !== -1)
 {
  this.shift();
 }
 if (startPos >= endPos)
 {
  return;
 }
 
 var paraToks = popUntil(this.slice(startPos, endPos, lexTok.col)),
  node = ParserInline(paraToks, this.options);
  
 if (node && forceType)
 {
  node.type = forceType;
 }
 else if (node && lexListSetext.indexOf(endTok.type) !== -1)
 {
  node.type = AST.HEADER;
  node.level = endTok.type === LEX.HR ? 2 : 1;
 }
 
 return node;
}


function Parser(bbmStr, options)
{
 var parser = ParserBase(Lexer(bbmStr, options.disallowed), options);
 parser.root = ASTNode(AST.ROOT);
 parser.root.refTable = {};
 parser.root.options = parser.options;
 while (parser.peek())
 {
  parser.root.append(parseBlock.call(parser));
 }
 return Analyzer(parser.root);
}


module.exports = Parser;
}());


