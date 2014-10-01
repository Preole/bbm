(function (){
"use strict";

var utils = require("./utils.js"),
WS = "[ \\t\\u00a0\\u1680\\u180e\\u2000-\\u200a\\u202f\\u205f\\u3000]",
NL = "[\\v\\f\\n\u0085\u2028\u2029]|\\r\\n?",
EOL = "(?=" + NL + "|$)",

RULES = (function (){
return [
 Rule("ESCAPE"   , "\\\\[\\S\\s]"),
 Rule("TH"       , "!!" + WS),
 Rule("TD"       , "\\|\\|" + WS),
 Rule("TRSEP"    , "\\|[=]+" + EOL),
 Rule("ATX_END"  , "=+" + EOL),
 Rule("ATX"      , "=+"),
 Rule("HR"       , "---[\\-]+" + EOL),
 Rule("COMMENT"  , "///[/]+" + EOL),
 Rule("CLASS"    , "\\.\\." + WS),
 Rule("ID"       , "\\." + WS),
 Rule("GT"       , ">"),
 Rule("REF"      , ":{"),
 Rule("REF_END"  , "}:"),
 Rule("DD"       , ":" + WS),
 Rule("DT"       , ";" + WS),
 Rule("OL"       , "[0-9]+\\." + WS),
 Rule("OL"       , "#\\." + WS),
 Rule("DIV"      , "\\*\\*\\*[*]+" + EOL),
 Rule("UL"       , "[\\-\\+\\*\\u2022\\u2043]" + WS),
 Rule("PRE"      , "\\\"\\\"[\\\"]+" + EOL),
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
 Rule("NL"       , NL),
 Rule("WS"       , WS + "+")
];
}()),

ENUM = RULES.reduce(reduceRulesTypes, {TEXT : "TEXT"}),
REGEX = new RegExp(RULES.map(mapRules).join("|"), "g"),
RENL = new RegExp(NL);



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

//Treat prohibited token types as plain text.
function updateDisallowed(token)
{
 if (this.indexOf(token.type) > -1)
 {
  token.type = ENUM.TEXT;
 }
}

//Returns a Lexical Token object; No prototypes.
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
 while (Array.isArray(res = regex.exec(strInput)))
 {
  ruleObj = RULES[res.indexOf(res[0], 1) - 1];

  if (lastPos < res.index)
  {
   tokens.push(LexToken(strInput.slice(lastPos, res.index), ENUM.TEXT));
  }
  tokens.push(LexToken(res[0], ruleObj ? ruleObj.name : ENUM.TEXT));

  if (lastPos > regex.lastIndex)
  {
   regex.lastIndex += 1;
  }
  lastPos = regex.lastIndex;
 }

 if (lastPos < strInput.length)
 {
  tokens.push(LexToken(strInput.slice(lastPos), ENUM.TEXT));
 }
 
 tokens.forEach(updateLinesCols);
 if (Array.isArray(disallowed) && disallowed.length > 0)
 {
  tokens.forEach(updateDisallowed, disallowed);
 }
 
 return tokens;
}


module.exports = utils.extend(Lexer, {ENUM : ENUM});
}());


