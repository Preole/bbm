module.exports = (function (){
"use strict";

var utils = require("./utils.js"),
Parser = require("./Parser.js"),
Lexer = require("./Lexer.js"),
ASTNode = require("./ASTNode.js"),
defOpt =
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
},
currOpt = utils.extend({}, defOpt);


/*
TODO: Add Mapping between target name and actual generated output.
*/
function BBM(bbmStr, options)
{
 return Parser(bbmStr, utils.extend({}, currOpt, options));
}

function setOpt(options)
{
 return utils.extend(currOpt, options);
}

return utils.extend(BBM, {
 Lexer : Lexer,
 Parser : Parser,
 ASTNode : ASTNode,
 setOpt : setOpt,
 currOpt : currOpt
});

}());

