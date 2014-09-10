(function (){
"use strict";

var defOptions =
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
 this.options = TODO.extend({}, defOptions, options);
 this.parser = ParserBlock.create(this.options);
}

function create(options)
{
 return new BBM(options);
}

BBM.create = create;
BBM.prototype = (function (){
 function setOptions(newOption)
 {
  //TODO: Initialize option object using .extend;
 }

 function parse(bbmStr)
 {
  //TODO: Establish Lex -> Parse -> Prune -> Render pipeline.
  var ast = this.parser.parse(bbmStr);
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