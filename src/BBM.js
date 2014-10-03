(function (){
"use strict";

var __ = require("./__.js"),
ASTNode = require("./ASTNode.js"),
Parser = require("./Parser.js"),
defOpt =
{
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
currOpt = __.extend({}, defOpt);


/*
TODO: Add Mapping between target name and actual generated output.
*/
function BBM(bbmStr, options)
{
 /*
 Many cases...
 1: BBM is a set of ASTNodes. Given a string and some parsing options, create a BBM object.
 2: Add .toHTML to the node set.
 */

 return Parser(bbmStr, __.extend({}, currOpt, options));
}

function setOpt(options)
{
 if (arguments.length > 0)
 {
  return __.extend(currOpt, options);
 }
 return currOpt;
}

module.exports = __.extend(BBM,
{
 setOpt : setOpt
});

}());

