(function (){
"use strict";


require("./_BBM.Lexer.js");
require("./_BBM.manipulation.js");
require("./_BBM._append.js");

var BBM = require("./BBM.js");

function ParserInline(tokens, options)
{
 //TODO: Fix side effect from base Lexer first.
}


//TODO: Unwrap root node?
BBM.parseInline = parseInline;
BBM.prototype.parseInline = function (bbmStr, options)
{
 return this.empty().append(ParserInline(bbmStr, options));
};

}());
