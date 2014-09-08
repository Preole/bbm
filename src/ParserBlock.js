
(function (global){
 "use strict";
 
 var Lexer = require("./Lexer.js"),
  rulesBlock = require("./LexerEnumBlock.js"),
  ParserInline = require("./ParserInline.js"),
  ParserBase = require("./ParserBase.js"),
  ASTEnum = require("./ASTNodeEnum.js"),
  ASTNode = require("./ASTNode.js");

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
  var base = ParserBase.prototype;
  
  function parse(bbmStr)
  {
   return;
  }
  
  base.parse = parse;
  return base;
 }());




 if (typeof module === "object" && module.exports)
 {
  module.exports = ParserBlock;
 }
}(this));
