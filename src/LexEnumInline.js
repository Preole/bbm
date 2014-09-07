
(function (global){
 "use strict";
 var STREX =
 {
  WS : "[ \\t\\u2000-\\u200d\\u205f\\u1680\\u237d\\u2420\\u2422\\u2423\\u3000]",
  CTRL : "[\\u0000-\\u0008\\u000e-\\u001f\\u007f-\\u009f\\u2028\\u2029]"
 };

 var RULES = (function (){
 return [
  {
   pattern : "\\\\" + STREX.CTRL.replace("[", "[^"),
   name : "TEXT"
  },
  {
   pattern : "{--",
   name : "DEL_START"
  },
  {
   pattern : "--}",
   name : "DEL_END"
  },
  {
   pattern : ">",
   name : "LINK_END"
  },
  {
   pattern : "\\*\\*",
   name : "BOLD"
  },
  {
   pattern : "\\{\\+\\+",
   name : "INS_START"
  },
  {
   pattern : "\\+\\+\\}",
   name : "INS_END"
  },
  {
   pattern : "\\\"\\\"[\\\"]+",
   name : "CODE"
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
 }, {});
 
 
 var expose = {
  types : TYPES,
  rules : RULES
 };
 
 if (typeof module === "object" && typeof module.exports === "object")
 {
  module.exports = expose;
 }
 else
 {
  global.LexEnumInline = expose;
 }

}(this));
