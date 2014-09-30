(function (){
"use strict";

var utils = require("./utils.js"),
Parser = require("./Parser.js"),
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
 return parseBBM.call(null, bbmStr, options);
}

/*
TODO: Returns a tree.
*/
function parseBBM(bbmStr, options)
{
 return Parser(bbmStr, utils.extend({}, currOpt, options));
}

function setOpt(options)
{
 return utils.extend(currOpt, options);
}

module.exports = utils.extend(BBM,
{
 parseBBM : parseBBM,
 setOpt : setOpt,
 currOpt : currOpt
});

}());

