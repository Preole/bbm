
"use strict";

var BBM = module.exports = require("./BBM.fn.prune.js");
var __ = require("./__.js");
var Lexer = require("./Lexer.js");
var LEX = Lexer.ENUM;
var AST = BBM.ENUM;
var EOF = {};
var LEX_FMT =
{
  DEL : 1
, BOLD : 1
, EM : 1
, SUP : 1
, SUB : 1
, UNDER : 1
};

var LEX_LINKS =
{
  LINK_INT : 1
, LINK_WIKI : 1
, LINK_EXT : 1
};

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




// Block-level iterators
// ---------------------

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

function isParaEnd(tok, lexer)
{
 return lexer.isLineStart() &&
 (
  lexer.isLineEnd()
  || isDelim(tok)
  || (notWSNL(tok) && tok.col < lexer.minCol)
 );
}

function isSetext(tok)
{
 return tok.type === LEX.ATX_END || tok.type === LEX.HR;
}

function isDelim(tok)
{
 return isSetext(tok) || tok.type === LEX.DIV;
}



// Inline-level Iterators
// ----------------------

function isCodeEnd(tok, tokStart)
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
 return tok.type === LEX.LINK_CONT || notWSNL(tok);
}

function isInline(tok, hasLink)
{
 return (hasLink && tok.type === LEX.BRACKET_R) || !!LEX_INLINE[tok.type];
}



// Block-level Grammar
// -------------------

function parseBlock(lexer)
{
 var tok = lexer.peekUntil(notWSNL) || EOF;
 var node = null;
 var func = LEX_LIST[tok.type] ? parseListPre : LEX_BLOCK[tok.type];

 lexer.lvl += 1;
 if (func && lexer.lvl <= lexer.maxDepth)
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
  return BBM(LEX_LIST[lexTok.type]);
 }
 lexer.nextUntil(notWSNL);
 
 return lexTok.type === LEX.DT
 ? parsePara(lexer, lexer.peek() || EOF, AST._DT)
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
  if (lexer.isDelim(tok, lexTok) && lexer.nextPast(isNL))
  {
   break;
  }
  node.append(parseBlock(lexer));
 }
 return node;
}

function parsePre(lexer, lexTok)
{
 var text = __.rmNLTail(
  lexer.nextPast(isNL).textPast(lexer.isDelim, lexTok, lexTok.col)
 );
 
 if (lexTok.type === LEX.PRE)
 {
  return BBM(AST.PRE).append(text);
 }
 return BBM(AST.COMMENT).append(text);
}

function parseATX(lexer, lexTok)
{
 var startPos = lexer.next().peekT(LEX.WS) ? lexer.next().pos : lexer.pos;
 var endPos = lexer.nextUntil(isATXEnd).pos;
 var node = BBM(AST.HEADER);
 
 node.level = lexTok.lexeme.length;
 
 lexer.mark = lexer.peekT(LEX.WS, -1) ? endPos - 1 : endPos;
 lexer.pos = startPos;
 parseInline(lexer, node);
 lexer.mark = -1;
 lexer.pos = endPos + 1;
 
 return node;
}

function parseLabel(lexer, lexTok)
{
 var idClass = __.rmCTRL(lexer.next().textPast(isNL)).trim();
 var isID = lexTok.type === LEX.ID;
 if (idClass)
 { 
  return BBM(isID ? AST._ID : AST._CLASS).attr(isID ? "id" : "class", idClass);
 }
}

function parseRef(lexer)
{
 var id = lexer.next().textPast(isRefEnd).trim();
 var url = lexer.peekT(LEX.NL, -1) ? "" : lexer.textUntil(isNL).trim();
 if (url && id)
 {
  lexer.root.symTable[id] = url;
 }
}

function parsePara(lexer, lexTok, forceType)
{
 lexer.minCol = lexTok.col || 0;
 
 var startPos = lexer.pos;
 var endPos = lexer.nextUntil(isParaEnd, lexer).pos;
 var endTok = lexer.peek() || EOF;
 var node = BBM(AST.P);
 
 lexer.mark = lexer.next(-2).nextUntil(isNL).pos;
 lexer.pos = startPos;
 
 parseInline(lexer, node);
 if (forceType)
 {
  node.type(forceType);
 }
 else if (isSetext(endTok))
 {
  node.type(AST.HEADER);
  node.level = endTok.type === LEX.HR ? 2 : 1;
 }
 
 lexer.mark = -1;
 lexer.pos = (endPos <= startPos || isSetext(endTok)) ? endPos + 1 : endPos;
 return node;
}



// Inline-Level Grammar
// --------------------

