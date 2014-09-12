/**!
 * @desc BakaBakaMark: An Extensible LML-HTML Compiler
 * @version 2.0.0
 * @license BSD-2-Clause; Copyright (c) 2014 Preole, All rights reserved.
 */

(function (){
"use strict";

var util = require("./util.js"),
 Lexer = require("./Lexer.js"),
 Parser = require("./ParserBlock.js"),

//Options before blank line: Parse time options; After: Renderer options.
var defOptions =
{
 maxBlocks : 8,
 maxSpans : 10,
 
 rmEOL : false,
 maxAttrChars : 2048,
 allowImg : true,
 allowLink : true,
 allowClass : true,
 allowID : true,
 cssPrefix : "bbm-",
 cssWiki : "w-bbm",
 target : "html",
 headerOffset : 0
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