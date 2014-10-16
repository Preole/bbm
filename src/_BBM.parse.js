(function (){
"use strict";

var BBM = require("./BBM.js"),
Lexer = require("./_BBM.Lexer.js"),
parseInline = require("./BBM.parseInline.js"),
LEX = Lexer.ENUM,
AST = BBM.ENUM,
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
lexMapList =
{
 TH : AST._TH,
 TD : AST._TD,
 GT : AST.BLOCKQUOTE,
 DT : AST._DT,
 DD : AST._DD,
 OL : AST._LI_OL,
 UL : AST._LI_UL
},
lexParaDelim = [LEX.HR, LEX.ATX_END, LEX.DIV],
lexSetext = [LEX.HR, LEX.ATX_END];

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
 return this.isLineStart() && (
  this.isLineEnd()
  || lexParaDelim.indexOf(tok.type) > -1
  || (notWSNL(tok) && tok.col < minCol)
 );
}




function parseBlock(lexer)
{
 var tok = lexer.peekUntil(notWSNL),
  func = tok ? lexMapBlock[tok.type] : null,
  isNotAbuse = lexer.currlvl < (Number(lexer.options.maxBlocks) || 8),
  node = null;
  
 lexer.currlvl += 1;
 if (func && isNotAbuse)
 {
  node = func(lexer, tok);
 }
 else if (tok)
 {
  node = parsePara(lexer, tok);
 }
 lexer.currlvl -= 1;
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
 var node = BBM(lexMapList[lexTok.type]),
  col = lexTok.col + lexTok.lexeme.length,
  tok = null;
  
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
 var node = BBM(AST.DIV),
  col = lexTok.col,
  tok = null;

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
 var startPos = lexer.nextPast(isNL),
  endPos = lexer.nextPast(lexer.isMatchDelim, lexTok) - 1,
  text = BBM.rmNLTail(lexer.sliceText(startPos, endPos, lexTok.col));

 if (lexTok.type === LEX.PRE && text.length > 0)
 {
  return BBM(AST.PRE).append(text);
 }
 return BBM(AST.COMMENT).append(text);
}

function parseATX(lexer, lexTok)
{
 var startPos = lexer.next(),
  endPos = lexer.nextPast(isATXEnd) - 1,
  text = lexer.sliceText(startPos, endPos).trim();

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
 var startPos = lexer.pos + 1,
  endPos = lexer.nextPast(isNL) - 1,
  idClass = lexer.sliceText(startPos, endPos).trim();
  
 if (idClass.length <= 0)
 {
  return;
 }
 
 var node = BBM(lexTok.type === LEX.ID ? AST._ID : AST._CLASS);
 if (node.type() === AST._ID)
 {
  node.attr("id", idClass);
 }
 else
 {
  node.attr("class", idClass);
 }
 return node;
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
 var minCol = lexTok.col || 0,
  startPos = lexer.pos,
  endPos = lexer.nextUntil(isParaEnd, minCol),
  endTok = lexer.peek() || EOF;
  
 if (startPos >= endPos || notWSNL(endTok))
 {
  lexer.next();
 }
 if (startPos >= endPos)
 {
  return;
 }

 var subLexer = lexer.slice(startPos, endPos, minCol).popUntil(notWSNL);
 var node = BBM.parseInline(subLexer);
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
 
 return node;
}



//TODO: Disambiguate parameters; What if I passed in a lexer instead?
function Parser(bbmStr, options)
{
 var lexer = Lexer(bbmStr, options);
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