
(function (global){
 "use strict";
 var STREX =
 {
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
   pattern : "===[=]+" + "(?=" + STREX.NL + ")",
   name : "ATX_END" //Also used as Setext H1
  },
  {
   pattern : "===[=]+",
   name : "ATX_START"
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
   pattern : ">" + STREX.WS,
   name : "BLOCKQUOTE"
  },
  {
   pattern : ":{",
   name : "REF_START"
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
   pattern : "\\*\\*\\*[*]+",
   name : "ASIDE"
  },
  {
   pattern : "[\\-\\+\\*\\u2022\\u2043]" + STREX.WS,
   name : "UL"
  },
  {
   pattern : "\\\"\\\"[\\\"]+",
   name : "CODE"
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
 
 
 var expose = {
  types : TYPES,
  rules : RULES
 };
 
 if (typeof module === "object" && module.exports)
 {
  module.exports = expose;
 }
 else
 {
  global.LexEnumBlock = expose;
 }

}(this));
