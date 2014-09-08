
(function (){
 "use strict";
 
 var Lexer = require("./Lexer.js"),
  rulesBlock = require("./LexerEnumBlock.js"),
  ParserInline = require("./ParserInline.js"),
  ParserBase = require("./ParserBase.js"),
  ASTEnum = require("./ASTNodeEnum.js"),
  ASTNode = require("./ASTNode.js"),
  lexEnum = rulesBlock.types;

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
   blockSwitch = {TODO: someFunction};
  
  function untilNotWS(currToken)
  {
   return !currToken.isType(lexEnum.WS) && !currToken.isType(lexEnum.NL);
  }
  
  function parseBlock()
  {
   this.shiftUntil(untilNotWS);
   
   var tok = this.lookAhead() || {},
    func = blockSwitch[tok.type];
    
   if (func)
   {
    return func.call(this);
   }
   return parsePara.call(this);
  }
  
  function parseList()
  {
  }
  function parseAside()
  {
  }
  function parseComment()
  {
  }
  function parseCodeBlock()
  {
  }
  function parseATX()
  {
  }
  function parseLabel()
  {
  }
  function parseLinkRef()
  {
  }
  function parsePara()
  {
  }
  

  function parse(bbmStr)
  {
   var rootNode = new ASTNode("TODO");
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
