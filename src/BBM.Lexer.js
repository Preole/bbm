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
, __Rule("HR"       , "/{4,}" + EOL)
, __Rule("COMMENT"  , "/{4,}" + EOL)
, __Rule("CLASS"    , "\\.\\." + WS)
, __Rule("ID"       , "\\." + WS)
, __Rule("GT"       , ">")
, __Rule("REF"      , ":{")
, __Rule("REF_END"  , "}:")
, __Rule("DD"       , ":" + WS)
, __Rule("DT"       , ";" + WS)
, __Rule("OL"       , "[0-9]+\\." + WS)
, __Rule("OL"       , "#\\." + WS)
, __Rule("DIV"      , "\\*{4,}" + EOL)
, __Rule("UL"       , "[\\-\\+\\*\\u2022\\u2043]" + WS)
, __Rule("PRE"      , "\"{3,}" + EOL)
, __Rule("CODE"     , "\"{3,}")
, __Rule("DEL"      , "--")
, __Rule("BOLD"     , "\\*{2}")
, __Rule("SUP"      , "\\^{2}")
, __Rule("SUB"      , ",,")
, __Rule("UNDER"    , "__")
, __Rule("EM"       , "''")
, __Rule("LINK_EXT" , "\\?<")
, __Rule("LINK_IMG" , "!<")
, __Rule("LINK_WIKI", "#<")
, __Rule("LINK_INT" , "#\\[")
, __Rule("LINK_CONT", "-\\[")
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

function __Lexer(bbmStr)
{
 var regex = new RegExp(REGEX);
 var toks = [];
 var pos = 0;
 
 while (pos < bbmStr.length)
 {
  var res = regex.exec(bbmStr);
  var ruleObj = RULES[res ? res.indexOf(res[0], 1) - 1 : -1];
  var textEnd = res ? res.index : bbmStr.length;
  
  if (pos < textEnd)
  {
   toks.push(__LexToken(bbmStr.slice(pos, textEnd), ENUM.TEXT));
  }
  if (ruleObj)
  {
   toks.push(__LexToken(res[0], ruleObj.name));
  }
  pos = res ? (regex.lastIndex += pos > regex.lastIndex ? 1 : 0) : textEnd;
 }
 return toks;
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

function __updateCols(tok, index, toks)
{
 var prev = toks[index - 1] || EMPTY;
 tok.col = (index === 0 || prev.type === ENUM.NL)
 ? 0
 : prev.col + prev.lexeme.length;
}





/*
Public Methods: peek
--------------------
*/

function peek(offset)
{
 return this._tokens[this.pos + (parseInt(offset, 10) || 0)];
}

function peekT(type, offset)
{
 return (this.peek(offset) || EMPTY).type === type;
}

function peekUntil(callback, extras)
{
 return this._tokens[this.nextUntil(callback, extras).pos];
}

/*
Public Methods: peek extras
---------------------------
*/

function isLineStart(offset)
{
 var off = parseInt(offset, 10) || 0;
 var prev1 = this.peek(off - 1);
 var prev2 = this.peek(off - 2);
  
 return !prev1
 || prev1.type === ENUM.NL
 || prev1.type === ENUM.WS && (!prev2 || prev2.type === ENUM.NL);
}

function isLineEnd(offset)
{
 var off = parseInt(offset, 10) || 0;
 var now = this.peek(off);
 var next = this.peek(off + 1);
  
 return !now
 || now.type === ENUM.NL 
 || now.type === ENUM.WS && (!next || next.type === ENUM.NL);
}

function isDelim(currTok, sTok)
{
 var now = (currTok || this.peek() || EMPTY);
 return now !== EMPTY
 && sTok.type === now.type
 && sTok.lexeme === now.lexeme
 && sTok.col === now.col
 && this.isLineStart();
}




/*
Public Methods: next, text
--------------------------
*/

function size()
{
 return this._tokens.length;
}

function next(offset)
{
 this.pos = Math.max(0, this.pos + (parseInt(offset, 10) || 1));
 return this;
}

function nextUntil(callback, extras)
{
 while (this.peek())
 {
  if (this.pos === this.mark || callback.call(this, this.peek(), extras))
  {
   break;
  }
  this.next();
 }
 return this;
}

function nextPast(callback, extras)
{
 this.nextUntil(callback, extras);
 return this.pos === this.mark ? this : this.next();
}

function textUntil(callback, extras, minCol)
{
 var col = Number(minCol) || Number(this.minCol) || 0;
 var text = "";
 
 this.nextUntil(function (tok){
  if (callback.call(this, tok, extras))
  {
   return true;
  }
  
  text += col > 0 && tok.type === ENUM.WS && this.isLineStart()
  ? tok.lexeme.slice(col)
  : tok.lexeme;
 });
 
 return text;
}

function textPast(callback, extras, minCol)
{
 var text = this.textUntil(callback, extras, minCol);
 if (this.pos !== this.mark)
 {
  this.next();
 }
 return text;
}



/*
Public Method: Constructor
--------------------------
*/

function Lexer(bbmStr, options)
{
 var obj = Object.create(Lexer.prototype);
 obj._tokens = __Lexer(bbmStr);
 obj.minCol = 0;
 obj.mark = -1;
 obj.pos = 0;
 obj.lvl = 0;
 obj.options = BBM.isObject(options) ? options : {};

 obj._tokens.forEach(__updateEscapes);
 obj._tokens.forEach(__updateCols);
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
  , isLineStart : isLineStart
  , isLineEnd : isLineEnd
  , isDelim : isDelim

  , size : size
  , next : next
  , nextUntil : nextUntil
  , nextPast : nextPast
  , textUntil : textUntil
  , textPast : textPast
  }
});

}());

