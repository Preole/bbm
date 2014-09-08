
//TODO: Handle escaped tokens in RefLink, Pre, Comment, and ATX contexts.
//TODO: Implement nesting abuse protection
(function (){
 "use strict";
 
 var Lexer = require("./Lexer.js"),
  rulesBlock = require("./LexerEnumBlock.js"),
  ParserInline = require("./ParserInline.js"),
  ParserBase = require("./ParserBase.js"),
  ASTNode = require("./ASTNode.js"),
  enumAST = require("./ASTNodeEnum.js"),
  enumLex = rulesBlock.types; 

 function ParserBlock(options)
 {
  this.inlineParser = ParserInline.create(options);
  this.lexer = Lexer.create(rulesBlock.rules, rulesBlock.types.TEXT);
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
    BQ : parseList,
    DD : parseList,
    OL : parseList,
    UL : parseList,
    DT : parseList,
    HR : parseHRTR,
    TRSEP : parseHRTR,
    REF : parseRef,
    ATX : parseATX,
    COMMENT : parsePre,
    CODE : parsePre,
    ASIDE : parseDiv,
    CLASS : parseLabel,
    ID : parseLabel
   },
   blockListASTMap =
   {
    TH : enumAST.TH,
    TD : enumAST.TD,
    BQ : enumAST.BLOCKQUOTE,
    DD : enumAST.DD,
    DT : enumAST.DT,
    OL : enumAST.OL_LI,
    UL : enumAST.UL_LI
   },
   listWSNL = [enumLex.WS, enumLex.NL],
   listSetext = [enumLex.HR, enumLex.ATX],
   listRefEnd = [enumLex.NL, enumLex.REF_END],
   listATXEnd = [enumLex.NL, enumLex.ATX_END];
   
   
  
  function untilNotWSNL(token)
  {
   return listWSNL.indexOf(token.type) === -1;
  }

  function untilPre(token, tokStart)
  {
   return token.isSameType(tokStart) &&
    token.col === tokStart.col &&
    token.lexeme.length === tokStart.lexeme.length &&
    isLineStart.call(this);
  }

  function untilBR(token)
  {
   return token.isType(enumLex.NL);
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
    listSetext.indexOf(token.type) !== -1 ||
    listWSNL.indexOf(token.type) === -1 && token.col < minCol
   );
  }

  function isLineStart()
  {
   var prev1 = this.lookAhead(-1),
    prev2 = this.lookAhead(-2),
    
   return !prev1 || 
    prev1.isType(enumLex.NL) || 
    prev1.isType(enumLex.WS) && (!prev2 || prev2.isType(enumLex.NL));
  }

  function isLineEnd()
  {
   var now = this.lookAhead(),
    next = this.lookAhead(1);
    
   return !now || 
    now.isType(enumLex.NL) ||
    now.isType(enumLex.WS) && (!next || next.isType(enumLex.NL));
  }
  
  function removeBackslash(str)
  {
   return str.replace(/\\(.)/g, "$1");
  }
  


  function parseBlock(ignoreLine)
  {
   this.shiftUntil(untilNotWSNL);
   
   var tok = this.lookAhead(),
    func = tok ? blockSwitch[tok.type] : null;

   if (func instanceof Function && (ignoreLine || isLineStart.call(this)))
   {
    return func.call(this, tok);
   }
   return parsePara.call(this);
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
   if (lexTok.isType(enumLex.DT))
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
   var nodeType = lexTok.isType(enumLex.HR) ? 
    enumAST.HR : 
    enumAST.TR;
    
   this.shift();
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
    if (tok.isType(enumLex.DIV) && tok.col === col && isLineStart.call(this))
    {
     break;
    }
    node.nodes.push(parseBlock.call(this));
    this.shiftUntil(untilNotWSNL);
   }
   this.shift();
   return node;
  }

  function parsePre(lexTok)
  {
   var nodeType = lexTok.isType(enumLex.COMMENT) ? 
     enumAST.COMMENT : 
     enumAST.CODE;

   var startPos = this.currPos + 1,
    node = ASTNode.create(nodeType);

   /*
   TODO: Trim leading WS on each line, extract text, discard text 
   immediately before the closing block.
   */
   this.shiftUntilPast(untilBR);
   this.shiftUntil(untilPre, lexTok); //add text extraction here.
   this.shift();
   return node;
  }

  function parseATX(lexTok)
  {
   var hLen = lexTok.lexeme.length,
    node = ASTNode.create(enumAST.HEADER),
    startPos = this.currPos + 1;

   this.shiftUntilPast(untilATXEnd);
   node.level = hLen;
   node.nodes.push(this.sliceText(startPos, this.currPos - 1));
   return node;
  }

  function parseLabel(lexTok)
  {
   var nodeType = lexTok.isType(enumLex.ID) ? 
    enumAST.ID :
    enumAST.CLASS;
    
   var startPos = this.currPos + 1;
    node = ASTNode.create(nodeType);
    
   this.shiftUntilPast(untilBR);
   node.nodes.push(this.sliceText(startPos, this.currPos - 1));
   return node;
  }

  function parseRef(lexTok)
  {
   var startPos = currPos + 1,
    id = "",
    url = "";
    
   this.shiftUntil(untilRefEnd);
   if (isLineEnd.call(this))
   {
    return;
   }
   id = this.sliceText(startPos, this.currPos);
   
   startPos = currPos + 1;
   this.shiftUntil(untilBR);
   url = this.sliceText(startPos, this.currPos);
   
   //TODO: URL and ID processing. Check the length after processing.
   if (url.length > 0 && id.length > 0)
   {
    
   }
  }
  
  function parsePara(lexTok)
  {
   var node = ASTNode.create(enumAST.P),
    startPos = this.currPos,
    paraText = "";
    
   this.shiftUntilPast(untilParaEnd, lexTok.col);
   
   paraText = this.sliceText(startPos, this.currPos - 1);
   node.nodes.concat(this.inlineParser.parse(paraText).nodes);
   return node;
  }

  function parse(bbmStr)
  {
   var rootNode = ASTNode.create(enumAST.ROOT);
   this.tokens = this.lexer.parse(bbmStr);
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
