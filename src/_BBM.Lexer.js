(function (){
"use strict";

var BBM = require("./BBM.js"),


/*
Private methods: Lexing
-----------------------
*/

WS = "[ \\t\\u00a0\\u1680\\u180e\\u2000-\\u200a\\u202f\\u205f\\u3000]",
NL = "[\\v\\f\\n\u0085\u2028\u2029]|\\r\\n?",
EOL = "(?=" + NL + "|$)",
ARRAY = [],
EMPTY = _LexToken(),

RULES = (function (){
return [
 __Rule("ESCAPE"   , "\\\\[\\S]"),
 __Rule("TH"       , "!!" + WS),
 __Rule("TD"       , "\\|\\|" + WS),
 __Rule("TRSEP"    , "\\|[=]+" + EOL),
 __Rule("ATX_END"  , "=+" + EOL),
 __Rule("ATX"      , "=+"),
 __Rule("HR"       , "---[\\-]+" + EOL),
 __Rule("COMMENT"  , "///[/]+" + EOL),
 __Rule("CLASS"    , "\\.\\." + WS),
 __Rule("ID"       , "\\." + WS),
 __Rule("GT"       , ">"),
 __Rule("REF"      , ":{"),
 __Rule("REF_END"  , "}:"),
 __Rule("DD"       , ":" + WS),
 __Rule("DT"       , ";" + WS),
 __Rule("OL"       , "[0-9]+\\." + WS),
 __Rule("OL"       , "#\\." + WS),
 __Rule("DIV"      , "\\*\\*\\*[*]+" + EOL),
 __Rule("UL"       , "[\\-\\+\\*\\u2022\\u2043]" + WS),
 __Rule("PRE"      , "\\\"\\\"[\\\"]+" + EOL),
 __Rule("CODE"     , "\\\"\\\"[\\\"]+"),
 __Rule("DEL"      , "{--"),
 __Rule("DEL_END"  , "--}"),
 __Rule("BOLD"     , "\\*\\*"),
 __Rule("INS"      , "\\{\\+\\+"),
 __Rule("INS_END"  , "\\+\\+\\}"),
 __Rule("SUP"      , "\\^\\^"),
 __Rule("SUB"      , ",,"),
 __Rule("UNDER"    , "__"),
 __Rule("EM"       , "''"),
 __Rule("LINK_EXT" , "\\?<"),
 __Rule("LINK_IMG" , "!<"),
 __Rule("LINK_WIKI", "#<"),
 __Rule("LINK_INT" , "#\\["),
 __Rule("LINK_CONT", "\\-\\["),
 __Rule("BRACKET_R", "\\]"),
 __Rule("NL"       , NL),
 __Rule("WS"       , WS + "+")
];
}()),

ENUM = RULES.reduce(__reduceRulesTypes, {TEXT : "TEXT"}),
RENL = new RegExp(NL, "g"),
REGEX = new RegExp(RULES.map(__mapRules).join("|"), "g");



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

//Returns a Lexical Token object.
function __LexToken(lexeme, type, col, line)
{
 return {
  lexeme : lexeme || "",
  type : type || "",
  col : col || -1,
  line : line || -1
 };
}

//Returns an array of Lexical Tokens (Plain objects)
function __Lexer(strInput)
{
 var res = null,
  ruleObj = null,
  regex = new RegExp(REGEX),
  tokens = [],
  lastPos = 0;
 
 regex.lastIndex = 0;
 while (BBM.isArray(res = regex.exec(strInput)))
 {
  ruleObj = RULES[res.indexOf(res[0], 1) - 1];

  if (lastPos < res.index)
  {
   tokens.push(__LexToken(strInput.slice(lastPos, res.index), ENUM.TEXT));
  }
  tokens.push(__LexToken(res[0], ruleObj ? ruleObj.name : ENUM.TEXT));

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

function __updateEscapes(token)
{
 if (token.type === ENUM.ESCAPE && token.lexeme.length > 1)
 {
  token.lexeme = token.lexeme.slice(1);
 }
}

function __updateLines(token, index, tokens)
{
 if (index === 0)
 {
  token.line = 0;
  token.col = 0;
  return;
 }
 var prevTok = tokens[index - 1],
  nlCount = (prevTok.lexeme.match(new RegExp(RENL)) || ARRAY).length;
  
 token.line = prevTok.line + nlCount;
 token.col = nlCount > 0 ? 0 : prevTok.col + prevTok.lexeme.length;
}





/*
Public Methods: peek
--------------------
*/

function peek(offset)
{
 return this._tokens[this.currPos + (Number(offset) || 0)];
}

function peekT(type, offset)
{
 var token = this.peek(offset);
 if (BBM.isObject(token))
 {
  return type === token.type;
 }
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
 var off = Number(offset) || 0,
  prev1 = this.peek(off - 1),
  prev2 = this.peek(off - 2);
  
 return !prev1 || 
  prev1.type === ENUM.NL || 
  prev1.type === ENUM.WS && (!prev2 || prev2.type === ENUM.NL);
}

function isLineEnd(offset)
{
 var off = Number(offset) || 0,
  now = this.peek(off),
  next = this.peek(off + 1);
  
 return !now || 
  now.type === ENUM.NL ||
  now.type === ENUM.WS && (!next || next.type === ENUM.NL);
}

function isMatchDelim(sTok)
{
 var now = (this.peek() || EMPTY);
 return sTok.type === now.type && 
  sTok.lexeme.length === now.lexeme.length &&
  sTok.col === now.col && this.isLineStart();
}




/*
Public Methods: next
--------------------
*/

function next()
{
 this.currPos += 1;
 return this.currPos;
}

function nextUntil(callback, extras)
{
 var token = null;
 while ((token = this.peek()) && !callback.call(this, token, extras))
 {
  this.next();
 }
 return this.currPos;
}

function nextUntilPast(callback, extras)
{
 this.nextUntil(callback, extras);
 return this.next();
}

/*
Public Methods: pop
-------------------
*/

function pop()
{
 this._tokens.pop();
 return this;
}

function popUntil(callback, extras)
{
 var token = null;
 while ((token = this.last()) && !callback.call(this, token, extras))
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

function each(callback, acc, thisArg)
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
 obj.currPos = 0;
 obj.currlvl = 0;
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
 ENUM : ENUM,
 REGEX : REGEX,
 isLexer : isLexer,
 prototype :
 {
  pop : pop,
  popUntil : popUntil,
  first : first,
  last : last,
  
  each : each,
  
  peek : peek,
  peekUntil : peekUntil,
  peekT : peekT,
  isLineStart : isLineStart,
  isLineEnd : isLineEnd,
  isMatchDelim : isMatchDelim,
  
  next : next,
  nextUntil : nextUntil,
  nextUntilPast : nextUntilPast,
  
  slice : slice,
  sliceText : sliceText
 }
});

}());

