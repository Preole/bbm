(function (){
"use strict";

var BBM = require("./BBM.js");
var Lexer = require("./BBM.Lexer.js");
var parseInline = require("./BBM.parseInline.js");
var LEX = Lexer.ENUM;
var AST = BBM.ENUM;
var EOF = {};
var LEX_DELIM = [LEX.HR, LEX.ATX_END, LEX.DIV];
var LEX_SETEXT = [LEX.HR, LEX.ATX_END];
var LEX_BLOCK =
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

var LEX_LIST =
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
  || LEX_DELIM.indexOf(tok.type) > -1
  || (notWSNL(tok) && tok.col < minCol)
 );
}



function parseBlock(lexer)
{
 var tok = (lexer.peekUntil(notWSNL) || EOF);
 var isNotAbuse = lexer.lvl < (Number(lexer.options.maxBlocks) || 8);
 var node = null;
 var func = LEX_LIST[tok.type]
 ? parseListPre
 : LEX_BLOCK[tok.type]
 ? LEX_BLOCK[tok.type]
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
 var node = BBM(LEX_LIST[lexTok.type]);
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
  if (lexer.isDelim(tok, lexTok))
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
 var text = lexer.nextPast(isNL).textPast(lexer.isDelim, lexTok, lexTok.col);
 text = BBM.rmNLTail(text);
 if (lexTok.type === LEX.PRE)
 {
  return BBM(AST.PRE).append(text);
 }
 return BBM(AST.COMMENT).append(text);
}

function parseATX(lexer, lexTok)
{
 var text = lexer.next().textPast(isATXEnd).trim();
 if (text.length > 0)
 {
  var node = BBM(AST.HEADER).append(text);
  node.level = lexTok.lexeme.length;
  node.offset = 0;
  return node;
 }
}

function parseLabel(lexer, lexTok)
{
 var idClass = lexer.next().textPast(isNL).trim();
 var isID = lexTok.type === LEX.ID;
 if (idClass.length > 0)
 { 
  return BBM(isID ? AST._ID : AST._CLASS).attr(isID ? "id" : "class", idClass);
 }
}

function parseRef(lexer)
{
 var id = lexer.next().textPast(isRefEnd).trim();
 var url = lexer.peekT(LEX.NL, -1) ? "" : lexer.textUntil(isNL).trim();
 if (url.length > 0 && id.length > 0)
 {
  lexer.root.refTable[id] = url;
 }
}


function parsePara(lexer, lexTok, forceType)
{
 var minCol = lexTok.col || 0;
 var startPos = lexer.pos;
 var endPos = lexer.nextUntil(isParaEnd, minCol).pos;
 var endTok = lexer.peek() || EOF;
 var node = null;
 
 lexer.minCol = minCol;
 lexer.pos = startPos;
 lexer.mark = lexer.next(-2).nextUntil(isNL).pos;
 
 node = parseInline(lexer);
 if (forceType)
 {
  node.type(forceType);
 }
 else if (LEX_SETEXT.indexOf(endTok.type) > -1)
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