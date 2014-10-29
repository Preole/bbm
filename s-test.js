"use strict";

var BBM = require("./dist/bbm.js");
var fs = require("fs");
var fsOptR = {encoding: "utf-8"};
var glob = require("glob");
var diff = require("diff");

var srcList = glob.sync("./tests/*.txt").sort();
var destList = glob.sync("./tests/*.html").sort();

srcList.forEach(function (srcFile, index){
 var testCase = BBM.parse(fs.readFileSync(srcFile, fsOptR)).toHTML().trim();
 var expected = fs.readFileSync(destList[index], fsOptR).trim();
 
 //TODO: More elaborate diffing.
 diff.diffLines(expected, testCase).forEach(function (changeObj){
  console.log(changeObj); 
 });
});

