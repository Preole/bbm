
(function (){
"use strict";

var utils = require("./utils.js"),

STREX = {
 WS : "[ \\t\\u2000-\\u200d\\u205f\\u1680\\u237d\\u2420\\u2422\\u2423\\u3000]",
 EOL : "(?=[\\v\\f\\n]|\\r\\n?|$)"
},

RULES = (function (){
return [
 Rule("ESCAPE"   , "\\\\[\\S\\s]"),
 Rule("TH"       , "!!" + STREX.WS),
 Rule("TD"       , "\\|\\|" + STREX.WS),
 Rule("TRSEP"    , "\\|[=]+" + STREX.EOL),
 Rule("ATX_END"  , "=+" + STREX.EOL),
 Rule("ATX"      , "=+"),
 Rule("HR"       , "---[\\-]+" + STREX.EOL),
 Rule("COMMENT"  , "///[/]+" + STREX.EOL),
 Rule("CLASS"    , "\\.\\." + STREX.WS),
 Rule("ID"       , "\\." + STREX.WS),
 Rule("GT"       , ">"),
 Rule("REF"      , ":{"),
 Rule("REF_END"  , "}:"),
 Rule("DD"       , ":" + STREX.WS),
 Rule("DT"       , ";" + STREX.WS),
 Rule("OL"       , "[0-9]+\\." + STREX.WS),
 Rule("OL"       , "#\\." + STREX.WS),
 Rule("DIV"      , "\\*\\*\\*[*]+" + STREX.EOL),
 Rule("UL"       , "[\\-\\+\\*\\u2022\\u2043]" + STREX.WS),
 Rule("PRE"      , "\\\"\\\"[\\\"]+" + STREX.EOL),
 Rule("CODE"     , "\\\"\\\"[\\\"]+"),
 Rule("DEL"      , "{--"),
 Rule("DEL_END"  , "--}"),
 Rule("BOLD"     , "\\*\\*"),
 Rule("INS"      , "\\{\\+\\+"),
 Rule("INS_END"  , "\\+\\+\\}"),
 Rule("SUP"      , "\\^\\^"),
 Rule("SUB"      , ",,"),
 Rule("UNDER"    , "__"),
 Rule("EM"       , "''"),
 Rule("LINK_EXT" , "\\?<"),
 Rule("LINK_IMG" , "!<"),
 Rule("LINK_WIKI", "#<"),
 Rule("LINK_INT" , "#\\["),
 Rule("LINK_CONT", "\\-\\["),
 Rule("BRACKET_R", "\\]"),
 Rule("NL"       , "[\\v\\f\\n]|\\r\\n?"),
 Rule("WS"       , STREX.WS + "+")
];
}()),

TYPES = RULES.reduce(reduceRulesTypes, {TEXT : "TEXT"}),
RENL = /[\v\f\n]|\r\n?/,
REGEX = new RegExp(RULES.map(mapRules).join("|"), "g");



function Rule(name, pattern)
{
 return {name : name, pattern : pattern};
}

function mapRules(rule)
{
 return "(" + rule.pattern + ")";
}

function reduceRulesTypes(acc, rule)
{
 acc[rule.name] = rule.name;
 return acc;
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



function Lexer(strInput, disallowed)
{
 var res = null,
  ruleObj = null,
  regex = new RegExp(REGEX),
  tokens = [],
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

if (typeof module === "object" && module.exports)
{
 Lexer.types = TYPES;
 module.exports = Lexer;
}

}());
