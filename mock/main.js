"use strict";

var fs = require("fs"),
 BBM = require("../src/BBM.js"),
 fsOptR = {encoding : "utf-8"};

var input = fs.readFileSync("./input.txt", fsOptR);
console.log(JSON.stringify(BBM(input), null, " "));