function parseInline(lexer, node)
{
 var hasLink = lexer.stack.indexOf(LEX.BRACKET_R) > -1;
 while (lexer.pos < lexer.mark)
 {
  var text = lexer.textUntil(isInline, hasLink);
  var tok = lexer.next().peek(-1) || EOF;
  node.append(text);
  
  if (tok.type === LEX.CODE || tok.type === LEX.PRE)
  {
   node.append(parseCode(lexer, tok));
  }
  else if (tok.type === LEX.LINK_IMG)
  {
   node.append(parseImg(lexer, tok));
  }
  else if (LEX_LINKS[tok.type])
  {
   node.append(hasLink ? tok.lexeme : parseLink(lexer, tok));
  }
  else if (lexer.stack.indexOf(tok.type) === -1 && LEX_FMT[tok.type])
  {
   lexer.stack.push(tok.type);
   node.append(parseInline(lexer, BBM(LEX_INLINE[tok.type])));
   lexer.stack.pop();
  }
  else
  {
   break;
  }
 }
 return node;
}

function parseLink(lexer, lexTok)
{
 var callback = lexTok.type === LEX.LINK_INT ? isBracket : isAngle;
 var href = __.rmCTRL(lexer.textPast(callback)).trim();
 if (href)
 {
  var node = BBM(LEX_INLINE[lexTok.type]).attr({href : href});
  var prevPos = lexer.pos;
  if (lexer.nextUntil(isCont).peekT(LEX.LINK_CONT))
  {
   lexer.stack.push(LEX.BRACKET_R);
   parseInline(lexer.next(), node);
   lexer.stack.pop();
  }
  else
  {
   lexer.pos = prevPos;
  }
  return node;
 }
}

function parseImg(lexer)
{
 var src = __.rmCTRL(lexer.textPast(isAngle)).trim();
 if (src)
 {
  var alt = "";
  var prevPos = lexer.pos;
  if (lexer.nextUntil(isCont).peekT(LEX.LINK_CONT))
  {
   alt = lexer.next().textPast(isBracket).trim();
  }
  else
  {
   lexer.pos = prevPos;
  }
  return BBM(AST.LINK_IMG).attr({src : src, alt : alt});
 }
}

function parseCode(lexer, lexTok)
{
 return BBM(AST.CODE).append(lexer.textPast(isCodeEnd, lexTok));
}




/**
 * Parses a piece of text into its abstract syntax tree representation for
 * further processing and manipulation.
 * 
 * @method parse
 * @static
 * @param {String} bbmStr The text to be parsed, written in BareBonesMarkup.
 * @param {Number} [maxDepth=8] The maximum allowed nesting level. Text 
   blocks exceeding this nesting limit shall be interpreted as paragraphs 
   instead of a block capable of nesting, such as blockquotes and nested 
   bullet lists.
 * @return {BBM} The abstract syntax tree obtained from the parsing run.
   The tree nodes, in addition to their the base instance properties, shall 
   have the following properties for specific types of nodes:
 
   - **HEADER**: (Number) level; The heading level of the node. "1" 
     denotes the most important heading, while "2" and higher are increasingly 
     less important heading, similar to HTML's `<h1>` ... `<h6>` tags.
     
   - **ROOT**: (Object) symTable; A key-value pair mapping between 
     identifiers and URL values used for URL substitution within LINK_INT, 
     LINK_EXT, LINK_WIKI and LINK_IMG elements. These key value pairs are 
     guaranteed to be non-blank (Contains at least one visible character)
 */
BBM.parse = function (bbmStr, maxDepth)
{
 var lexer = Lexer.isLexer(bbmStr) ? bbmStr : Lexer(bbmStr);
 lexer.maxDepth = Math.abs(parseInt(maxDepth, 10) || 8);
 lexer.root = BBM(AST.ROOT);
 lexer.root.symTable = {};
 lexer.stack = [];
 lexer.lvl = 0;
 while (lexer.peek())
 {
  lexer.root.append(parseBlock(lexer));
 }
 return lexer.root.prune();
};

/**
 * Parses a piece of text into its abstract syntax tree representation, 
 * replacing the current node's children list with the parsed syntax tree.
 * 
 * @method parse
 * @param {String} bbmStr The text to be parsed, written in BareBonesMarkup.
 * @param {Number} [maxDepth=8] The maximum allowed nesting level.
 * @return {BBM} The current node with its subtree content replaced.
 * @see BBM.parse
 */
BBM.fn.parse = function (bbmStr, maxDepth)
{
 return this.empty().append(BBM.parse(bbmStr, maxDepth).children());
};

