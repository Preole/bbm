"use strict";

var BBM = require("./dist/bbm.js");
var fs = require("fs");
var glob = require("glob");
var diff = require("diff");
var fsOptR = {encoding: "utf-8"};

var srcList = glob.sync("./tests/*.txt").sort();
var destList = glob.sync("./tests/*.html").sort();

srcList.forEach(function (srcFile, index){
 var testCase = BBM.parse(fs.readFileSync(srcFile, fsOptR)).toHTML().trim();
 var expected = fs.readFileSync(destList[index], fsOptR).trim();
 var buffer = "";
 
 //TODO: More elaborate diffing.
 diff.diffLines(expected, testCase).forEach(function (changeObj){
  if (changeObj.added)
  {
   buffer += "+ " + changeObj.value + "";
  }
  else if (changeObj.removed)
  {
   buffer += "- " + changeObj.value + "";
  }
 });
 
 if (buffer)
 {
  console.log("Test case " + srcFile);
  console.log(buffer);
 }
});

