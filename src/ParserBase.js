
//Baseline Parser class. Implements token list traversal methods.
(function (){
 "use strict";

 function ParserBase()
 {
  throw new TypeError("Abstract class ParserBase is not to be instantiated.");
 }
 ParserBase.prototype = (function (){
  function reset(newOptions)
  {
   this.tokens = []; //Array of LexToken
   this.currPos = 0;
   this.nestLvl = 0;
   this.errMsgs = []; //Array of Strings. (Error Messages)
   if (typeof newOptions === "object" && newOptions !== null)
   {
    this.options = newOptions;
   }
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
   while (callback.apply(this, [this.lookAhead()].concat(params)))
   {
    this.shift();
   }
  }
  function shiftUntilPast(callback)
  {
   this.shiftUntil.apply(this, arguments);
   this.shift();
  }

  function shiftTo(toPos)
  {
   this.currPos = toPos || 0;
  }
  
  function sliceText(fromPos, toPos)
  {
   return this.tokens.slice(fromPos, toPos).reduce(doSliceText, "");
  }

  function doSliceText(acc, token)
  {
   return acc += typeof token === "object" ? (token.lexeme || "") : "";
  }

  return {
   reset : reset,
   lookAhead : lookAhead,
   shift : shift,
   shiftUntil : shiftUntil,
   shiftUntilPast : shiftPast,
   shiftTo : shiftTo,
   sliceText : sliceText
  };
 }());
 
 if (typeof module === "object" && module.exports)
 {
  module.exports = ParserBase;
 }
}());

