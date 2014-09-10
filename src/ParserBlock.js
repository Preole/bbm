
(function (){
"use strict";

var enumLex = require("./Lexer.js").types,
 ASTNode = require("./ASTNode.js"),
 enumAST = require("./ASTNodeEnum.js"),
 ParserInline = require("./ParserInline.js"),
 ParserBase = require("./ParserBase.js");
 

function ParserBlock(options)
{
 this.inlineParser = ParserInline.create(options);
 this.reset(options);
}

function create(options)
{
 return new ParserBlock(tokens);
}

ParserBlock.create = create;
ParserBlock.prototype = (function (){
 var base = ParserBase.prototype,
 blockSwitch =
 {
  TH : parseList,
  TD : parseList,
  GT : parseList,
  DD : parseList,
  OL : parseList,
  UL : parseList,
  DT : parseList,
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
 blockListASTMap =
 {
  TH : enumAST.TH,
  TD : enumAST.TD,
  GT : enumAST.BLOCKQUOTE,
  DD : enumAST.DD,
  DT : enumAST.DT,
  OL : enumAST.OL_LI,
  UL : enumAST.UL_LI
 },
 listWSNL = [enumLex.WS, enumLex.NL],
 listParaDelim = [enumLex.HR, enumLex.ATX, enumLex.DIV],
 listRefEnd = [enumLex.NL, enumLex.REF_END],
 listATXEnd = [enumLex.NL, enumLex.ATX_END];

 
 function untilNotWSNL(token)
 {
  return listWSNL.indexOf(token.type) === -1;
 }

 function untilPre(token, tokStart)
 {
  return token.type === tokStart.type &&
   token.col === tokStart.col &&
   token.lexeme === tokStart.lexeme &&
   isLineStart.call(this);
 }

 function untilNL(token)
 {
  return token.type === enumLex.NL;
 }

 function untilLinkRefEnd(token)
 {
  return listRefEnd.indexOf(token.type) !== -1;
 }

 function untilATXEnd(token)
 {
  return listATXEnd.indexOf(token.type) !== -1;
 }

 function untilParaEnd(token, minCol)
 {
  return isLineStart.call(this) && (
   isLineEnd.call(this) ||
   listParaDelim.indexOf(token.type) !== -1 ||
   listWSNL.indexOf(token.type) === -1 && token.col < minCol
  );
 }

 function isLineStart()
 {
  var prev1 = this.lookAhead(-1),
   prev2 = this.lookAhead(-2),
   
  return !prev1 || 
   prev1.type === enumLex.NL || 
   prev1.type === enumLex.WS && (!prev2 || prev2.type === enumLex.NL);
 }

 function isLineEnd()
 {
  var now = this.lookAhead(),
   next = this.lookAhead(1);
   
  return !now || 
   now.type === enumLex.NL ||
   now.type === enumLex.WS && (!next || next.type === enumLex.NL);
 }
 
 function accText(tok, index, tokens)
 {
  var minCol = this,
   prev = tokens[index - 1] || tok;
   
  if (tok.type === enumLex.WS && prev.type === enumLex.NL))
  {
   return tok.lexeme.slice(minCol);
  }
  return tok.lexeme;
 }


 
 function parseBlock(ignoreLine)
 {
  var tok = this.lookAhead(this.shiftUntil(untilNotWSNL)),
   func = tok ? blockSwitch[tok.type] : null,
   isFunc = func instanceof Function,
   isNotAbuse = this.currlvl >= this.options.maxBlocks,
   node = void(0);
   
  this.currlvl += 1;
  if (isFunc && isNotAbuse && (ignoreLine || isLineStart.call(this)))
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
 
 function parseList(lexTok)
 {
  var nodeType = blockListASTMap[lexTok.type],
   ignoreLineStart = true;
   node = ASTNode.create(nodeType),
   col = lexTok.col,
   tok = null;
   
  this.shift();
  if (isLineEnd.call(this))
  {
   return node;
  }
  if (lexTok.type === enumLex.DT)
  {
   node.nodes = parsePara.call(this).nodes;
   return node;
  }
  
  while (tok = this.lookAhead() && tok.col >= col)
  {
   node.nodes.push(parseBlock.call(this, ignoreLineStart));
   this.shiftUntil(untilNotWSNL);
   ignoreLineStart = false;
  }
  return node;
 }
 
 function parseHRTR(lexTok)
 {
  var nodeType = lexTok.type === enumLex.HR ? 
   enumAST.HR : 
   enumAST.TR;
   
  this.shiftUntilPast(untilNL);
  return ASTNode.create(nodeType);
 }

 function parseDiv(lexTok)
 {
  var node = ASTNode.create(enumAST.DIV),
   col = lexTok.col,
   tok = null;

  this.shift();
  while (tok = this.lookAhead() && tok.col >= col)
  {
   if (tok.type === enumLex.DIV && tok.col === col && isLineStart.call(this))
   {
    this.shiftUntilPast(untilNL);
    break;
   }
   node.nodes.push(parseBlock.call(this));
   this.shiftUntil(untilNotWSNL);
  }
  return node;
 }

 function parsePre(lexTok)
 {
  var nodeType = lexTok.type === enumLex.COMMENT ? 
   enumAST.COMMENT : 
   enumAST.PRE;

  var startPos = this.shiftUntilPast(untilNL),
   endPos = this.shiftUntilPast(untilPre, lexTok) - 1,
   node = ASTNode.create(nodeType),
   text = this.slice(startPos, endPos)
    .map(accText, lexTok.col)
    .join("");
   
  node.nodes.push(text);
  return node;
 }

 function parseATX(lexTok)
 {
  var hLen = lexTok.lexeme.length,
   node = ASTNode.create(enumAST.HEADER),
   startPos = this.shift(),
   endPos = this.shiftUntilPast(untilATXEnd) - 1;

  node.level = hLen;
  node.nodes.push(this.sliceText(startPos, endPos));
  return node;
 }

 function parseLabel(lexTok)
 {
  var nodeType = lexTok.type === enumLex.ID ? enumAST.ID : enumAST.CLASS,
   startPos = this.currPos + 1,
   endPos = this.shiftUntilPast(untilNL) - 1,
   node = ASTNode.create(nodeType);
   
  node.nodes.push(util.trim(this.sliceText(startPos, endPos));
  return node;
 }

 function parseRef(lexTok)
 {
  var id = this.sliceText(this.shift(), this.shiftUntil(untilLinkRefEnd)),
   url = this.sliceText(this.currPos + 1, this.shiftUntil(untilNL));
    
  id = util.trim(id);
  url = util.trim(url);
   
  if (url.length > 0 && id.length > 0)
  {
   this.root.refTable[id] = url;
  }
 }
 
 function parsePara(lexTok)
 {
  var node = ASTNode.create(enumAST.P),
   startPos = this.currPos,
   endPos = this.shiftUntilPast(untilParaEnd, lexTok.col) - 1,
   paraToks = this.slice(startPos, endPos),
   endTok = this.lookAhead(-1) || {};

  node.nodes.concat(this.inlineParser.parse(paraToks));
  
  //Promote to a H1 or H2 node if ended on a Setext token.
  if (endTok.type === enumLex.HR || endTok.type === enumLex.ATX_END)
  {
   node.type = enumAST.HEADER;
   node.level = endTok.type === enumLex.HR ? 2 : 1;
  }
  
  return node;
 }

 function parse(bbmTokens)
 {
  var rootNode = this.root;
  
  rootNode.refTable = {};
  this.tokens = bbmTokens;
  
  while (this.lookAhead())
  {
   rootNode.nodes.push(parseBlock.call(this));
  }
  this.reset();
  return rootNode;
 }
 
 base.parse = parse;
 return base;
}());




if (typeof module === "object" && module.exports)
{
 module.exports = ParserBlock;
}
}());
