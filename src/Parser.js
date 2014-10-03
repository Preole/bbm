(function (){
"use strict";

var __ = require("./__.js"),
Lexer = require("./Lexer.js"),
LEX = Lexer.ENUM,
ASTNode = require("./ASTNode.js"),
AST = ASTNode.ENUM,
ParserInline = require("./ParserInline.js"),

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
  this.isLineStart();
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
 return this.isLineStart() && (
  this.isLineEnd() ||
  lexListParaDelim.indexOf(token.type) !== -1 ||
  lexListWSNL.indexOf(token.type) === -1 && token.col < minCol
 );
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
  isNotAbuse = this.currlvl < (Number(this.options.maxBlocks) || 8),
  node = null;
  
 this.currlvl += 1;
 if (func && isNotAbuse && (ignoreLine || this.isLineStart()))
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
 if (this.isLineEnd())
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
  if (this.isMatchDelim(lexTok))
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
  text = __.rmNLTail(this.sliceText(startPos, endPos, lexTok.col));

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

 if (!__.isBlankString(text))
 {
  var node = ASTNode(AST.HEADER).append(text);
  node.level = hLen;
  node.offset = 0;
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
  node.offset = 0;
 }
 
 return node;
}

//TODO: Skip Lexer step: Turn ParserBase into LexTokens.
function Parser(bbmStr, options)
{
 var lexer = Lexer(bbmStr, options);
 lexer.root = ASTNode(AST.ROOT);
 lexer.root.refTable = {};
 while (lexer.peek())
 {
  lexer.root.append(parseBlock.call(lexer));
 }
 return lexer.root;
}

module.exports = Parser;

//TODO: Inject (Expose) Parsing engine into AST and its prototype.
ASTNode.prototype.bbm = function (bbmStr, options)
{
 return this.empty().append(Parser(bbmStr, options));
};

}());

