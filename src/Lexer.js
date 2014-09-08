
(function (global){
 "use strict";
 var LexToken = require("./LexToken.js");
 
 function makeRegex(rulesArray)
 {
  var regexStrList = rulesArray.map(function (rule){
   return "(" + rule.pattern + ")";
  });
  
  return new RegExp(regexStrList.join("|"), "g");
 }

 function Lexer(rulesArray, defaultType)
 {
  this.rules = rulesArray;
  this.regex = makeRegex(rulesArray);
  this.defType = defaultType;
 }
 
 function create(rulesArray)
 {
  return new Lexer(rulesArray);
 }
 
 function parse(strInput)
 {
  var res = void(0),
   ruleObj = void(0),
   rules = this.rules,
   regex = this.regex,
   defType = this.defType,
   tokens = [],
   lastPos = 0;
  
  regex.lastIndex = 0;
  while ((res = regex.exec(strInput)) instanceof Array)
  {
   ruleObj = rules[res.indexOf(res[0], 1) - 1];

   if (lastPos < res.index)
   {
    tokens.push(LexToken.create(
     strInput.slice(lastPos, res.index),
     defType
    ));
   }

   tokens.push(LexToken.create(
    res[0],
    ruleObj ? ruleObj.name : defType
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
    defType
   ));
  }
  return tokens;
 }

 Lexer.create = create;
 Lexer.prototype.parse = parse;

 if (typeof module === "object" && module.exports)
 {
  module.exports = Lexer;
 }
 else
 {
  global.Lexer = Lexer;
 }
}(this));
