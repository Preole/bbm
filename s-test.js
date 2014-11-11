"use strict";

require("./s-build.js");

var BBM = require("./dist/bbm.js");
var fs = require("fs");
var glob = require("glob");
var diff = require("diff");
var fsOptR = {encoding: "utf-8"};

var srcList = glob.sync("./tests/*.txt").sort();
var destList = glob.sync("./tests/*.html").sort();
var errCount = 0;
var log = console.log;

srcList.forEach(function (srcFile, index){
 var testCase = BBM.parse(fs.readFileSync(srcFile, fsOptR)).toHTML().trim();
 var expected = fs.readFileSync(destList[index], fsOptR).trim();
 var buffer = "";
 
 diff.diffLines(expected, testCase).forEach(function (changeObj, index){
  if (changeObj.added)
  {
   buffer += "\n+ " + changeObj.value
   .replace(/[\r\n](?!$)/g, "\n+ ")
   .replace(/[\r\n]$/, "");
  }
  else if (changeObj.removed)
  {
   buffer += "\n- " + changeObj.value
   .replace(/[\r\n](?!$)/g, "\n- ")
   .replace(/[\r\n]$/, "");
  }
 });
 
 if (buffer)
 {
  log("\n\nTest case " + srcFile);
  log("\n>>>>>>>>");
  log(buffer.slice(1));
  log("<<<<<<<<\n");
  errCount += 1;
 }
});

if (errCount > 0)
{
 log("There are " + errCount + " failed test cases out of " + srcList.length);
 log("Exiting build process due to warnings.");
 process.exit(0);
}
