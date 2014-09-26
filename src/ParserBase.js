module.exports = (function (){
"use strict";

var utils = require("./utils.js"),
ASTNode = require("./ASTNode.js"),
enumAST = ASTNode.types;



function lookAt(index)
{
 return this.tokens[index || this.currPos];
}

function lookAhead(offset)
{
 return this.tokens[this.currPos + (offset || 0)];
}

function lookAheadT(type, offset)
{
 var token = this.lookAhead(offset);
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
  token = this.lookAhead();
  
 while (token && !callback.apply(this, [token].concat(params)))
 {
  this.shift();
  token = this.lookAhead();
 }
 return this.currPos;
}

function shiftUntilPast(callback)
{
 this.shiftUntil.apply(this, arguments);
 this.shift();
 return this.currPos;
}

function slice(fromPos, toPos)
{
 return this.tokens.slice(fromPos, toPos);
}

function sliceText(fromPos, toPos)
{
 return this.slice(fromPos, toPos).map(doSliceText).join("");
}

function doSliceText(token)
{
 return token.lexeme;
}



function ParserBase(tokens, options)
{
 var obj = (this instanceof ParserBase) ? this : new ParserBase;
 obj.tokens = tokens || []; //Array of LexToken
 obj.currPos = 0; //Current token index
 obj.currlvl = 0; //Current nesting level
 obj.options = options;
 return obj;
}

utils.extend(ParserBase,
{
 prototype :
 {
  lookAt : lookAt,
  lookAhead : lookAhead,
  lookAheadT : lookAheadT,
  shift : shift,
  shiftUntil : shiftUntil,
  shiftUntilPast : shiftUntilPast,
  slice : slice,
  sliceText : sliceText
 }
});


return ParserBase;
}());

