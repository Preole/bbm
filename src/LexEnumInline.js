
(function (){
 "use strict";
 
 var RULES = (function (){
 return [
  {
   pattern : "\\\\.",
   name : "ESCAPE"
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

}());
