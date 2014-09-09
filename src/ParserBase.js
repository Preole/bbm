
//Baseline Parser class. Implements token list traversal methods.
(function (){
 "use strict";

 function ParserBase()
 {
  throw new TypeError("Abstract class ParserBase cannot be instantiated.");
 }
 ParserBase.prototype = (function (){
  function reset(newOptions)
  {
   this.tokens = []; //Array of LexToken
   this.currPos = 0;
   this.nestLvl = 0;
   this.errMsgs = []; //Array of Strings. (Error Messages)
   
   if (!(this.options instanceof Object))
   {
    this.options = TODODefaultOption;
   }
   this.options = TODOExtend(this.options, newOptions);
  }
  
  function lookAhead(offset)
  {
   return this.tokens[this.currPos + (offset || 0)];
  }
  
  function shift()
  {
   if (this.currPos < this.tokens.length)
   {
    this.currPos += 1;
   }
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
  }
  function shiftUntilPast(callback)
  {
   this.shiftUntil.apply(this, arguments);
   this.shift();
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
   lookAhead : lookAhead,
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

