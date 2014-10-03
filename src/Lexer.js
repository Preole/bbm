(function (){
"use strict";

var __ = require("./__.js"),


/*
Private methods: Lexing
-----------------------
*/

WS = "[ \\t\\u00a0\\u1680\\u180e\\u2000-\\u200a\\u202f\\u205f\\u3000]",
NL = "[\\v\\f\\n\u0085\u2028\u2029]|\\r\\n?",
EOL = "(?=" + NL + "|$)",
EMPTY = _LexToken(),

RULES = (function (){
return [
 _Rule("ESCAPE"   , "\\\\[\\S]"),
 _Rule("TH"       , "!!" + WS),
 _Rule("TD"       , "\\|\\|" + WS),
 _Rule("TRSEP"    , "\\|[=]+" + EOL),
 _Rule("ATX_END"  , "=+" + EOL),
 _Rule("ATX"      , "=+"),
 _Rule("HR"       , "---[\\-]+" + EOL),
 _Rule("COMMENT"  , "///[/]+" + EOL),
 _Rule("CLASS"    , "\\.\\." + WS),
 _Rule("ID"       , "\\." + WS),
 _Rule("GT"       , ">"),
 _Rule("REF"      , ":{"),
 _Rule("REF_END"  , "}:"),
 _Rule("DD"       , ":" + WS),
 _Rule("DT"       , ";" + WS),
 _Rule("OL"       , "[0-9]+\\." + WS),
 _Rule("OL"       , "#\\." + WS),
 _Rule("DIV"      , "\\*\\*\\*[*]+" + EOL),
 _Rule("UL"       , "[\\-\\+\\*\\u2022\\u2043]" + WS),
 _Rule("PRE"      , "\\\"\\\"[\\\"]+" + EOL),
 _Rule("CODE"     , "\\\"\\\"[\\\"]+"),
 _Rule("DEL"      , "{--"),
 _Rule("DEL_END"  , "--}"),
 _Rule("BOLD"     , "\\*\\*"),
 _Rule("INS"      , "\\{\\+\\+"),
 _Rule("INS_END"  , "\\+\\+\\}"),
 _Rule("SUP"      , "\\^\\^"),
 _Rule("SUB"      , ",,"),
 _Rule("UNDER"    , "__"),
 _Rule("EM"       , "''"),
 _Rule("LINK_EXT" , "\\?<"),
 _Rule("LINK_IMG" , "!<"),
 _Rule("LINK_WIKI", "#<"),
 _Rule("LINK_INT" , "#\\["),
 _Rule("LINK_CONT", "\\-\\["),
 _Rule("BRACKET_R", "\\]"),
 _Rule("NL"       , NL),
 _Rule("WS"       , WS + "+")
];
}()),

ENUM = RULES.reduce(_reduceRulesTypes, {TEXT : "TEXT"}),
RENL = new RegExp(NL),
REGEX = new RegExp(RULES.map(_mapRules).join("|"), "g");

function _Rule(name, pattern)
{
 return {name : name, pattern : pattern};
}

function _mapRules(rule)
{
 return "(" + rule.pattern + ")";
}

function _reduceRulesTypes(acc, rule)
{
 acc[rule.name] = rule.name;
 return acc;
}

//Returns a Lexical Token object.
function _LexToken(lexeme, type, col, line)
{
 return {
  lexeme : lexeme || "",
  type : type || "",
  col : col || -1,
  line : line || -1
 };
}

//Returns an array of Lexical Tokens (Plain objects)
function _Lexer(strInput)
{
 var res = null,
  ruleObj = null,
  regex = new RegExp(REGEX),
  tokens = [],
  lastPos = 0;
 
 regex.lastIndex = 0;
 while (Array.isArray(res = regex.exec(strInput)))
 {
  ruleObj = RULES[res.indexOf(res[0], 1) - 1];

  if (lastPos < res.index)
  {
   tokens.push(_LexToken(strInput.slice(lastPos, res.index), ENUM.TEXT));
  }
  tokens.push(_LexToken(res[0], ruleObj ? ruleObj.name : ENUM.TEXT));

  if (lastPos > regex.lastIndex)
  {
   regex.lastIndex += 1;
  }
  lastPos = regex.lastIndex;
 }

 if (lastPos < strInput.length)
 {
  tokens.push(_LexToken(strInput.slice(lastPos), ENUM.TEXT));
 }
 
 return tokens;
}


/*
Private methods: slice & sliceText
----------------------------------
*/

function _slice(tok, index, tokens)
{
 var minCol = Number(this) || 0,
  prev = tokens[index - 1];

 if (tok.type === ENUM.WS && (!prev || prev.type === ENUM.NL))
 {
  tok.lexeme = tok.lexeme.slice(minCol);
 }
 return tok.lexeme.length > 0;
}

function _sliceText(tok, index, tokens)
{
 return tok.lexeme;
}

/*
Private methods: Iteration
--------------------------
*/

function _updateEscapes(token)
{
 if (token.type === ENUM.ESCAPE && token.lexeme.length > 1)
 {
  token.lexeme = token.lexeme.slice(1);
 }
}

function _updateLines(token, index, tokens)
{
 if (index === 0)
 {
  token.line = 0;
  token.col = 0;
  return;
 }
 var prevTok = tokens[index - 1],
  nlCount = prevTok.lexeme.split(RENL).length - 1;
  
 token.line = prevTok.line + nlCount;
 token.col = nlCount > 0 ? 0 : prevTok.col + prevTok.lexeme.length;
}





/*
Public Methods: peek
--------------------
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
 if (__.isObject(token))
 {
  return type === token.type;
 }
}

/*
Public Methods: peek extras
---------------------------
*/

function isLineStart()
{
 var prev1 = this.peek(-1),
  prev2 = this.peek(-2);
  
 return !prev1 || 
  prev1.type === ENUM.NL || 
  prev1.type === ENUM.WS && (!prev2 || prev2.type === ENUM.NL);
}

function isLineEnd()
{
 var now = this.peek(),
  next = this.peek(1);
  
 return !now || 
  now.type === ENUM.NL ||
  now.type === ENUM.WS && (!next || next.type === ENUM.NL);
}

function isMatchDelim(start)
{
 var now = (this.peek() || EMPTY);
 return start.type === now.type && 
  start.lexeme.length === now.lexeme.length &&
  start.col === now.col && this.isLineStart();
}





/*
Public Methods: shift
---------------------
*/

function shift()
{
 this.currPos += 1;
 return this.currPos;
}

function shiftUntil(callback)
{
 var params = __.toArray(arguments, 1),
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
 return this.shift();
}






/*
Public Methods: slice
---------------------
*/

function slice(fromPos, toPos, minCol)
{
 var tokens = this.tokens.slice(fromPos, toPos);
 if (__.isNumber(minCol) && minCol > 0)
 {
  tokens = tokens.filter(_slice, minCol);
 }
 return tokens;
}

function sliceText(fromPos, toPos, minCol)
{
 return this.slice(fromPos, toPos, minCol).map(_sliceText).join("");
}



/*
Public Methods: Iteration
-------------------------
*/

function each(callback, thisArg)
{
 this.tokens.forEach(function (token, index, tokens){
  callback.call(thisArg, token, index, tokens);
 });
 return this;
}

function reduce(callback, acc, thisArg)
{
 this.each(function (token, index, tokens){
  acc = callback.call(thisArg, acc, token, index, tokens);
 });
 return acc;
}


/*
Public Method: Constructor
--------------------------
*/

function Lexer(tokens, options)
{
 if (!(this instanceof Lexer))
 {
  return new Lexer(tokens, options);
 }
 this.tokens = __.isString(tokens) ? _Lexer(tokens) : tokens;
 this.currPos = 0; //Current token index
 this.currlvl = 0; //Current nesting level
 this.options = __.isObject(options) ? options : {};
 return this.each(_updateLines).each(_updateEscapes);
}

module.exports = __.extend(Lexer,
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

