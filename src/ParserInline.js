
(function (){
 "use strict";

 var Lexer = require("./Lexer.js"),
  enumLex = require("./LexEnum.js"),
  ParserBase = require("./ParserBase.js"),
  enumAST = require("./ASTNodeEnum.js"),
  ASTNode = require("./ASTNode.js");


 function ParserInline(options)
 {
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


  function parse(bbmTokens)
  {
   var rootNode = new ASTNode("TODO");
   this.tokens = bbmTokens;
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
