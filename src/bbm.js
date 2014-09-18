/**!
 * @desc BakaBakaMark: An Extensible LML-HTML Compiler
 * @version 2.0.0
 * @license BSD-2-Clause; Copyright (c) 2014 Preole, All rights reserved.
 */

(function (){
"use strict";

var utils = require("./utils.js"),
 Lexer = require("./Lexer.js"),
 Parser = require("./ParserBlock.js");

//Options before blank line: Parse time options; After: Renderer options.
var defOptions =
{
 maxBlocks : 8,
 maxSpans : 8,
 
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

var bbmStatic = (function (){ 
 var bbm;
 
 function staticCompile(bbmStr, options)
 {
  bbm = bbm || BBM.create(options);
  return bbm.compile(bbmStr, options);
 }
 
 return staticCompile;
}());


function BBM(bbmStr, options)
{
 if (!(this instanceof BBM))
 {
  return bbmStatic(bbmStr, options);
 }
 this.options = utils.extend({}, defOptions, options);
 this.lexer = Lexer.create();
 this.parser = Parser.create(this.options);
}

function create(options)
{
 return new BBM(null, options);
}

BBM.create = create;
BBM.prototype = (function (){
 function setOptions(newOption)
 {
  this.options = utils.extend(this.options, newOption);
  this.parser.options = this.options;
 }

 function compile(bbmStr)
 {
  var tokens = this.lexer.parse(bbmStr),
   ast = this.parser.parse(tokens);

  return ast;
  //TODO: ast.toHTML();
 }
 

 return {
  compile : compile,
  setOptions : setOptions
 };
}());

if (typeof module === "object" && module.exports)
{
 module.exports = BBM;
}

}());