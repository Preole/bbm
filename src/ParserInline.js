
(function (){
 "use strict";

 var Lexer = require("./Lexer.js"),
  rulesInline = require("./LexEnumInline.js"),
  ParserBase = require("./ParserBase.js"),
  ASTEnum = require("./ASTNodeEnum.js"),
  ASTNode = require("./ASTNode.js");


 function ParserInline(options)
 {
  this.lexer = Lexer.create(rulesInline.rules, rulesInline.types.TEXT);
  this.reset(options);
 }
 
 function create(tokens)
 {
  return new ParserInline(tokens);
 }
 
 ParserInline.create = create;
 ParserInline.prototype = (function (){
  var base = ParserBase.prototype;

  function parseFormat()
  {
  }
  function parseLink()
  {
  }
  function parseLinkCont()
  {
  }
  function parseVerbatim()
  {
  }


  function parse(bbmStr)
  {
   var rootNode = new ASTNode("TODO");
   this.tokens = this.lexer.parse(bbmStr);
   while (this.lookAhead())
   {
    //TODO
   }
   this.reset();
   return rootNode;
  }
  base.parse = parse;
  return base;
 }());

 if (typeof module === "object" && module.exports)
 {
  module.exports = ParserInline;
 }
}());
