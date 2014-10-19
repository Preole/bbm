(function (){
"use strict";


var BBM = require("./BBM.js");
var Lexer = require("./_BBM.Lexer.js");
var LEX = Lexer.ENUM;
var AST = BBM.ENUM;
var LINKS = [LEX.LINK_INT, LEX.LINK_WIKI, LEX.LINK_EXT];
var EOF = {};
var fmtASTMap =
{
  LINK_INT : AST.LINK_INT
, LINK_EXT : AST.LINK_EXT
, LINK_IMG : AST.LINK_IMG
, LINK_WIKI : AST.LINK_WIKI
, INS : AST.INS
, DEL : AST.DEL
, INS_END : AST.INS
, DEL_END : AST.DEL
, BOLD : AST.BOLD
, EM : AST.EM
, SUP : AST.SUP
, SUB : AST.SUB
, UNDER : AST.U
, CODE : AST.CODE
, PRE : AST.CODE
};

var fmtEndMap =
{
  INS : LEX.INS_END
, DEL : LEX.DEL_END
, BOLD : LEX.BOLD
, EM : LEX.EM
, SUP : LEX.SUP
, SUB : LEX.SUB
, UNDER : LEX.UNDER
};



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
 return tok.type === LEX.BRACKET_R || BBM.get(fmtASTMap, tok.type);
}

//TODO: Scrutiny on nesting abuse. What's the ideal behaviour?
function parsePara(lexer, stack, node)
{
 var isAbuse = stack.length >= (Number(lexer.options.maxSpans) || 8);
 var hasLink = stack.indexOf(LEX.BRACKET_R) > -1;
 
 while (lexer.pos < lexer.mark)
 {
  var tok = lexer.peekUntil(isInline) || EOF;
  var fIndex = stack.indexOf(tok.type);
  
  node.append(lexer.sliceText(lexer.next() - 1, lexer.pos));
  if (tok.type === LEX.CODE || tok.type === LEX.PRE)
  {
   node.append(parseCode(lexer, tok));
  }
  else if (tok.type === LEX.LINK_IMG)
  {
   node.append(parseImg(lexer, tok));
  }
  else if (!hasLink && LINKS.indexOf(tok.type) > -1)
  {
   node.append(parseLink(lexer, tok, stack));
  }
  else if (!isAbuse && fIndex === -1 && fmtEndMap[tok.type])
  {
   stack.push(fmtEndMap[tok.type]);
   node.append(parsePara(lexer, stack, BBM(fmtASTMap[tok.type])));
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
 var href = lexer.sliceText(lexer.pos, lexer.nextPast(callback) - 1).trim();

 if (BBM.isBlankString(href))
 {
  return;
 }
 
 var node = BBM(fmtASTMap[lexTok.type]).attr({href : href});
 lexer.nextUntil(isCont);
 if (lexer.peekT(LEX.LINK_CONT))
 {
  lexer.next();
  stack.push(LEX.BRACKET_R);
  parsePara(lexer, stack, node);
  stack.pop();
 }
 return node;
}

function parseImg(lexer)
{
 var src = lexer.sliceText(lexer.pos, lexer.nextPast(isAngle) - 1).trim();
 var alt = src;
 if (BBM.isBlankString(src))
 {
  return;
 }
 
 lexer.nextUntil(isCont);
 if (lexer.peekT(LEX.LINK_CONT))
 {
  alt = lexer.sliceText(lexer.next(), lexer.nextPast(isBracket) - 1).trim();
  alt = alt.length > 0 ? alt : src;
 }
 return BBM(AST.LINK_IMG).attr({src : src, alt : alt});
}

function parseCode(lexer, lexTok)
{
 var startPos = lexer.pos, endPos = lexer.nextPast(isCode, lexTok) - 1;
 return BBM(AST.CODE).append(lexer.sliceText(startPos, endPos));
}

function ParserInline(bbmStr, options)
{
 var lexer = Lexer.isLexer(bbmStr) ? bbmStr : Lexer(bbmStr, options);
 return parsePara(lexer, [], BBM(AST.P));
}



module.exports = BBM.parseInline = ParserInline;
BBM.fn.parseInline = function (bbmStr, options)
{
 return this.empty().append(ParserInline(bbmStr, options));
};

}());
