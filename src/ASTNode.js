
//TODO: Implement prototype methods for manipulating and walking the tree.
(function (){
"use strict";
function ASTNode(type, attr)
{
 this.type = type || "";
 this.attr = attr || {};
 this.nodes = [];
}
function create(type, attr)
{
 return new ASTNode(type, attr);
}

ASTNode.create = create;


if (typeof module === "object" && module.exports)
{
 module.exports = ASTNode;
}
}());
