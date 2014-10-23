(function (){
"use strict";

require("./BBM.fn.pruneList.js");
require("./BBM.fn.pruneBlank.js");
require("./BBM.fn.pruneURL.js");


var BBM = require("./BBM.js");
var Lexer = require("./BBM.Lexer.js");
var LEX = Lexer.ENUM;
var AST = BBM.ENUM;
var EOF = {};
var LEX_DELIM = [LEX.HR, LEX.ATX_END, LEX.DIV];
var LEX_SETEXT = [LEX.HR, LEX.ATX_END];
var LEX_FMT = [LEX.DEL, LEX.BOLD, LEX.EM, LEX.SUP, LEX.SUB, LEX.UNDER];
var LEX_LINKS = [LEX.LINK_INT, LEX.LINK_WIKI, LEX.LINK_EXT];

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

var LEX_INLINE =
{
  LINK_INT : AST.LINK_INT
, LINK_EXT : AST.LINK_EXT
, LINK_IMG : AST.LINK_IMG
, LINK_WIKI : AST.LINK_WIKI
, DEL : AST.DEL
, BOLD : AST.BOLD
, EM : AST.EM
, SUP : AST.SUP
, SUB : AST.SUB
, UNDER : AST.U
, CODE : AST.CODE
, PRE : AST.CODE
};





/*
Block-level iterators
---------------------
*/

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



/*
Inline-level Iterators
----------------------
*/

function isCode(tok, tokStart)
{
 return (tok.type === LEX.CODE || tok.type === LEX.PRE)
 && (tokStart.type === LEX.CODE || tokStart.type === LEX.PRE)
 && tok.lexeme === tokStart.lexeme;
}

function isBracket(tok)
{
 return tok.type === LEX.BRACKET_R;
}

function isAngle(tok)
{
 return tok.type === LEX.GT;
}

function isCont(tok)
{
 return tok.type === LEX.LINK_CONT
 || tok.type !== LEX.WS
 || tok.type !== LEX.NL;
}

function isInline(tok)
{
 return tok.type === LEX.BRACKET_R || !!LEX_INLINE[tok.type];
}



/*
Block-level Grammar
-------------------
*/

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
 var endPos = lexer.nextUntil(isParaEnd, minCol).pos + 1;
 var endTok = lexer.peek() || EOF;
 var node = BBM(AST.P);
 
 lexer.minCol = minCol;
 lexer.mark = lexer.next(-2).nextUntil(isNL).pos;
 lexer.pos = startPos;
 
 parseInline(lexer, [], node);
 if (forceType)
 {
  node.type(forceType);
 }
 else if (LEX_SETEXT.indexOf(endTok.type) > -1)
 {
  node.type(AST.HEADER);
  node.level = endTok.type === LEX.HR ? 2 : 1;
 }
 
 lexer.minCol = 0;
 lexer.mark = -1;
 lexer.pos = endPos;

 return node;
}



/*
Inline-Level Grammar
--------------------
*/

function parseInline(lexer, stack, node)
{
 var hasLink = stack.indexOf(LEX.BRACKET_R) > -1;
 
 while (lexer.pos < lexer.mark)
 {
  var text = lexer.textUntil(isInline);
  var tok = lexer.peek() || EOF;
  
  node.append(text);
  lexer.next();
  if (tok.type === LEX.CODE || tok.type === LEX.PRE)
  {
   node.append(parseCode(lexer, tok));
  }
  else if (tok.type === LEX.LINK_IMG)
  {
   node.append(parseImg(lexer, tok));
  }
  else if (!hasLink && LEX_LINKS.indexOf(tok.type) > -1)
  {
   node.append(parseLink(lexer, tok, stack));
  }
  else if (stack.indexOf(tok.type) === -1 && LEX_FMT.indexOf(tok.type) > -1)
  {
   stack.push(tok.type);
   node.append(parseInline(lexer, stack, BBM(LEX_INLINE[tok.type])));
   stack.pop();
  }
  else
  {
   break;
  }
 }
 return node;
}

function parseLink(lexer, lexTok, stack)
{
 var callback = lexTok.type === LEX.LINK_INT ? isBracket : isAngle;
 var href = lexer.textPast(callback).trim();
 if (href.length === 0)
 {
  return;
 }
 
 var node = BBM(LEX_INLINE[lexTok.type]).attr({href : href});
 lexer.nextUntil(isCont);
 if (lexer.peekT(LEX.LINK_CONT))
 {
  lexer.next();
  stack.push(LEX.BRACKET_R);
  parseInline(lexer, stack, node);
  stack.pop();
 }
 return node;
}

function parseImg(lexer)
{
 var src = lexer.textPast(isAngle).trim();
 var alt = src;
 if (src.length === 0)
 {
  return;
 }
 
 lexer.nextUntil(isCont);
 if (lexer.peekT(LEX.LINK_CONT))
 {
  alt = lexer.next().textPast(isBracket).trim();
  alt = alt.length > 0 ? alt : src;
 }
 return BBM(AST.LINK_IMG).attr({src : src, alt : alt});
}

function parseCode(lexer, lexTok)
{
 return BBM(AST.CODE).append(lexer.textPast(isCode, lexTok));
}




/*
Exporting
---------
*/

function parse(bbmStr, options)
{
 var lexer = Lexer.isLexer(bbmStr) ? bbmStr : Lexer(bbmStr, options);
 lexer.root = BBM(AST.ROOT);
 lexer.root.refTable = {};
 while (lexer.peek())
 {
  lexer.root.append(parseBlock(lexer));
 }
 return lexer.root.pruneList().pruneBlank().pruneURL();
}

module.exports = BBM.parse = parse;
BBM.fn.parse = function (bbmStr, options)
{
 return this.empty().append(parse(bbmStr, options).children());
};


}());