(function (){
"use strict";

require("./_BBM.Lexer.js");
require("./_BBM.parseInline.js");
require("./_BBM.manipulation.js");
require("./_BBM._append.js");

var BBM = require("./BBM.js"),
LEX = BBM.Lexer.ENUM,
AST = BBM.ENUM,
EOF = {};


function Parser(bbmStr, options)
{
//TODO: Fix side effects from the parser first.

}

BBM.parse = Parser;
BBM.prototype.parse = function (bbmStr, options)
{
 return this.empty()_.append(Parser(bbmStr, options));
};


}());