
(function (){
"use strict";

var BBM = require("./BBM.js");

/*
Public Method: Constructor
--------------------------
*/

function Lexer(tokens, options)
{
 //TODO: Refactor away side effect first.
}

BBM.Lexer = Lexer;
BBM.extend(Lexer,
{
 ENUM : ENUM,
 REGEX : REGEX,
 prototype :
 {
  each : each,
  reduce : reduce,
  peekAt : peekAt,
  peek : peek,
  peekT : peekT,
  isLineStart : isLineStart,
  isLineEnd : isLineEnd,
  isMatchDelim : isMatchDelim,
  shift : shift,
  shiftUntil : shiftUntil,
  shiftUntilPast : shiftUntilPast,
  slice : slice,
  sliceText : sliceText
 }
});


}());