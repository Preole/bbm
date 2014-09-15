
(function (){
"use strict";
var LexToken = require("./LexToken.js");

var STREX = {
 WS : "[ \\t\\u2000-\\u200d\\u205f\\u1680\\u237d\\u2420\\u2422\\u2423\\u3000]",
 NL : "[\\v\\f\\n]|\\r\\n?"
};

var RULES = (function (){
return [
 {
  pattern : "\\\\.",
  name : "ESCAPE"
 },
 {
  pattern : "!!" + STREX.WS,
  name : "TH"
 },
 {
  pattern : "\\|\\|" + STREX.WS,
  name : "TD"
 },
 {
  pattern : "\\|[=]+",
  name : "TRSEP"
 },
 {
  pattern : "=+" + "(?=" + STREX.NL + ")",
  name : "ATX_END" //Also used as Setext H1
 },
 {
  pattern : "=+",
  name : "ATX"
 },
 {
  pattern : "---[\\-]+" + "(?=" + STREX.NL + ")",
  name : "HR" //Also used as Setext H2
 },
 {
  pattern : "///[/]+",
  name : "COMMENT"
 },
 {
  pattern : "\\.\\." + STREX.WS,
  name : "CLASS"
 },
 {
  pattern : "\\." + STREX.WS,
  name : "ID"
 },
 {
  pattern : ">",
  name : "GT"
 },
 {
  pattern : ":{",
  name : "REF"
 },
 {
  pattern : "}:",
  name : "REF_END"
 },
 {
  pattern : ":" + STREX.WS,
  name : "DD"
 },
 {
  pattern : ";" + STREX.WS,
  name : "DT"
 },
 {
  pattern : "#\\." + STREX.WS + "|" + "[0-9]+\\." + STREX.WS,
  name : "OL"
 },
 {
  pattern : "\\*\\*\\*[*]+" + "(?=" + STREX.NL + ")",
  name : "DIV"
 },
 {
  pattern : "[\\-\\+\\*\\u2022\\u2043]" + STREX.WS,
  name : "UL"
 },
 {
  pattern : "\\\"\\\"[\\\"]+" + "(?=" + STREX.NL + ")",
  name : "PRE"
 },
 {
  pattern : "\\\"\\\"[\\\"]+",
  name : "CODE"
 },
 {
  pattern : "{--",
  name : "DEL"
 },
 {
  pattern : "--}",
  name : "DEL_END"
 },
 {
  pattern : "\\*\\*",
  name : "BOLD"
 },
 {
  pattern : "\\{\\+\\+",
  name : "INS"
 },
 {
  pattern : "\\+\\+\\}",
  name : "INS_END"
 },
 {
  pattern : "\\^\\^",
  name : "SUP"
 },
 {
  pattern : ",,",
  name : "SUB"
 },
 {
  pattern : "__",
  name : "UNDER"
 },
 {
  pattern : "''",
  name : "EM"
 },
 {
  pattern : "\\?<",
  name : "LINK_EXT"
 },
 {
  pattern : "!<",
  name : "LINK_IMG"
 },
 {
  pattern : "#<",
  name : "LINK_WIKI"
 },
 {
  pattern : "#\\[",
  name : "LINK_INT"
 },
 {
  pattern : "\\-\\[",
  name : "LINK_CONT"
 },
 {
  pattern : "\\]",
  name : "BRACKET_R"
 },
 {
  pattern : "[\\v\\f\\n]|\\r\\n?",
  name : "NL"
 },
 {
  pattern : STREX.WS + "+",
  name : "WS"
 }
];
}());

var TYPES = RULES.reduce(function (acc, rule){
 acc[rule.name] = rule.name;
 return acc;
}, {TEXT : "TEXT"});


function makeRegex()
{
 var regexStrList = RULES.map(function (rule){
  return "(" + rule.pattern + ")";
 });
 
 return new RegExp(regexStrList.join("|"), "g");
}

function Lexer()
{
 this.regex = makeRegex();
}

function create()
{
 return new Lexer();
}

function parse(strInput)
{
 var res = null,
  ruleObj = null,
  regex = this.regex,
  tokens = [],
  lastPos = 0;
 
 regex.lastIndex = 0;
 while ((res = regex.exec(strInput)) instanceof Array)
 {
  ruleObj = RULES[res.indexOf(res[0], 1) - 1];

  if (lastPos < res.index)
  {
   tokens.push(LexToken.create(
    strInput.slice(lastPos, res.index),
    TYPES.TEXT
   ));
  }

  tokens.push(LexToken.create(
   res[0],
   ruleObj ? ruleObj.name : TYPES.TEXT
  ));

  if (lastPos > regex.lastIndex)
  {
   regex.lastIndex += 1;
  }
 }

 if (lastPos < strInput.length)
 {
  tokens.push(LexToken.create(
   strInput.slice(lastPos),
   TYPES.TEXT
  ));
 }
 
 tokens.forEach(updateEscape);
 tokens.forEach(updateLinesCols);

 return tokens;
}

function updateLinesCols(token, index, tokens)
{
 if (index === 0)
 {
  token.line = 0;
  token.col = 0;
  return;
 }
 var prevTok = tokens[index - 1],
  reNL = /[\v\f\n]|\r\n?/,
  nlCount = prevTok.lexeme.split(reNL).length - 1;
  
 token.line = prevTok.line + nlCount;
 token.col = nlCount > 0 ? 0 : prevTok.col + prevTok.lexeme.length;
}

function updateEscape(token, index)
{
 token.lexeme = token.lexeme.replace(/\\(.)/g, "$1");
}



Lexer.create = create;
Lexer.types = TYPES;
Lexer.prototype.parse = parse;

if (typeof module === "object" && module.exports)
{
 module.exports = Lexer;
}
}());
