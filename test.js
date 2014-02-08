/*
Simple node.js script for comparing the content of one folder against the 
other. Performs exact String match file by file, ignoring sub-directories.
Assumes all file contents are encoded using UTF-8.

Outputs any failed test cases to stderr stream.
*/

var bbmtest = (function()
{
 var assert = require("assert"),
 compiler = require("./lib/bbm.js"),
 fs = require("fs"),
 fsTestDir = "./tests/",
 fsTestExpectDir = "./tests-expect/",
 fsOptR =
 {
  encoding : "utf8", 
  flag : "r"
 },
 
 //Local String library, with unicode whitespace & line break support
 str_ = (function()
 {
  "use strict";
  var NL = "[\\v\\f\\r\\n\\u0085\\u2028\\u2029]+",
   WSNL =
    "[ \\v\\f\\r\\n\\u0085\\u2028\\u2029\\u2000-\\u200d\\t\\u202f\\u205f" +
    "\\u3000\\u1680\\u180e\\u00a0\\u00b7\\u237d\\u2420\\u2422\\u2423]",
   REGEX_NL_G = new RegExp(NL, "g"),
   REGEX_HEAD_TAIL_WSNL = new RegExp("^" + WSNL + "+|" + WSNL + "+$");
   
  function str_trim(str)
  {
   return (str.replace(REGEX_HEAD_TAIL_WSNL, ""));
  }
  
  function str_unifyNL(str)
  {
   REGEX_NL_G.lastIndex = 0;
   return str.replace(REGEX_NL_G, "\n");
  }
  
  return {
   unifyNL : str_unifyNL,
   trim : str_trim
  };
 }());

 //Normalize OS-specific Line Breaks to "\n", remove lead & trail spaces
 function postProc(str)
 {
  return str_.unifyNL(str_.trim(str));
 }

 //Compiles some BakaBakaMark source code, outputting HTML snippets.
 function compile(str)
 {
  return postProc(compiler.compileStr(str));
 }
 
 function compareDir()
 {
  var srcNames = fs.readdirSync(fsTestDir),
   errCount = 0, i = 0, ii = srcNames.length;
  
  for (i = 0, ii = srcNames.length; i < ii; i += 1)
  {
   var fPathSrc = fsTestDir + srcNames[i], 
    fPathDest = fsTestExpectDir + srcNames[i],
    isSrcFile = fs.statSync(fPathSrc).isFile(),
    isDestFile = fs.existsSync(fPathDest) && fs.statSync(fPathDest).isFile();

   if (!isDestFile)
   {
    console.error(
     "Expected results file \"" + srcNames[i] + "\" does not exist " + 
     "or is not a serializable " + fsOptR.encoding + " file."
    );
    errCount += 1; continue;
   }
   var expectText = postProc(fs.readFileSync(fPathDest, fsOptR)),
    actualText = postProc(compile(fs.readFileSync(fPathSrc, fsOptR)));

   //Simple minded exact string comparison.
   try {assert.strictEqual(actualText, expectText);}
   catch (assertErr)
   {
    console.error(
     "Failed compilation test case \"" + srcNames[i] + "\"\n========\n\n" +
     "[[Expected]]\n------------\n\n\"\"\"\n" + expectText + "\n\"\"\"\n\n" + 
     "[[Actual]]\n----------\n\n\"\"\"\n" + actualText + "\n\"\"\"\n\n"
    );
    errCount += 1;
   }
  }
  assert.strictEqual(errCount, 0, 
  "There were " + errCount + " failures out of " + ii + " tests.");
 }

 return compareDir;
}());

if (require.main === module) {bbmtest();}
else {module.exports = bbmtest;}