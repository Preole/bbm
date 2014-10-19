(function (){
"use strict";

var BBM = require("./BBM.js");
var Lexer = require("./_BBM.Lexer.js");
var parseInline = require("./BBM.parseInline.js");
var LEX = Lexer.ENUM;
var AST = BBM.ENUM;
var EOF = {};
var lexParaDelim = [LEX.HR, LEX.ATX_END, LEX.DIV];
var lexSetext = [LEX.HR, LEX.ATX_END];
var lexMapBlock =
{
  HR : parseHRTR
, TRSEP : parseHRTR
, REF : parseRef
, ATX : parseATX
, COMMENT : parsePre
, PRE : parsePre
, DIV : parseDiv
, CLASS : parseLabel
, ID : parseLabel
};

var lexMapList =
{
  TH : AST._TH
, TD : AST._TD
, GT : AST.BLOCKQUOTE
, DT : AST._DT
, DD : AST._DD
, OL : AST._LI_OL
, UL : AST._LI_UL
};


function notWSNL(tok)
{
 return tok.type !== LEX.WS && tok.type !== LEX.NL;
}

function isNL(tok)
{
 return tok.type === LEX.NL;
}

function isRefEnd(tok)
{
 return tok.type === LEX.NL || tok.type === LEX.REF_END;
}

function isATXEnd(tok)
{
 return tok.type === LEX.NL || tok.type === LEX.ATX_END;
}

function isParaEnd(tok, minCol)
{
 return this.isLineStart() &&
 (
  this.isLineEnd()
  || lexParaDelim.indexOf(tok.type) > -1
  || (notWSNL(tok) && tok.col < minCol)
 );
}

function isRealParaEnd(tok, endTok)
{
 return tok !== endTok && notWSNL(tok);
}



function parseBlock(lexer)
{
 var tok = (lexer.peekUntil(notWSNL) || EOF);
 var isNotAbuse = lexer.lvl < (Number(lexer.options.maxBlocks) || 8);
 var node = null;
 var func = lexMapList[tok.type]
 ? parseListPre
 : lexMapBlock[tok.type]
 ? lexMapBlock[tok.type]
 : null;

 lexer.lvl += 1;
 if (func && isNotAbuse)
 {
  node = func(lexer, tok);
 }
 else if (tok !== EOF)
 {
  node = parsePara(lexer, tok);
 }
 lexer.lvl -= 1;
 return node;
}

function parseListPre(lexer, lexTok)
{
 lexer.next();
 if (lexer.isLineEnd())
 {
  return;
 }
 lexer.nextUntil(notWSNL);
 
 return lexTok.type === LEX.DT
 ? parsePara(lexer, (lexer.peek() || EOF), AST._DT)
 : parseList(lexer, lexTok);
}

function parseList(lexer, lexTok)
{
 var node = BBM(lexMapList[lexTok.type]);
 var col = lexTok.col + lexTok.lexeme.length;
 var tok = null;
  
 while ((tok = lexer.peekUntil(notWSNL)) && tok.col >= col)
 {
  node.append(parseBlock(lexer));
 }
 return node;
}

function parseHRTR(lexer, lexTok)
{
 lexer.nextPast(isNL);
 return BBM(lexTok.type === LEX.HR ? AST.HR : AST._TR);
}

function parseDiv(lexer, lexTok)
{
 var node = BBM(AST.DIV);
 var col = lexTok.col;
 var tok = null;

 lexer.nextPast(isNL);
 while ((tok = lexer.peekUntil(notWSNL)) && tok.col >= col)
 {
  if (lexer.isMatchDelim(tok, lexTok))
  {
   break;
  }
  node.append(parseBlock(lexer));
 }
 lexer.nextPast(isNL);
 return node;
}

function parsePre(lexer, lexTok)
{
 var startPos = lexer.nextPast(isNL);
 var endPos = lexer.nextPast(lexer.isMatchDelim, lexTok) - 1;
 var text = BBM.rmNLTail(lexer.sliceText(startPos, endPos, lexTok.col));

 if (lexTok.type === LEX.PRE)
 {
  return BBM(AST.PRE).append(text);
 }
 return BBM(AST.COMMENT).append(text);
}

function parseATX(lexer, lexTok)
{
 var startPos = lexer.next();
 var endPos = lexer.nextPast(isATXEnd) - 1;
 var text = lexer.sliceText(startPos, endPos).trim();

 if (!BBM.isBlankString(text))
 {
  var node = BBM(AST.HEADER).append(text);
  node.level = lexTok.lexeme.length;
  node.offset = 0;
  return node;
 }
}

function parseLabel(lexer, lexTok)
{
 var idClass = lexer.sliceText(lexer.pos + 1, lexer.nextPast(isNL)).trim();
 var isID = lexTok.type === LEX.ID;
 if (idClass.length > 0)
 { 
  return BBM(isID ? AST._ID : AST._CLASS).attr(isID ? "id" : "class", idClass);
 }
}

function parseRef(lexer)
{
 var id = lexer.sliceText(lexer.next(), lexer.nextUntil(isRefEnd)).trim();
 var url = lexer.sliceText(lexer.pos + 1, lexer.nextUntil(isNL)).trim();

 if (url.length > 0 && id.length > 0)
 {
  lexer.root.refTable[id] = url;
 }
}


function parsePara(lexer, lexTok, forceType)
{
 var minCol = lexTok.col || 0;
 var startPos = lexer.pos;
 var endPos = lexer.nextUntil(isParaEnd, minCol);
 var endTok = lexer.peek() || EOF;
 var node = null;
 
 lexer.mark = lexer.prevUntil(isRealParaEnd, endTok);
 lexer.minCol = minCol;
 lexer.pos = startPos;
 
 node = parseInline(lexer);
 if (forceType)
 {
  node.type(forceType);
 }
 else if (lexSetext.indexOf(endTok.type) > -1)
 {
  node.type(AST.HEADER);
  node.level = endTok.type === LEX.HR ? 2 : 1;
  node.offset = 0;
 }
 
 lexer.mark = -1;
 lexer.minCol = 0;
 lexer.pos = endPos;

 return node;
}


function Parser(bbmStr, options)
{
 var lexer = Lexer.isLexer(bbmStr) ? bbmStr : Lexer(bbmStr, options);
 lexer.root = BBM(AST.ROOT);
 lexer.root.refTable = {};
 while (lexer.peek())
 {
  lexer.root.append(parseBlock(lexer));
 }
 return lexer.root;
}

module.exports = BBM.parse = Parser;
BBM.fn.parse = function (bbmStr, options)
{
 return this.empty().append(Parser(bbmStr, options));
};


}());