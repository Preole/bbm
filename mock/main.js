"use strict";

var fs = require("fs");
var BBM = require("./bundle.js");
var fsOptR = {encoding : "utf-8"};
var tree = BBM.parse(fs.readFileSync("./input.txt", fsOptR));
 
//console.log(JSON.stringify(tree, null, " "));
console.log(tree.toHTML());

