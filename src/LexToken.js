
(function (){
"use strict";

function LexToken(lexeme, type, col, line)
{
 this.lexeme = lexeme || "";
 this.type = type || "";
 this.col = col || -1;
 this.line = line || -1;
}

function create(lexeme, type, col, line)
{
 return new LexToken(lexeme, type, col, line);
}

LexToken.create = create;

if (typeof module === "object" && module.exports)
{
 module.exports = LexToken;
}
}());
