
(function (){
 "use strict";

 var Lexer = require("./Lexer.js"),
  rulesInline = require("./LexEnumInline.js"),
  ParserBase = require("./ParserBase.js"),
  ASTEnum = require("./ASTNodeEnum.js"),
  ASTNode = require("./ASTNode.js");


 function ParserInline(tokens)
 {
  this.lexer = Lexer.create(rulesInline.rules, rulesInline.types.TEXT);
  this.reset();
 }
 
 function create(tokens)
 {
  return new ParserInline(tokens);
 }
 
 ParserInline.create = create;
 ParserInline.prototype = (function (){
  var base = ParserBase.prototype;
  
  function parse(bbmStr)
  {
   return; //TODO
  }
  base.parse = parse;
  return base;
 }());

 if (typeof module === "object" && module.exports)
 {
  module.exports = ParserInline;
 }
}());
