
"use strict";

var Lexer = module.exports = (function (){

var RULES = (function (){

 var WS = "[ \\t\\u00a0\\u1680\\u180e\\u2000-\\u200a\\u202f\\u205f\\u3000]";
 var NL = "[\\v\\f\\n\u0085\u2028\u2029]|\\r\\n?";
 var EOL = "(?=" + NL + "|$)";
 var Rule = function (name, pattern)
 {
  return {name : name, pattern : pattern};
 };

 return [
   Rule("ESCAPE"   , "\\\\[\\S]")
 , Rule("TH"       , "!!" + WS)
 , Rule("TD"       , "\\|\\|" + WS)
 , Rule("TRSEP"    , "\\|[=]+" + EOL)
 , Rule("ATX_END"  , "=+" + EOL)
 , Rule("ATX"      , "=+")
 , Rule("HR"       , "-{4,}" + EOL)
 , Rule("COMMENT"  , "/{4,}" + EOL)
 , Rule("CLASS"    , "\\.\\." + WS)
 , Rule("ID"       , "\\." + WS)
 , Rule("GT"       , ">")
 , Rule("REF"      , ":{")
 , Rule("REF_END"  , "}:")
 , Rule("DD"       , ":" + WS)
 , Rule("DT"       , ";" + WS)
 , Rule("DIV"      , "\\*{4,}" + EOL)
 , Rule("OL"       , "[0-9#]+\\." + WS)
 , Rule("UL"       , "[\\-\\+\\*\\u2022\\u2043]" + WS)
 , Rule("PRE"      , "`{3,}" + EOL)
 , Rule("CODE"     , "`+")
 , Rule("DEL"      , "--")
 , Rule("BOLD"     , "\\*{2}")
 , Rule("SUP"      , "\\^{2}")
 , Rule("SUB"      , ",,")
 , Rule("UNDER"    , "__")
 , Rule("EM"       , "''")
 , Rule("LINK_EXT" , "\\?<")
 , Rule("LINK_IMG" , "!<")
 , Rule("LINK_WIKI", "#<")
 , Rule("LINK_INT" , "#\\[")
 , Rule("LINK_CONT", "-\\[")
 , Rule("BRACKET_R", "\\]")
 , Rule("NL"       , NL)
 , Rule("WS"       , WS + "+")
 ];

}());

var REGEX = (function (){
 var regexStr = RULES.map(function (rule){
  return "(" + rule.pattern + ")";
 });
 
 return new RegExp(regexStr.join("|"), "g");
}());

var ENUM = (function (){
 var obj = {TEXT : "TEXT"};
 RULES.forEach(function (rule){
  obj[rule.name] = rule.name;
 });
 return obj;
}());

var LexToken = function (lexeme, type, col)
{
 return {lexeme : lexeme || "", type : type || "", col : col || 0};
};

var LexTokens = function (bbmStr)
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
   toks.push(LexToken(bbmStr.slice(pos, textEnd), ENUM.TEXT));
  }
  if (ruleObj)
  {
   toks.push(LexToken(res[0], ruleObj.name));
  }
  pos = res ? (regex.lastIndex += pos > regex.lastIndex ? 1 : 0) : textEnd;
 }
 
 toks.forEach(function (tok){
  if (tok.type === ENUM.ESCAPE && tok.lexeme.length > 1)
  {
   tok.lexeme = tok.lexeme.slice(1);
  }
 });
 
 toks.forEach(function (tok, index, tokens){
  var prev = tokens[index - 1];
  tok.col = (index === 0 || prev.type === ENUM.NL)
  ? 0
  : prev.col + prev.lexeme.length;
 });
 
 return toks;
};

var Lexer = function (bbmStr)
{
 var obj = Object.create(Lexer.prototype);
 obj._tokens = LexTokens(bbmStr);
 obj.minCol = 0;
 obj.mark = -1;
 obj.pos = 0;
 return obj;
};

Lexer.ENUM = ENUM;
return Lexer;
}());


Lexer.isLexer = function (obj)
{
 return Lexer.prototype.isPrototypeOf(obj);
};

Lexer.fn = (function (fn){
var ENUM = Lexer.ENUM;

fn.peek = function (offset)
{
 return this._tokens[this.pos + (offset || 0)];
};

fn.peekT = function (type, offset)
{
 return this.peek(offset) ? this.peek(offset).type === type : void(0);
};

fn.peekUntil = function (callback, extras)
{
 return this._tokens[this.nextUntil(callback, extras).pos];
};

fn.isLineStart = function (offset)
{
 var off = offset || 0;
 var prev1 = this.peek(off - 1);
 var prev2 = this.peek(off - 2);
  
 return !prev1
 || prev1.type === ENUM.NL
 || prev1.type === ENUM.WS && (!prev2 || prev2.type === ENUM.NL);
};

fn.isLineEnd = function (offset)
{
 var off = offset || 0;
 var now = this.peek(off);
 var next = this.peek(off + 1);
  
 return !now
 || now.type === ENUM.NL 
 || now.type === ENUM.WS && (!next || next.type === ENUM.NL);
};

fn.isDelim = function (currTok, sTok)
{
 var now = (currTok || this.peek());
 return now
 && sTok.type === now.type
 && sTok.lexeme === now.lexeme
 && sTok.col === now.col
 && this.isLineStart();
};

fn.size = function ()
{
 return this._tokens.length;
};

fn.next = function (offset)
{
 this.pos += offset || 1;
 return this;
};

fn.nextUntil = function (callback, extras)
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
};

fn.nextPast = function (callback, extras)
{
 this.nextUntil(callback, extras);
 return this.pos === this.mark ? this : this.next();
};

fn.textUntil = function (callback, extras, minCol)
{
 var self = this;
 var col = minCol || self.minCol || 0;
 var text = "";
 
 this.nextUntil(function (tok){
  if (callback.call(self, tok, extras))
  {
   return true;
  }
  
  text += col > 0 && tok.type === ENUM.WS && self.isLineStart()
  ? tok.lexeme.slice(col)
  : tok.lexeme;
 });
 
 return text;
};

fn.textPast = function (callback, extras, minCol)
{
 var text = this.textUntil(callback, extras, minCol);
 if (this.pos !== this.mark)
 {
  this.next();
 }
 return text;
};

return fn;
}(Lexer.prototype));

