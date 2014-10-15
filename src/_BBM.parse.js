(function (){
"use strict";



var BBM = require("./BBM.js"),
Lexer = require("./_BBM.Lexer.js"),
parseInline = require("./BBM.parseInline.js"),
LEX = Lexer.ENUM,
AST = BBM.ENUM,
EOF = {};

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
lexWSNL = [LEX.WS, LEX.NL],
lexParaDelim = [LEX.HR, LEX.ATX_END, LEX.DIV],
lexSetext = [LEX.HR, LEX.ATX_END],
lexRefEnd = [LEX.NL, LEX.REF_END],
lexATXEnd = [LEX.NL, LEX.ATX_END];


function untilNotWSNL(token)
{
 return lexWSNL.indexOf(token.type) === -1;
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
 return lexRefEnd.indexOf(token.type) !== -1;
}

function untilATXEnd(token)
{
 return lexATXEnd.indexOf(token.type) !== -1;
}

function untilParaEnd(token, minCol)
{
 return this.isLineStart() && (
  this.isLineEnd() ||
  lexParaDelim.indexOf(token.type) !== -1 ||
  lexWSNL.indexOf(token.type) === -1 && token.col < minCol
 );
}



function parseBlock()
{
 var tok = this.peekUntil(untilNotWSNL),
  func = tok ? lexMapBlock[tok.type] : null,
  isNotAbuse = this.currlvl < (Number(this.options.maxBlocks) || 8),
  node = null;
  
 this.currlvl += 1;
 if (func && isNotAbuse)
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
 this.next();
 if (this.isLineEnd())
 {
  return;
 }
 this.nextUntil(untilNotWSNL);
 
 return lexTok.type === LEX.DT ? 
  parsePara.call(this, (this.peek() || EOF), AST._DT) : 
  parseList.call(this, lexTok);
}

function parseList(lexTok)
{
 var node = BBM(lexMapList[lexTok.type]),
  col = lexTok.col + lexTok.lexeme.length,
  tok = null;
  
 while ((tok = this.peekUntil(untilNotWSNL)) && tok.col >= col)
 {
  node.append(parseBlock.call(this));
 }
 return node;
}

function parseHRTR(lexTok)
{
 this.nextUntilPast(untilNL);
 return BBM(lexTok.type === LEX.HR ? AST.HR : AST._TR);
}

function parseDiv(lexTok)
{
 var node = BBM(AST.DIV),
  col = lexTok.col,
  tok = null;

 this.nextUntilPast(untilNL);
 while ((tok = this.peekUntil(untilNotWSNL)) && tok.col >= col)
 {
  if (this.isMatchDelim(lexTok))
  {
   break;
  }
  node.append(parseBlock.call(this));
 }
 this.nextUntilPast(untilNL);
 return node;
}

function parsePre(lexTok)
{
 var startPos = this.nextUntilPast(untilNL),
  endPos = this.nextUntilPast(untilPre, lexTok) - 1,
  text = BBM.rmNLTail(this.sliceText(startPos, endPos, lexTok.col));

 if (lexTok.type === LEX.PRE && text.length > 0)
 {
  return BBM(AST.PRE).append(text);
 }
 return BBM(AST.COMMENT).append(text);
}

function parseATX(lexTok)
{
 var hLen = lexTok.lexeme.length,
  startPos = this.next(),
  endPos = this.nextUntilPast(untilATXEnd) - 1,
  text = this.sliceText(startPos, endPos).trim();

 if (!BBM.isBlankString(text))
 {
  var node = BBM(AST.HEADER).append(text);
  node.level = hLen;
  node.offset = 0;
  return node;
 }
}

function parseLabel(lexTok)
{
 var nodeType = lexTok.type === LEX.ID ? AST._ID : AST._CLASS,
  startPos = this.currPos + 1,
  endPos = this.nextUntilPast(untilNL) - 1,
  idClass = this.sliceText(startPos, endPos).trim();
  
 if (idClass.length <= 0)
 {
  return;
 }
 
 var node = BBM(nodeType);
 if (nodeType === AST._ID)
 {
  node.attr("id", idClass);
 }
 else
 {
  node.attr("class", idClass);
 }
 return node;
}

function parseRef(lexTok)
{
 var id = this.sliceText(this.next(), this.nextUntil(untilRefEnd)).trim(),
  url = this.sliceText(this.currPos + 1, this.nextUntil(untilNL)).trim();

 if (url.length > 0 && id.length > 0)
 {
  this.root.refTable[id] = url;
 }
}


function parsePara(lexTok, forceType)
{
 var minCol = Number(BBM.isObject(lexTok) ? lexTok.col : 0) || 0,
  startPos = this.currPos,
  endPos = this.nextUntil(untilParaEnd, minCol),
  endTok = this.peek() || EOF;
  
 if (startPos >= endPos || lexWSNL.indexOf(endTok.type) !== -1)
 {
  this.next();
 }
 if (startPos >= endPos)
 {
  return;
 }

 var node = BBM.parseInline(this.slice(startPos, endPos, minCol));
 if (forceType)
 {
  node.type(forceType);
 }
 else if (lexSetext.indexOf(endTok.type) !== -1)
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
  lexer.root.append(parseBlock.call(lexer));
 }
 return lexer.root;
}

module.exports = BBM.parse = Parser;
BBM.fn.parse = function (bbmStr, options)
{
 return this.empty()_.append(Parser(bbmStr, options));
};


}());