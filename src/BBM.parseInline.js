(function (){
"use strict";


var BBM = require("./BBM.js");
var Lexer = require("./BBM.Lexer.js");
var LEX = Lexer.ENUM;
var AST = BBM.ENUM;
var LINKS = [LEX.LINK_INT, LEX.LINK_WIKI, LEX.LINK_EXT];
var EOF = {};
var FMT = [LEX.DEL, LEX.BOLD, LEX.EM, LEX.SUP, LEX.SUB, LEX.UNDER];
var AST_MAP =
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
 return tok.type === LEX.BRACKET_R || !!AST_MAP[tok.type];
}


function parsePara(lexer, stack, node)
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
  else if (!hasLink && LINKS.indexOf(tok.type) > -1)
  {
   node.append(parseLink(lexer, tok, stack));
  }
  else if (stack.indexOf(tok.type) === -1 && FMT.indexOf(tok.type) > -1)
  {
   stack.push(tok.type);
   node.append(parsePara(lexer, stack, BBM(AST_MAP[tok.type])));
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

 if (href.length > 0)
 {
  return;
 }
 
 var node = BBM(AST_MAP[lexTok.type]).attr({href : href});
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
 var src = lexer.textPast(callback).trim();
 var alt = src;
 if (src.length > 0)
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
