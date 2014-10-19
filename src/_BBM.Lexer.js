(function (){
"use strict";

var BBM = require("./BBM.js");


/*
Private methods: Lexing
-----------------------
*/

var WS = "[ \\t\\u00a0\\u1680\\u180e\\u2000-\\u200a\\u202f\\u205f\\u3000]";
var NL = "[\\v\\f\\n\u0085\u2028\u2029]|\\r\\n?";
var EOL = "(?=" + NL + "|$)";
var EMPTY = __LexToken();
var RULES =
[
  __Rule("ESCAPE"   , "\\\\[\\S]")
, __Rule("TH"       , "!!" + WS)
, __Rule("TD"       , "\\|\\|" + WS)
, __Rule("TRSEP"    , "\\|[=]+" + EOL)
, __Rule("ATX_END"  , "=+" + EOL)
, __Rule("ATX"      , "=+")
, __Rule("HR"       , "---[\\-]+" + EOL)
, __Rule("COMMENT"  , "///[/]+" + EOL)
, __Rule("CLASS"    , "\\.\\." + WS)
, __Rule("ID"       , "\\." + WS)
, __Rule("GT"       , ">")
, __Rule("REF"      , ":{")
, __Rule("REF_END"  , "}:")
, __Rule("DD"       , ":" + WS)
, __Rule("DT"       , ";" + WS)
, __Rule("OL"       , "[0-9]+\\." + WS)
, __Rule("OL"       , "#\\." + WS)
, __Rule("DIV"      , "\\*\\*\\*[*]+" + EOL)
, __Rule("UL"       , "[\\-\\+\\*\\u2022\\u2043]" + WS)
, __Rule("PRE"      , "\\\"\\\"[\\\"]+" + EOL)
, __Rule("CODE"     , "\\\"\\\"[\\\"]+")
, __Rule("DEL"      , "{--")
, __Rule("DEL_END"  , "--}")
, __Rule("BOLD"     , "\\*\\*")
, __Rule("INS"      , "\\{\\+\\+")
, __Rule("INS_END"  , "\\+\\+\\}")
, __Rule("SUP"      , "\\^\\^")
, __Rule("SUB"      , ",,")
, __Rule("UNDER"    , "__")
, __Rule("EM"       , "''")
, __Rule("LINK_EXT" , "\\?<")
, __Rule("LINK_IMG" , "!<")
, __Rule("LINK_WIKI", "#<")
, __Rule("LINK_INT" , "#\\[")
, __Rule("LINK_CONT", "\\-\\[")
, __Rule("BRACKET_R", "\\]")
, __Rule("NL"       , NL)
, __Rule("WS"       , WS + "+")
];

var ENUM = RULES.reduce(__reduceRulesTypes, {TEXT : "TEXT"});
var REGEX = new RegExp(RULES.map(__mapRules).join("|"), "g");



function __Rule(name, pattern)
{
 return {name : name, pattern : pattern};
}

function __mapRules(rule)
{
 return "(" + rule.pattern + ")";
}

function __reduceRulesTypes(acc, rule)
{
 acc[rule.name] = rule.name;
 return acc;
}

function __LexToken(lexeme, type, col)
{
 return {
   lexeme : lexeme || ""
 , type : type || ""
 , col : col || -1
 };
}

function __Lexer(strInput)
{
 var res = null;
 var regex = new RegExp(REGEX);
 var tokens = [];
 var lastPos = 0;
 
 while (BBM.isArray((res = regex.exec(strInput))))
 {
  var ruleObj = RULES[res.indexOf(res[0], 1) - 1] || EMPTY;
  if (lastPos < res.index)
  {
   tokens.push(__LexToken(strInput.slice(lastPos, res.index), ENUM.TEXT));
  }
  tokens.push(__LexToken(res[0], ruleObj.name));

  if (lastPos > regex.lastIndex)
  {
   regex.lastIndex += 1;
  }
  lastPos = regex.lastIndex;
 }

 if (lastPos < strInput.length)
 {
  tokens.push(__LexToken(strInput.slice(lastPos), ENUM.TEXT));
 }
 
 return tokens;
}




/*
Private methods: sliceText
--------------------------
*/

function __sliceText(tok, index, tokens)
{
 var minCol = this, prev = tokens[index - 1];
 if (minCol > 0 && tok.type === ENUM.WS && (!prev || prev.type === ENUM.NL))
 {
  return tok.lexeme.slice(minCol);
 }
 return tok.lexeme;
}

/*
Private methods: Iteration
--------------------------
*/

function __updateEscapes(tok)
{
 if (tok.type === ENUM.ESCAPE && tok.lexeme.length > 1)
 {
  tok.lexeme = tok.lexeme.slice(1);
 }
}

function __updateLines(tok, index, toks)
{
 if (index === 0)
 {
  tok.col = 0;
  return;
 }
 var prev = toks[index - 1];
 tok.col = prev.type === ENUM.NL ? 0 : prev.col + prev.lexeme.length;
}





/*
Public Methods: peek
--------------------
*/

function peek(offset)
{
 return this._tokens[this.pos + (Number(offset) || 0)];
}

function peekT(type, offset)
{
 return (this.peek(offset) || EMPTY).type === type;
}

function peekUntil(callback, extras)
{
 return this._tokens[this.nextUntil(callback, extras)];
}

/*
Public Methods: peek extras
---------------------------
*/

function isLineStart(offset)
{
 var off = Number(offset) || 0;
 var prev1 = this.peek(off - 1);
 var prev2 = this.peek(off - 2);
  
 return !prev1
 || prev1.type === ENUM.NL
 || prev1.type === ENUM.WS
 && (!prev2 || prev2.type === ENUM.NL);
}

function isLineEnd(offset)
{
 var off = Number(offset) || 0;
 var now = this.peek(off);
 var next = this.peek(off + 1);
  
 return !now
 || now.type === ENUM.NL 
 || now.type === ENUM.WS
 && (!next || next.type === ENUM.NL);
}

function isMatchDelim(currTok, sTok)
{
 var now = (currTok || this.peek() || EMPTY);
 return now !== EMPTY
 && sTok.type === now.type
 && sTok.lexeme === now.lexeme
 && sTok.col === now.col
 && this.isLineStart();
}




/*
Public Methods: next
--------------------
*/

function next()
{
 return this.pos += 1;
}

function nextUntil(callback, extras)
{
 while (this.peek() && !callback.call(this, this.peek(), extras))
 {
  this.next();
 }
 return this.pos;
}

function nextPast(callback, extras)
{
 this.nextUntil(callback, extras);
 return this.next();
}

/*
Public Methods: pop
-------------------
*/

function popUntil(callback, extras)
{
 while (this.last() && !callback.call(this, this.last(), extras))
 {
  this._tokens.pop();
 }
 return this;
}


/*
Public Methods: last, first
---------------------------
*/

function last()
{
 return this._tokens[this._tokens.length - 1];
}

function first()
{
 return this._tokens[0];
}

/*
Public Methods: iteration
-------------------------
*/

function each(callback, thisArg)
{
 this._tokens.forEach(callback, thisArg);
 return this;
}



/*
Public Methods: slice
---------------------
*/

function slice(fromPos, toPos, minCol)
{
 return Lexer(this._tokens.slice(fromPos, toPos), this.options, minCol);
}

function sliceText(fromPos, toPos, minCol)
{
 var col = Number(minCol) || Number(this._minCol) || 0;
 return this._tokens.slice(fromPos, toPos).map(__sliceText, col).join("");
}



/*
Public Method: Constructor
--------------------------
*/

function Lexer(tokens, options, minCol)
{
 var obj = Object.create(Lexer.prototype);
 obj._tokens = BBM.isString(tokens) ? __Lexer(tokens) : tokens;
 obj._minCol = Number(minCol) || 0;
 obj.pos = 0;
 obj.lvl = 0;
 obj.options = BBM.isObject(options) ? options : {};
 
 //TODO: If tokens is an Array of tokens or a Lexer instance...
 //TODO: Include reset button.
 if (BBM.isString(tokens))
 {
  obj._tokens.forEach(__updateLines);
  obj._tokens.forEach(__updateEscapes);
 }
 return obj;
}

function isLexer(obj)
{
 return Lexer.prototype.isPrototypeOf(obj);
}

module.exports = BBM.Lexer = BBM.extend(Lexer,
{
  ENUM : ENUM
, REGEX : REGEX
, isLexer : isLexer
, prototype :
  {
    peek : peek
  , peekUntil : peekUntil
  , peekT : peekT
  , sLineStart : isLineStart
  , isLineEnd : isLineEnd
  , isMatchDelim : isMatchDelim

  , next : next
  , nextUntil : nextUntil
  , nextPast : nextPast

  , popUntil : popUntil
  , first : first
  , last : last
  , each : each

  , slice : slice
  , sliceText : sliceText
  }
});

}());

