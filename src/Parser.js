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
 TH : AST._TH,
 TD : AST._TD,
 GT : AST.BLOCKQUOTE,
 DT : AST._DT,
 DD : AST._DD,
 OL : AST._LI_OL,
 UL : AST._LI_UL
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



function parseBlock()
{
 var tok = this.peekAt(this.nextUntil(untilNotWSNL)),
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
 var node = ASTNode(lexListASTMap[lexTok.type]),
  col = lexTok.col + lexTok.lexeme.length,
  tok = null;
  
 while ((tok = this.peekAt(this.nextUntil(untilNotWSNL))) && tok.col >= col)
 {
  node.append(parseBlock.call(this));
 }
 return node;
}

function parseHRTR(lexTok)
{
 this.nextUntilPast(untilNL);
 return ASTNode(lexTok.type === LEX.HR ? AST.HR : AST._TR);
}

function parseDiv(lexTok)
{
 var node = ASTNode(AST.DIV),
  col = lexTok.col,
  tok = null;

 this.nextUntilPast(untilNL);
 while ((tok = this.peekAt(this.nextUntil(untilNotWSNL))) && tok.col >= col)
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
  text = __.rmNLTail(this.sliceText(startPos, endPos, lexTok.col));

 if (lexTok.type === LEX.PRE && text.length > 0)
 {
  return ASTNode(AST.PRE).append(text);
 }
}

function parseATX(lexTok)
{
 var hLen = lexTok.lexeme.length,
  startPos = this.next(),
  endPos = this.nextUntilPast(untilATXEnd) - 1,
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
 var nodeType = lexTok.type === LEX.ID ? AST._ID : AST._CLASS,
  startPos = this.currPos + 1,
  endPos = this.nextUntilPast(untilNL) - 1,
  idClass = this.sliceText(startPos, endPos).trim();
  
 if (idClass.length <= 0)
 {
  return;
 }
 
 var node = ASTNode(nodeType);
 if (nodeType === AST._ID)
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
 var id = this.sliceText(this.next(), this.nextUntil(untilRefEnd)).trim(),
  url = this.sliceText(this.currPos + 1, this.nextUntil(untilNL)).trim();

 if (url.length > 0 && id.length > 0)
 {
  this.root.refTable[id] = url;
 }
}


function parsePara(lexTok, forceType)
{
 var minCol = Number(__.isObject(lexTok) ? lexTok.col : 0) || 0,
  startPos = this.currPos,
  endPos = this.nextUntil(untilParaEnd, minCol),
  endTok = this.peek() || EOF;
  
 if (startPos >= endPos || lexListWSNL.indexOf(endTok.type) !== -1)
 {
  this.next();
 }
 if (startPos >= endPos)
 {
  return;
 }

 var node = ParserInline(this.slice(startPos, endPos, minCol));
 if (forceType)
 {
  node.type = forceType;
 }
 else if (lexListSetext.indexOf(endTok.type) !== -1)
 {
  node.type = AST.HEADER;
  node.level = endTok.type === LEX.HR ? 2 : 1;
  node.offset = 0;
 }
 
 return node;
}


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

//TODO: Inject (Expose) Parsing engine into AST and its prototype.
module.exports = Parser;
ASTNode.parse = Parser;
ASTNode.prototype.bbm = function (bbmStr, options)
{
 return this.empty().append(Parser(bbmStr, options));
};

}());

