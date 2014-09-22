
(function (){
"use strict";

var utils = require("./utils.js"),

STREX = {
 WS : "[ \\t\\u2000-\\u200d\\u205f\\u1680\\u237d\\u2420\\u2422\\u2423\\u3000]",
 EOL : "(?=[\\v\\f\\n]|\\r\\n?|$)"
},

RULES = (function (){
return [
 {
  pattern : "\\\\[\\S\\s]",
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
  pattern : "\\|[=]+" + STREX.EOL,
  name : "TRSEP"
 },
 {
  pattern : "=+" + STREX.EOL,
  name : "ATX_END" //Also used as Setext H1
 },
 {
  pattern : "=+",
  name : "ATX"
 },
 {
  pattern : "---[\\-]+" + STREX.EOL,
  name : "HR" //Also used as Setext H2
 },
 {
  pattern : "///[/]+" + STREX.EOL,
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
  pattern : "\\*\\*\\*[*]+" + STREX.EOL,
  name : "DIV"
 },
 {
  pattern : "[\\-\\+\\*\\u2022\\u2043]" + STREX.WS,
  name : "UL"
 },
 {
  pattern : "\\\"\\\"[\\\"]+" + STREX.EOL,
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
}()),

TYPES = RULES.reduce(function (acc, rule){
 acc[rule.name] = rule.name;
 return acc;
}, {TEXT : "TEXT"}),

RENL = /[\v\f\n]|\r\n?/;

function makeRegex()
{
 var regexStrList = RULES.map(function (rule){
  return "(" + rule.pattern + ")";
 });
 
 return new RegExp(regexStrList.join("|"), "g");
}

//Add line and column information into tokens.
function updateLinesCols(token, index, tokens)
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

//Remove leading backslash on escape tokens.
function updateEscape(token, index)
{
 if (token.type === TYPES.ESCAPE)
 {
  token.lexeme = token.lexeme.slice(1);
 }
}

//Treat prohibited token types as plain text.
function updateDisallowed(token)
{
 if (this.indexOf(token.type) > -1)
 {
  token.type = TYPES.TEXT;
 }
}




function LexToken(lexeme, type, col, line)
{
 return {
  lexeme : lexeme || "",
  type : type || "",
  col : col || -1,
  line : line || -1
 };
}

function Lexer(options)
{
 this.regex = makeRegex();
 this.options = utils.extend({}, options);
}

function create(options)
{
 return new Lexer(options);
}

function parse(strInput)
{
 var res = null,
  ruleObj = null,
  regex = this.regex,
  tokens = [],
  disallowed = this.options.disallowed,
  lastPos = 0;
 
 regex.lastIndex = 0;
 while ((res = regex.exec(strInput)) instanceof Array)
 {
  ruleObj = RULES[res.indexOf(res[0], 1) - 1];

  if (lastPos < res.index)
  {
   tokens.push(LexToken(strInput.slice(lastPos, res.index), TYPES.TEXT));
  }
  tokens.push(LexToken(res[0], ruleObj ? ruleObj.name : TYPES.TEXT));

  if (lastPos > regex.lastIndex)
  {
   regex.lastIndex += 1;
  }
  lastPos = regex.lastIndex;
 }

 if (lastPos < strInput.length)
 {
  tokens.push(LexToken(strInput.slice(lastPos), TYPES.TEXT));
 }
 
 tokens.forEach(updateEscape);
 tokens.forEach(updateLinesCols);
 if (disallowed instanceof Array && disallowed.length > 0)
 {
  tokens.forEach(updateDisallowed, disallowed);
 }
 
 return tokens;
}

function reset(newOptions)
{
 this.options = utils.extend(this.options, newOptions);
}

Lexer.create = create;
Lexer.types = TYPES;
Lexer.prototype.parse = parse;
Lexer.prototype.reset = reset;

if (typeof module === "object" && module.exports)
{
 module.exports = Lexer;
}
}());
