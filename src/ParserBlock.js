
(function (){
"use strict";

var utils = require("./utils.js"),
 enumLex = require("./Lexer.js").types,
 ASTNode = require("./ASTNode.js"),
 enumAST = ASTNode.types,
 ParserInline = require("./ParserInline.js"),
 ParserBase = require("./ParserBase.js");
 

function ParserBlock(options)
{
 this.inlineParser = ParserInline.create(options);
 this.reset(options);
}

function create(options)
{
 return new ParserBlock(options);
}

ParserBlock.create = create;
ParserBlock.prototype = (function (){
 var base = new ParserBase(),
 EOF = {},
 reTailWSNL = /\s$/,
 lexBlockSwitch =
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
  TH : enumAST.TH,
  TD : enumAST.TD,
  GT : enumAST.BLOCKQUOTE,
  DD : enumAST.DD,
  OL : enumAST.OL_LI,
  UL : enumAST.UL_LI
 },
 lexListWSNL = [enumLex.WS, enumLex.NL],
 lexListParaDelim = [enumLex.HR, enumLex.ATX_END, enumLex.DIV],
 lexListSetext = [enumLex.HR, enumLex.ATX_END],
 lexListRefEnd = [enumLex.NL, enumLex.REF_END],
 lexListATXEnd = [enumLex.NL, enumLex.ATX_END],
 astListLink =
 [
  enumAST.LINK_EXT,
  enumAST.LINK_INT,
  enumAST.LINK_WIKI,
  enumAST.LINK_IMG
 ],
 astListInline = astListLink.concat([
  enumAST.TEXT, enumAST.STRONG, enumAST.EM, enumAST.DEL, enumAST.INS,
  enumAST.UNDER, enumAST.SUP, enumAST.SUB, enumAST.CODE,
 ]),
 astListAlone = [enumAST.PRE, enumAST.TD, enumAST.TH],
 astListBlock =
 [
  enumAST.TD, enumAST.TH, enumAST.TR, enumAST.TABLE, 
  enumAST.DL, enumAST.DD, enumAST.UL, enumAST.OL, enumAST.LI,
  enumAST.BLOCKQUOTE, enumAST.DIV, enumAST.ROOT
 ],
 astListLonePara =
 [
  enumAST.DD, enumAST.LI, enumAST.TH, enumAST.TR, enumAST.BLOCKQUOTE
 ];

 
 function untilNotWSNL(token)
 {
  return lexListWSNL.indexOf(token.type) === -1;
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
  return isLineStart.call(this) && (
   isLineEnd.call(this) ||
   lexListParaDelim.indexOf(token.type) !== -1 ||
   lexListWSNL.indexOf(token.type) === -1 && token.col < minCol
  );
 }

 function isLineStart()
 {
  var prev1 = this.lookAhead(-1),
   prev2 = this.lookAhead(-2);
   
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
 
 function isDivMatch(start, now)
 {
  return start.type === now.type && 
   start.lexeme.length === now.lexeme.length &&
   start.col === now.col && isLineStart.call(this);
 }
 
 function accText(tok, index, tokens)
 {
  var minCol = this,
   prev = tokens[index - 1];

  if (tok.type === enumLex.WS && (!prev || prev.type === enumLex.NL))
  {
   return tok.lexeme.slice(minCol);
  }
  return tok.lexeme;
 }

 function accTokens(tok, index, tokens)
 {
  var minCol = this,
   prev = tokens[index - 1];

  if (tok.type === enumLex.WS && (!prev || prev.type === enumLex.NL))
  {
   tok.lexeme = tok.lexeme.slice(minCol);
  }
  return tok.lexeme.length > 0;
 }


 
 function parseBlock(ignoreLine)
 {
  var tok = this.lookAt(this.shiftUntil(untilNotWSNL)),
   func = tok ? lexBlockSwitch[tok.type] : null,
   isNotAbuse = this.currlvl < (this.options.maxBlocks || 8),
   node = null;
   
  this.currlvl += 1;
  if (func && isNotAbuse && (ignoreLine || isLineStart.call(this)))
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
  this.shift();
  if (isLineEnd.call(this))
  {
   return;
  }
  this.shiftUntil(untilNotWSNL);
  
  return lexTok.type === enumLex.DT ? 
   parsePara.call(this, this.lookAhead(), enumAST.DT) : 
   parseList.call(this, lexTok);
 }
 
 function parseList(lexTok)
 {
  var node = ASTNode.create(lexListASTMap[lexTok.type]),
   col = lexTok.col + lexTok.lexeme.length,
   tok = null;
   
  while ((tok = this.lookAhead()) && tok.col >= col)
  {
   node.append(parseBlock.call(this, true));
   this.shiftUntil(untilNotWSNL);
  }
  return node;
 }
 
 function parseHRTR(lexTok)
 {
  this.shiftUntilPast(untilNL);
  return ASTNode.create(lexTok.type === enumLex.HR ? enumAST.HR : enumAST.TRSEP);
 }

 function parseDiv(lexTok)
 {
  var node = ASTNode.create(enumAST.DIV),
   col = lexTok.col,
   tok = null;

  this.shift();
  while ((tok = this.lookAhead()) && tok.col >= col)
  {
   if (isDivMatch.call(this, lexTok, tok))
   {
    this.shiftUntilPast(untilNL);
    break;
   }
   node.append(parseBlock.call(this));
   this.shiftUntil(untilNotWSNL);
  }
  return node;
 }

 function parsePre(lexTok)
 {
  var startPos = this.shiftUntilPast(untilNL),
   endPos = this.shiftUntilPast(untilPre, lexTok) - 1,
   text = lexTok.type === enumLex.PRE ? this.slice(startPos, endPos)
    .map(accText, lexTok.col)
    .join("")
    .replace(reTailWSNL, "") : "";

  if (text.length > 0)
  {
   return ASTNode.create(enumAST.PRE).append(text);
  }
 }

 function parseATX(lexTok)
 {
  var hLen = lexTok.lexeme.length,
   startPos = this.shift(),
   endPos = this.shiftUntilPast(untilATXEnd) - 1,
   text = this.sliceText(startPos, endPos).trim();

  if (!utils.isBlankString(text))
  {
   var node = ASTNode.create(enumAST.HEADER);
   node.level = hLen;
   node.append(text);
   return node;
  }
 }

 function parseLabel(lexTok)
 {
  var nodeType = lexTok.type === enumLex.ID ? enumAST.ID : enumAST.CLASS,
   startPos = this.currPos + 1,
   endPos = this.shiftUntilPast(untilNL) - 1,
   idClass = utils.removeWS(this.sliceText(startPos, endPos));
   
  if (idClass.length <= 0)
  {
   return;
  }
  
  var node = ASTNode.create(nodeType);
  if (nodeType === enumAST.ID)
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
  var id = this.sliceText(this.shift(), this.shiftUntil(untilRefEnd)).trim(),
   url = this.sliceText(this.currPos + 1, this.shiftUntil(untilNL)).trim();

  if (url.length > 0 && id.length > 0)
  {
   this.root.refTable[id] = url;
  }
 }
 
 function parsePara(lexTok, forceType)
 {
  if (!lexTok)
  {
   return;
  }
 
  var startPos = this.currPos,
   endPos = this.shiftUntil(untilParaEnd, lexTok.col),
   endTok = this.lookAhead() || EOF;
   
  if (startPos >= endPos || lexListWSNL.indexOf(endTok.type) !== -1)
  {
   this.shift();
  }
  if (startPos >= endPos)
  {
   return;
  }
  
  var paraToks = this.slice(startPos, endPos);
  if (lexTok.col > 0)
  {
   paraToks = paraToks.filter(accTokens, lexTok.col);
  }
  var node = this.inlineParser.parse(paraToks);
   
  if (node && !forceType && lexListSetext.indexOf(endTok.type) !== -1)
  {
   node.type = enumAST.HEADER;
   node.level = endTok.type === enumLex.HR ? 2 : 1;
  }
  
  return node;
 }



 /*
 Private: Tree Pruning
 ---------------------
 */
 function createCells(cellCount)
 {
  var cells = Array(cellCount);
  cells.forEach(function (val, index, array){
   array[index] = ASTNode.create(enumAST.TD);
  });
  return cells;
 }
 
 //Remove empty inline elements, pre-order traversal.
 function reduceInline(acc, node, index, sibs)
 {
  if (!(node instanceof ASTNode))
  {
   return acc; //Guard case
  }
 
  var prev = acc[index - 1],
   isLink = astListLink.indexOf(node.type) !== -1,
   isBlank = utils.isBlankString(node.nodes[0] || "");
   
  if (isLink || !isBlank || prev)
  {
   acc.push(node); //Base Case: Keep links/images, keep non-blank text.
  }
  else if (node.type !== enumAST.TEXT)
  {
   node.nodes = node.nodes.reduce(reduceInline, []);
   if (node.nodes.length > 0) //Recursive case: Formatting.
   {
    acc.push(node); 
   }
  }
  return acc;
 }
 
 //Remove empty block elements, post-order traversal.
 function reduceBlock(acc, node, index, sibs)
 {
  if (!(node instanceof ASTNode)) //Guard case
  {
   return acc;
  }

  var next = sibs[index + 1],
   first = node.nodes[0],
   isPre = node.type === enumAST.PRE;
   
  if (!isPre && first && astListInline.indexOf(first.type) !== -1)
  {
   node.nodes = node.nodes.reduce(reduceInline, []);
  }
  else if (astListBlock.indexOf(node.type) !== -1)
  {
   node.nodes = node.nodes.reduce(reduceBlock, []);
  }

  if (node.type === enumAST.TABLE)
  {
   node.nodes = node.nodes.reduce(reduceTR, []);
  }
  else if (node.type === enumAST.DL)
  {
   pruneDL(node);
  }
  else if ((node.type === enumAST.ID || node.type === enumAST.CLASS) && next)
  {
   pruneIDClass(node, next);
  }
  else if (astListLonePara.indexOf(node.type) !== -1)
  {
   pruneLonePara(node);
  }
  
  if (astListAlone.indexOf(node.type) !== -1 || node.nodes.length > 0)
  {
   acc.push(node);
  }
  return acc;
 }

 function reduceTR(acc, rowNode)
 {
  var gCol = acc[0] ? acc[0].nodes.length : rowNode.nodes.length;
   rCol = rowNode.nodes.length;
   
  if (rCol <= 0)
  {
   return acc;
  }
  else if (rCol > gCol)
  {
   rowNode.nodes = rowNode.nodes.slice(0, gCol);
  }
  else if (rCol < gCol)
  {
   rowNode.nodes = rowNode.nodes.concat(createCells(gCol - rCol));
  }
  acc.push(rowNode);
  return acc;
 }
 
 function pruneDL(node)
 {
  var first = node.first();
  while (first && first.type === enumAST.DD)
  {
   node.nodes.shift();
  }
  
  var last = node.last();
  while (last && last.type === enumAST.DT)
  {
   node.nodes.pop();
  }
 }

 function pruneIDClass(node, next)
 {
  if (node.attr["class"])
  {
   if (!utils.isString(next.attr["class"]))
   {
    next.attr["class"] = "";
   }
   next.attr["class"] += node.attr["class"] + " ";
  }
  else if (node.attr.id)
  {
   next.attr.id = node.attr.id;
  }
 }
 
 function pruneLonePara(node)
 {
  var first = node.first(),
   nodeCount = node.nodes.length;

  if (nodeCount === 1 && first && first.type === enumAST.P)
  {
   node.nodes = first.nodes;
  }
 }

 
 /*
 Public Methods
 --------------
 */
 function parse(bbmTokens)
 {
  this.tokens = bbmTokens;
  this.root.refTable = {};
  while (this.lookAhead())
  {
   this.root.append(parseBlock.call(this));
  }
  //this.root.nodes = this.root.nodes.reduce(reduceBlock, []);
  return this.reset();
 }
 
 function reset(newOptions)
 {
  this.inlineParser.reset(newOptions);
  return ParserBase.prototype.reset.call(this, newOptions);
 }
 
 base.parse = parse;
 base.reset = reset;
 return base;
}());




if (typeof module === "object" && module.exports)
{
 module.exports = ParserBlock;
}
}());
