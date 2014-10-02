"use strict";

var fs = require("fs"),
 BBM = require("../src/BBM.js"),
 fsOptR = {encoding : "utf-8"},
 tree = BBM(fs.readFileSync("./input.txt", fsOptR));
 
console.log(JSON.stringify(tree, null, " "));