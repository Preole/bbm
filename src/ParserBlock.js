
//TODO: Handle escaped tokens in RefLink, Pre, Comment, and ATX contexts.
(function (){
 "use strict";
 
 var Lexer = require("./Lexer.js"),
  rulesBlock = require("./LexerEnumBlock.js"),
  ParserInline = require("./ParserInline.js"),
  ParserBase = require("./ParserBase.js"),
  ASTEnum = require("./ASTNodeEnum.js"),
  ASTNode = require("./ASTNode.js"),
  
  //TODO: Refactor LEXEnum for letter case consistency; CamelCase maybe?
  LEXEnum = rulesBlock.types; 

 function ParserBlock(options)
 {
  this.inlineParser = ParserInline.create(options);
  this.lexer = Lexer.create(rulesBlock.rules, rulesBlock.types.TEXT);
  this.options = options;
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
    HR : parseHR,
    REF : parseRef,
    ATX : parseATX,
    TRSEP : parseTR,
    COMMENT : parsePre,
    CODE : parsePre,
    ASIDE : parseDiv,
    CLASS : parseLabel,
    ID : parseLabel
   };
  
  function untilNotWSNL(token)
  {
   return !token.isType(LEXEnum.WS) && !token.isType(LEXEnum.NL);
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
   return token.isType(LEXEnum.NL);
  }

  function isLineStart()
  {
   var prev1 = this.lookAhead(-1),
    prev2 = this.lookAhead(-2),
    
   return !prev1 || 
    prev1.isType(LexEnum.NL) || 
    prev1.isType(LexEnum.WS) && (!prev2 || prev2.isType(LexEnum.NL));
  }

  function isLineEnd()
  {
   var now = this.lookAhead(),
    next = this.lookAhead(1);
    
   return !now || 
    now.isType(LEXEnum.NL) ||
    now.isType(LEXEnum.WS) && (!next || next.isType(LEXEnum.NL));
  }
  


  function parseBlock(ignoreLine)
  {
   this.shiftUntil(untilNotWSNL);
   
   var tok = this.lookAhead(),
    func = tok ? blockSwitch[tok.type] : null;

   //TODO: In some contexts, blocks don't have to be a line starter.
   //e.g: "> > > > ", block quote with four nesting levels.
   if (func instanceof Function && (ignoreLine || isLineStart.call(this)))
   {
    return func.call(this, tok);
   }
   return parsePara.call(this);
  }
  
  function parseList(lexTok)
  {
   var nodeType = TODO_MAP[lexTok.type],
    ignoreLineStart = true;
    node = ASTNode.create(nodeType),
    col = lexTok.col,
    tok = null;
    
   this.shift();
   if (isLineEnd.call(this))
   {
    return node; //Empty node;
   }
   if (lexTok.isType(LEXEnum.DT))
   {
    node.nodes = parsePara.call(this).nodes;
    return node; //DT: Parse a paragraph, and extract its children.
   }
   
   //All other cases, parse blocks recursively.
   while (tok = this.lookAhead() && tok.col >= col)
   {
    node.nodes.push(parseBlock.call(this, ignoreLineStart));
    this.shiftUntil(untilNotWSNL);
    ignoreLineStart = false;
   }
   return node;
  }
  
  function parseHR(lexTok)
  {
   this.shiftUntilPast(untilBR);
   return ASTNode.create(ASTEnum.HR);
  }

  function parseDiv(lexTok)
  {
   var node = ASTNode.create(ASTEnum.DIV),
    col = lexTok.col,
    tok = null;

   this.shift();
   while (tok = this.lookAhead() && tok.col >= col)
   {
    if (tok.isType(LEXEnum.DIV) && tok.col === col && isLineStart.call(this))
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
   var nodeType = lexTok.isType(LEXEnum.COMMENT) ? 
     ASTEnum.COMMENT : 
     ASTEnum.CODE;

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

  //TODO: Children with string, or attributes?
  function parseATX(lexTok)
  {
   var hLen = lexTok.lexeme.length,
    node = ASTNode.create(ASTEnum.HEADER),
    startPos = this.currPos + 1;

   this.shiftUntil("TODO");
   node.meta.level = hLen;
   node.nodes.push(this.sliceText(startPos, this.currPos - 1));
   return node;
  }

  function parseLabel(lexTok)
  {
   var nodeType = lexTok.isType(LEXEnum.ID) ? 
    ASTEnum.ID :
    ASTEnum.CLASS;
    
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
    
   this.shiftUntil("TODO");
   if (isLineEnd.call(this))
   {
    return;
   }
   id = this.sliceText(startPos, this.currPos);
   
   startPos = currPos + 1;
   this.shiftUntil("TODO");
   url = this.sliceText(startPos, this.currPos);
   
   //TODO: URL and ID processing. Check the length after processing.
   if (url.length > 0 && id.length > 0)
   {
    //TODO: Modify identifier table
   }
  }
  
  function parsePara(override)
  {
  
  }

  function parse(bbmStr)
  {
   var rootNode = ASTNode.create("TODO");
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
