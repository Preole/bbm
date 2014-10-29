var jshint = require("jshint").JSHINT;
var fs = require("fs");
var fsOptR = {encoding: "utf-8"};
var glob = require("glob");
var hintOpt = JSON.parse(fs.readFileSync("./.jshintrc", fsOptR));
var errMsgs = glob.sync("./src/*.js").map(onEachFile);


function onEachError(reportObj)
{
 var err = reportObj.error;
 var fName = reportObj.file;
 return fName
  + ": line "
  + err.line 
  + ", col "
  + err.character 
  + ": "
  + err.reason + "\n";
}

function onEachFile(fName)
{
 jshint(fs.readFileSync(fName, fsOptR), hintOpt);
 
 //TODO: More elaborate error reporting for jshint
 return Array.isArray(jshint.data().error)
  ? jshint.data().error.map(onEachError)
  : "";
}

console.log(errMsgs.join(""));

//TODO: Throw exceptions if there are errors.

