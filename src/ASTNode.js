
(function (){
 "use strict";
 function ASTNode(type, attr)
 {
  this.type = type || "";
  this.attr = attr || {};
  this.meta = {}; //TODO: Meta table the best way for auxilary data?
  this.nodes = [];
 }
 function create(type, attr)
 {
  return new ASTNode(type, attr);
 }

 ASTNode.create = create;
 ASTNode.prototype = (function (){
  function isType(typeStr)
  {
   return this.type === typeStr;
  }
  function isSameType(otherNode)
  {
   return otherNode instanceof ASTNode && this.type === otherNode.type;
  }
  
  return {
   isType : isType,
   isSameType : isSameType
  };
 }());


 if (typeof module === "object" && module.exports)
 {
  module.exports = ASTNode;
 }
}());
