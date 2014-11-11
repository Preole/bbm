"use strict";

var jshint = require("jshint").JSHINT;
var fs = require("fs");
var fsOptR = {encoding: "utf-8"};
var glob = require("glob");
var hintOpt = JSON.parse(fs.readFileSync("./.jshintrc", fsOptR));
var log = console.log;
var errCount = 0;

log("(L)Hinting...\n ");
log("Options used:\n");
log(JSON.stringify(hintOpt, null, " "));
log("\n");

glob.sync("./src/**.js").forEach(function (fName){
 jshint(fs.readFileSync(fName, fsOptR), hintOpt);
 jshint.errors.forEach(function (err){
  log("line "
  + err.line 
  + ", col "
  + err.character 
  + ": "
  + err.reason
  + " @ "
  + fName);
 });
 
 if (jshint.errors.length === 0)
 {
  log("All clear for " + fName);
 }
 
 errCount += jshint.errors.length;
});

if (errCount > 0)
{
 log("There were " + errCount + " potential problems in total.");
 log("Exiting build process due to warnings.");
 process.exit(0);
}

log("All clear. There are no potential problems.");




