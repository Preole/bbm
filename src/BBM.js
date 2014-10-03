(function (){
"use strict";

var __ = require("./__.js"),
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
 return parseBBM.call(null, bbmStr, options);
}

/*
TODO: Returns a tree.
*/
function parseBBM(bbmStr, options)
{
 return Parser(bbmStr, __.extend({}, currOpt, options));
}

function setOpt(options)
{
 return __.extend(currOpt, options);
}

module.exports = __.extend(BBM,
{
 parseBBM : parseBBM,
 setOpt : setOpt,
 currOpt : currOpt
});

}());

