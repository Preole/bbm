#!/usr/bin/env node
//Hacky shebang line to make cli.js work

var bbm = require("./lib/bbm.js"),
fs = require("fs"),
fsOptR =
{
 encoding : "utf8", 
 flag : "r"
},
fsOptW =
{
 encoding : "utf8",
 mode : 438,
 flag : "w"
},
path = require("path"),
//Some basic HTML templates for importing JS/CSS, and inserting meta data.
templ = (function()
{
 var REGEX_CTRL_G = new RegExp("[\\u0000-\\u001f\\u007f-\\u009f\\u2028\\u2029]+", "g"),
  REGEX_AMP = /&/g,
  REGEX_GT = />/g,
  REGEX_LT = /</g,
  REGEX_APOS = /'/g,
  REGEX_QUOT = /"/g,
  REGEX_GRAVE = /`/g;

 function encodeHTMLAttr(str)
 {
  REGEX_CTRL_G.lastIndex = 0;
  REGEX_AMP.lastIndex = 0;
  REGEX_GT.lastIndex = 0;
  REGEX_LT.lastIndex = 0;
  REGEX_APOS.lastIndex = 0;
  REGEX_QUOT.lastIndex = 0;
  REGEX_GRAVE.lastIndex = 0;

  return str.replace(REGEX_AMP, "&amp;")
   .replace(REGEX_LT, "&lt;")
   .replace(REGEX_GT, "&gt;")
   .replace(REGEX_QUOT, "&quot;")
   .replace(REGEX_APOS, "&#x27;")
   .replace(REGEX_GRAVE, "&#x60;")
   .replace(REGEX_CTRL_G, " ");
 }
 
 function encodeHTML(str)
 {
  REGEX_AMP.lastIndex = 0;
  REGEX_GT.lastIndex = 0;
  REGEX_LT.lastIndex = 0;
  return str.replace(REGEX_AMP, "&amp;")
   .replace(REGEX_LT, "&lt;")
   .replace(REGEX_GT, "&gt;");
 }
 
 function cssExt(fpath, mediaQStr)
 {
  var str = "<link rel=\"stylesheet\" type=\"text/css\" " + 
   "href=\"" + encodeHTMLAttr(fpath) + "\"";
  if (typeof mediaQStr === "string")
  {
   str += " media=\"" + encodeHTMLAttr(mediaQStr) + "\"";
  }
  str += ">\n";
  return str;
 }

 function cssInt(fpath, mediaQStr)
 {
  var str = "<style type=\"text/css\"";
  if (typeof mediaQStr === "string")
  {
   str += " media=\"" + encodeHTMLAttr(mediaQStr) + "\"";
  }
  str += ">\n";
  return str + fs.readFileSync(fpath, fsOptR) + "\n</style>";
 }

 function jsExt(fpath)
 {
  return "<script type=\"text/javascript\" " +
  "src=\"" + encodeHTMLAttr(fpath) + "\"></script>";
 }

 function jsInt(fpath)
 {
  return "<script type=\"text/javascript\">\n" +
  fs.readFileSync(fpath, fsOptR) + "\n" + "</script>";
 }

 function metaCharset()
 {
  return "<meta charset=\"UTF-8\">"
 }

 //<meta name="author|description|keyword" value="something">
 function metaTag(attr, value)
 {
  return "<meta name=\"" + encodeHTMLAttr(attr) + 
  "\" content=\"" + encodeHTMLAttr(value) +"\">"
 }

 return {
  encodeHTML : encodeHTML,
  encodeHTMLAttr : encodeHTMLAttr,
  cssExt : cssExt,
  cssInt : cssInt,
  jsExt : jsExt,
  jsInt : jsInt,
  metaCharset : metaCharset,
  metaTag : metaTag
 };
}()),

//Binary option flags
binOpt =
{
 "-h" : 1,
 "-v" : 1
};

//A big, ugly HTML template mixed within the program code.
function outputHTML(bbmSrcPath, cliJSONPath)
{
 var bbmSrc = fs.readFileSync(bbmSrcPath, fsOptR);
 var cliJSON = null;
 if (cliJSONPath)
 {
  cliJSON = fs.readFileSync(cliJSONPath, fsOptR);
 }
 else
 {
  cliJSON = fs.readFileSync(path.resolve(scriptDir, "resources/cli.json"));
 }
 cliJSON = JSON.parse(cliJSON);
 
 
 return [
  "<!DOCTYPE HTML>",
  "<html>",
  "<head>",
  "<title>" + templ.encodeHTML(cliJSON.title) + "</title>",
  templ.metaCharset(),
  
  cliJSON.meta.map(function(metaObj, index, array){
   return templ.metaTag(metaObj.key, metaObj.value);
  }).join("\n"),
  
  cliJSON.extern.css.map(function(cssObj, index, array){
   return templ.cssExt(cssObj.fpath, cssObj.mediaQ);
  }).join("\n"),
  
  cliJSON.intern.css.map(function(cssObj, index, array){
   return templ.cssInt(cssObj.fpath, cssObj.mediaQ);
  }).join("\n"),
  
  "</head>",
  "<body>",
  
  compile(bbmSrc, cliJSON.cfg),
  
  cliJSON.extern.js.map(function(fPathStr, index, array){
   return templ.jsExt(fPathStr);
  }).join("\n"),
  
  cliJSON.intern.js.map(function(fPathStr, index, array){
   return templ.jsInt(fPathStr);
  }).join("\n"),
  
  "</body>",
  "</html>"
 ].join("\n");
}

//Wrapper function before calling the compiler.
function compile(bbmSrc, cfgJSON)
{
 if (typeof cfgJSON === "object" || typeof cfgJSON === "function")
 {
  bbm.setOptions(cfgJSON.OPT_BASE, cfgJSON.OPT_HTML);
 }
 return bbm.compileStr(bbmSrc);
}

//If "-v" print version info and exit.
function versionInfo()
{
 var pkgPath = path.resolve(scriptDir, "./package.json"),
  pkg = JSON.parse(fs.readFileSync(pkgPath, fsOptR));
 console.log([pkg.description, "Version:", pkg.version].join(" "));
}

//If "-h" print usage manual and exit.
function usageInfo()
{
 var usage = path.resolve(scriptDir, "./resources/usage.txt");
 console.log(fs.readFileSync(usage, fsOptR));
}

/*
Helper method for retrieving command-line parameters & flags

Input:
 argArr: (Array) An array of string (Command-line parameters)
 binOpt: (Object) (Optional) A hash of option flags that are binary 
  (IE, true or false) All keys in this object should map to a truthy 
  or falsy value.
 
Returns:
 _: (Array) An array of position-dependent parameters.
 hash: (Object) A map of option flags and their mapped string values.
 binHash: (Object) A set of detected boolean flags, based on binOpt.
*/
function procArgs(argArr, binOpt)
{
 var posArr = [], optHash = {}, binHash = {}, regexFlag = /^[-]+/;
 for (var i = 0, ii = argArr.length; i < ii; i += 1)
 {
  var argVal = argArr[i], isFlag = regexFlag.test(argVal);
  if (isFlag)
  {
   if (binOpt && binOpt[argVal]) {binHash[argVal] = 1;}
   else if (argArr[i + 1]) {optHash[argVal] = argArr[i + 1]; i += 1;}
  }
  else {posArr.push(argVal);}
 }

 return {
  _ : posArr,
  hash : optHash,
  binHash : binHash
 };
}

var argObj = procArgs(process.argv.slice(2), binOpt);
var scriptDir = path.dirname(process.argv[1]);
if (argObj.binHash["-v"])
{
 versionInfo();
}
else if (argObj.binHash["-h"] || argObj._.length < 2)
{
 usageInfo();
}
else
{
 fs.writeFileSync(
  argObj._[1],
  outputHTML(argObj._[0], argObj.hash["-cfg"]),
  fsOptW
 );
}