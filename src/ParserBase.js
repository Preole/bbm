
//Baseline Parser class. Implements token list traversal methods.
(function (){
"use strict";

var ASTNode = require("./ASTNode.js"),
 enumAST = require("./ASTNodeEnum.js");

function ParserBase()
{
 throw new TypeError("Abstract class ParserBase cannot be instantiated.");
}

ParserBase.prototype = (function (){
 function reset(newOptions)
 {
  this.tokens = []; //Array of LexToken
  this.currPos = 0; //Current token index
  this.nestlvl = 0; //Current nesting level
  this.errors = []; //Array of Strings. (Error Messages)
  this.refTable = Object.create(null); //Global ID table for reference links.
  this.idTable = Object.create(null); //Global ID table for CSS ID.
  
  if (typeof this.options === "object" && this.options !== null)
  {
   this.options = {};
  }
  this.options = util.extend(this.options, newOptions); //TODO: object extending.
 }

 function lookAt(index)
 {
  return this.tokens[index || this.currPos];
 }
 
 function lookAhead(offset)
 {
  return this.tokens[this.currPos + (offset || 0)];
 }
 
 function lookAheadType(type, offset)
 {
  var token = this.lookAhead(offset);
  if (typeof token === "object" && token !== null)
  {
   return type === token;
  }
 }
 
 function shift()
 {
  if (this.currPos < this.tokens.length)
  {
   this.currPos += 1;
  }
  return this.currPos;
 }
 
 function shiftUntil(callback)
 {
  var params = Array.prototype.slice.call(arguments, 1),
   token = this.lookAhead();
   
  while (callback.apply(this, [token].concat(params)))
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
  lookAheadType : lookAheadType,
  shift : shift,
  shiftUntil : shiftUntil,
  shiftUntilPast : shiftPast,
  slice : slice,
  sliceText : sliceText
 };
}());

if (typeof module === "object" && module.exports)
{
 module.exports = ParserBase;
}
}());

