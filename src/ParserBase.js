
//Baseline Parser class. Implements token list traversal methods.
(function (){
"use strict";

var utils = require("./utils.js"),
 ASTNode = require("./ASTNode.js"),
 enumAST = ASTNode.types;

//Function declaration for useful stack trace names.
function ParserBase()
{

}

ParserBase.prototype = (function (){
 function reset(newOptions)
 {
  var prevRoot = this.root;
  this.tokens = []; //Array of LexToken
  this.currPos = 0; //Current token index
  this.currlvl = 0; //Current nesting level
  this.root = ASTNode.create(enumAST.ROOT);
  
  if (!utils.isObject(this.options))
  {
   this.options = {};
  }
  this.options = utils.extend(this.options, newOptions);
  
  return prevRoot;
 }

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

 return {
  reset : reset,
  lookAt : lookAt,
  lookAhead : lookAhead,
  lookAheadT : lookAheadT,
  shift : shift,
  shiftUntil : shiftUntil,
  shiftUntilPast : shiftUntilPast,
  slice : slice,
  sliceText : sliceText
 };
}());

if (typeof module === "object" && module.exports)
{
 module.exports = ParserBase;
}
}());

