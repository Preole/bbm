"use strict";

var fs = require("fs");
var Parser = require("../src/BBM.parse.js");
var fsOptR = {encoding : "utf-8"};
var defOpt = {maxBlocks : 8};
var tree = Parser(fs.readFileSync("./input.txt", fsOptR), defOpt);
 
//console.log(JSON.stringify(tree, null, " "));
console.log(tree.toHTML());
