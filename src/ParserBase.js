module.exports = (function (){
"use strict";

var utils = require("./utils.js"),
LEX = require("./Lexer.js").ENUM;

/*
Private methods
---------------
*/

function doSlice(tok, index, tokens)
{
 var minCol = this,
  prev = tokens[index - 1];

 if (tok.type === LEX.WS && (!prev || prev.type === LEX.NL))
 {
  tok.lexeme = tok.lexeme.slice(minCol);
 }
 return tok.lexeme.length > 0;
}

function doSliceText(tok, index, tokens)
{
 return tok.lexeme;
}



/*
Public Methods
--------------
*/

function peekAt(index)
{
 return this.tokens[index || this.currPos];
}

function peek(offset)
{
 return this.tokens[this.currPos + (offset || 0)];
}

function peekT(type, offset)
{
 var token = this.peek(offset);
 if (utils.isObject(token))
 {
  return type === token.type;
 }
}

function shift()
{
 this.currPos += 1;
 return this.currPos;
}

function shiftUntil(callback)
{
 var params = Array.prototype.slice.call(arguments, 1),
  token = this.peek();
  
 while (token && !callback.apply(this, [token].concat(params)))
 {
  this.shift();
  token = this.peek();
 }
 return this.currPos;
}

function shiftUntilPast(callback)
{
 this.shiftUntil.apply(this, arguments);
 this.shift();
 return this.currPos;
}

function slice(fromPos, toPos, minCol)
{
 var tokens = this.tokens.slice(fromPos, toPos);
 if (utils.isNumber(minCol) && minCol > 0)
 {
  tokens = tokens.filter(doSlice, minCol);
 }
 return tokens;
}

function sliceText(fromPos, toPos, minCol)
{
 return this.slice(fromPos, toPos, minCol).map(doSliceText).join("");
}



function ParserBase(tokens, options)
{
 var obj = (this instanceof ParserBase) ? this : new ParserBase;
 obj.tokens = tokens || []; //Array of LexToken
 obj.currPos = 0; //Current token index
 obj.currlvl = 0; //Current nesting level
 obj.options = options || {};
 return obj;
}

utils.extend(ParserBase,
{
 prototype :
 {
  peekAt : peekAt,
  peek : peek,
  peekT : peekT,
  shift : shift,
  shiftUntil : shiftUntil,
  shiftUntilPast : shiftUntilPast,
  slice : slice,
  sliceText : sliceText
 }
});


return ParserBase;
}());

