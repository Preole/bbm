module.exports = (function (){
"use strict";

var utils = require("./utils.js"),
Parser = require("./Parser.js"),
Lexer = require("./Lexer.js"),
defOptions =
{
 disallowed : [],
 maxBlocks : 8,
 maxSpans : 8,
 
 //Options before blank line: Lex/Parse options; After: Renderer options.
 
 rmEOL : false,
 maxAttrChars : 2048,
 cssPrefix : "bbm-",
 cssWiki : "w-bbm",
 target : "html",
 headerOffset : 0
};


/*
TODO: Add Mapping between target name and actual generated output.
TODO: Add private filtering steps wrapped over the parser.
*/
function BBM(bbmStr, options)
{
 return Parser(bbmStr, utils.extend({}, defOptions, options));
}

BBM.lexer = Lexer; //Expose Lexer for producing the token stream.
BBM.parser = Parser; //Expose the parser for raw AST. (TODO: Wrap a filter)
return BBM;

}());

