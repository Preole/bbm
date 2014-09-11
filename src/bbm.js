(function (){
"use strict";

var util = require("./util.js"),
 Lexer = require("./Lexer.js"),
 Parser = require("./ParserBlock.js"),
 defOptions =
 {
  removeEOL : false,
  maxBlocks : 8,
  maxSpans : 10,
  allowImg : true,
  allowLink : true,
  allowClass : true,
  allowID : true,
  cssPrefix : "bbm-",
  cssWiki : "w-bbm",
  headerOffset : 0,
  xhtml : 0
 };

function BBM(options)
{
 this.options = util.extend({}, defOptions, options);
 this.lexer = Lexer.create();
 this.parser = Parser.create(this.options);
}

function create(options)
{
 return new BBM(options);
}

BBM.create = create;
BBM.prototype = (function (){
 function setOptions(newOption)
 {
  this.options = util.extend(this.options, newOption);
  this.parser.reset(this.options);
 }

 function parse(bbmStr)
 {
  var tokens = this.lexer.parse(bbmStr),
   ast = this.parser.parse(tokens, this.options);
   
  
  
  //TODO: Establish Lex -> Parse -> Prune -> Render pipeline.
  /*
  ast.filterThis()...
  ast.filterThat()...
  ast.setTarget...
  ast.toString();
  */
 }
 

 return {
  parse : parse,
  setOptions : setOptions
 };
}());

if (typeof module === "object" && module.exports)
{
 module.exports = BBM;
}

}());