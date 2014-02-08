/*
A script for building the documentation and the man pages.

For every .txt file in """${ROOT}/doc/""", run it through the compiler
& Turn them into a complete HTML page in the same directory. If they're 
part of the man pages, copy the source over there as well.
*/
var fs = require("fs"),
path = require("path"),
bbm = require("./lib/bbm.js"),
_ = require("./resources/lodash-template.min.js").template,
manMap = //Maps documentation source files to man page indices.
{
 "README.txt" : "./man/bbm.1",
 "quick-ref.txt" : "./man/bbm.2",
 "syntax-ref.txt" : "./man/bbm.3",
 "ebnf-grammar.txt" : "./man/bbm.4",
 "api.txt" : "./man/bbm.5"
},
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
docDir = "./doc/",
fList = fs.readdirSync(docDir),
templ = _(fs.readFileSync("./resources/templ.html", fsOptR));

function loopDoc()
{
 for (var i = 0, ii = fList.length; i < ii; i += 1)
 {
  var fName = fList[i],
   fullP = docDir + fName,
   ext = path.extname(fName),
   bName = path.basename(fName, ext);
   
  if (fs.statSync(fullP).isFile() && ext === ".txt")
  {
   var src = fs.readFileSync(fullP, fsOptR),
    manPath = manMap[fName];
    html = templ({
     title : path.basename(fName, ext),
     html : bbm.compileStr(src)
    });

   fs.writeFileSync(docDir + bName + ".html", html, fsOptW);
   if (manPath) {fs.writeFileSync(manPath, src, fsOptW);}
  }
 }
}


if (require.main === module) {loopDoc();}
else {module.exports = loopDoc;}
