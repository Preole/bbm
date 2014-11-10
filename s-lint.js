var jshint = require("jshint").JSHINT;
var fs = require("fs");
var fsOptR = {encoding: "utf-8"};
var glob = require("glob");
var hintOpt = JSON.parse(fs.readFileSync("./.jshintrc", fsOptR));
var errMsgs = "";

glob.sync("./src/*.js").forEach(function (fName){
 jshint(fs.readFileSync(fName, fsOptR), hintOpt);
 jshint.errors.forEach(function (err){
  errMsgs += "line "
  + err.line 
  + ", col "
  + err.character 
  + ": "
  + err.reason
  + " @ "
  + fName
  + "\n";
 });
});

if (errMsgs.length > 0)
{
 console.log(errMsgs);
 //TODO: More elaborate error reporting for jshint
 //TODO: Throw exceptions if there are errors.
}





