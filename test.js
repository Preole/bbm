/*
Simple node.js script for comparing the content of one folder against the 
other. Performs exact String match file by file, ignoring sub-directories.
Assumes all file contents are encoded using UTF-8.

Outputs any failed test cases to stderr stream.
*/

var bbmtest = (function()
{
 var assert = require("assert"),
 bbm = require("./lib/bbm.js"),
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
  function str_trim(str)
  {
   return str.replace(/(^\s+)|(\s+$)/g, "");
  }
  
  function str_unifyNL(str)
  {
   return str.replace(/[\v\f\r\n\u0085\u2028\u2029]+/g, "\n");
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
    actualText = postProc(bbm.compile(fs.readFileSync(fPathSrc, fsOptR)));

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