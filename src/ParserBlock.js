
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
 return new ParserBlock(tokens);
}

ParserBlock.create = create;
ParserBlock.prototype = (function (){
 var base = ParserBase.prototype,
 lexBlockSwitch =
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
 lexListASTMap =
 {
  TH : enumAST.TH,
  TD : enumAST.TD,
  GT : enumAST.BLOCKQUOTE,
  DD : enumAST.DD,
  DT : enumAST.DT,
  OL : enumAST.OL_LI,
  UL : enumAST.UL_LI
 },
 lexListWSNL = [enumLex.WS, enumLex.NL],
 lexListParaDelim = [enumLex.HR, enumLex.ATX, enumLex.DIV],
 lexListRefEnd = [enumLex.NL, enumLex.REF_END],
 lexListATXEnd = [enumLex.NL, enumLex.ATX_END],
 astListLink =
 [
  enumAST.LINK_EXT,
  enumAST.LINK_INT,
  enumAST.LINK_WIKI,
  enumAST.LINK_IMG
 ],
 astListAlone = [enumAST.PRE, enumAST.TD, enumAST.TH],
 astListInline = [enumAST.P, enumAST.HEADER, enumAST.DT],
 astListBlock =
 [
  enumAST.TD, enumAST.TH, enumAST.TR, enumAST.TABLE, 
  enumAST.DL, enumAST.DD, enumAST.DT,
  enumAST.UL, enumAST.OL, enumAST.LI,
  enumAST.BLOCKQUOTE, enumAST.DIV, enumAST.ROOT
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
   func = tok ? lexBlockSwitch[tok.type] : null,
   isFunc = func instanceof Function,
   isNotAbuse = this.currlvl >= this.options.maxBlocks,
   node = null;
   
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
  var nodeType = lexListASTMap[lexTok.type],
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
   return parsePara.call(this, lexTok);
  }
  
  while (tok = this.lookAhead() && tok.col >= col)
  {
   node.append(parseBlock.call(this, ignoreLineStart));
   this.shiftUntil(untilNotWSNL);
   ignoreLineStart = false;
  }
  return node;
 }
 
 function parseHRTR(lexTok)
 {
  var nodeType = lexTok.type === enumLex.HR ? 
   enumAST.HR : 
   enumAST.TRSEP;
   
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
   node.append(parseBlock.call(this));
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
   text = this.slice(startPos, endPos).map(accText, lexTok.col).join("");
   
  if (text.length > 0)
  {
   return node.append(text);
  }
 }

 function parseATX(lexTok)
 {
  var hLen = lexTok.lexeme.length,
   node = ASTNode.create(enumAST.HEADER),
   startPos = this.shift(),
   endPos = this.shiftUntilPast(untilATXEnd) - 1,
   text = this.sliceText(startPos, endPos).trim();

  if (!utils.isBlankString(text))
  {
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
   node = ASTNode.create(nodeType),
   idClass = utils.removeWS(this.sliceText(startPos, endPos));
   
  if (idClass.length > 0)
  {
   node.attr = {};
   if (nodeType === enumAST.ID)
   {
    node.attr.id = idClass;
   }
   else
   {
    node.attr.classes = idClass;
   }
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
 
 function parsePara(lexTok)
 {
  var startPos = this.currPos,
   endPos = this.shiftUntilPast(untilParaEnd, lexTok.col) - 1,
   paraToks = this.slice(startPos, endPos),
   endTok = this.lookAhead(-1) || {},
   node = this.inlineParser.parse(paraToks);
  
  if (lexTok.type === enumLex.DT)
  {
   node.type = enumAST.DT;
  }
  else if (endTok.type === enumLex.HR || endTok.type === enumLex.ATX_END)
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
 
 //Remove empty paragraphs. 
 function reduceInline(acc, node, index, sibs)
 {
  if (!(node instanceof ASTNode))
  {
   return acc; //Guard case: Not a node.
  }
 
  var prev = acc[index - 1],
   text = node.nodes[0] || "",
   isLink = astListLink.indexOf(node.type) !== -1,
   isLast = index === sibs.length - 1,
   isBlank = utils.isString(text) && utils.isBlankString(text);
  
  if (isLink || (!isBlank && isLast) || !isBlank || prev)
  {
   acc.push(node); //Base Case: Keep links/images, keep non-blank text.
  }
  else
  {
   node.nodes = node.nodes.reduce(reduceInline, []);
   if (node.nodes.length > 0)
   {
    acc.push(node); //Recursive case: Formatting.
   }
  }
  return acc;
 }
 
 //Remove empty li, p, ul, and other block elements.
 function reduceRightBlock(acc, node, index, sibs)
 {
  if (!(node instanceof ASTNode))
  {
   return acc; //Guard case: Not a node.
  }
  var prev = acc[acc.length - 1];

  if (/*Table*/)
  {
   //doTable Processing
  }
  else if (/*DL*/)
  {
   //doDL Processing
  }
  else if (/*ID*/ && prev) //Tricky.
  {
   prev.attr = utils.extend(prev.attr, node.attr);
  }
  else if (/*Class*/ && prev)
  {
   //TODO: very tricky here.
  }
  else if (astListInline.indexOf(node.type) !== -1)
  {
   node.nodes = node.nodes.reduce(reduceInline, []);
  }
  else if (astListBlock.indexOf(node.type) !== -1)
  {
   node.nodes = node.nodes.reduceRight(reduceBlockRight, []).reverse();
  }

  if (astListAlone.indexOf(node.type) !== -1 || node.nodes.length > 0)
  {
   acc.push(node);
  }
  return acc;
 }

 
 function pruneTableRows(rowNode, index, siblings)
 {
  var gCol = siblings[0] ? siblings[0].nodes.length : 0,
   rCol = rowNode.nodes.length;

  if (rCol > 0 && rCol > gCol)
  {
   rowNode.nodes = rowNode.nodes.slice(0, gCol);
  }
  else if (rCol > 0 && rCol < gCol)
  {
   rowNode.nodes = rowNode.nodes.concat(createCells(gCol - rCol));
  }
  rowNode.nodes = rowNode.nodes.reduceRight(reduceRightBlock, []).reverse();
 }
 
 //TODO: Fit Table, DL, and lone paragraph processors into block pruning.
 function pruneTable(node)
 {
  var first = node.first(),
   cols = first instanceof ASTNode ? first.nodes.length : 0;
   
  node.nodes = node.nodes.filter(isNotLeafBlock); //Kill empty rows
  node.nodes.forEach(pruneTableRows); //Uniform row columns.
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
  node.nodes = node.nodes.reduceRight(reduceRightBlock, []).reverse();
 }

 //(li, th, td, bq, dd) > p:only-child -> take its descendants.
 function pruneLonePara(node)
 {
  var first = node.first(),
   nodeCount = node.nodes.length;

  if (nodeCount === 1 && first.type === enumAST.P)
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
   rootNode.append(parseBlock.call(this));
  }
  rootNode = rootNode.nodes.reduceRight(reduceRightBlock, []);
  return this.reset();
 }
 
 base.parse = parse;
 return base;
}());




if (typeof module === "object" && module.exports)
{
 module.exports = ParserBlock;
}
}());
