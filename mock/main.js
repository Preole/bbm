"use strict";

var fs = require("fs"),
Parser = require("../src/BBM.parse.js"),
fsOptR = {encoding : "utf-8"},
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
tree = Parser(fs.readFileSync("./input.txt", fsOptR), defOpt);
 
console.log(JSON.stringify(tree, null, " "));