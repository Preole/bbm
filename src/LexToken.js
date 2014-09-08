
(function (global){
 "use strict";

 function LexToken(lexeme, type, col)
 {
  this.lexeme = lexeme || "";
  this.type = type || "";
  this.col = col || -1;
 }
 
 function create(lexeme, type, col)
 {
  return new LexToken(lexeme, type, col);
 }

 LexToken.create = create;
 LexToken.prototype = (function (){
  function isType(typeStr)
  {
   return this.type === type;
  }
  function isSameType(lexToken)
  {
   return lexToken instanceof LexToken && this.type === lexToken.type;
  }
  return {
   isType : isType,
   isSameType : isSameType
  };
 }());

 if (typeof module === "object" && module.exports)
 {
  module.exports = LexToken;
 }
}(this));
