```
BakaBakaMark README
===================

A short comprehensive guide to the Lightweight Markup Language (LML), 
BakaBakaMark, and its compiler. It can be installed as a javascript library 
or a command-line application for generating complete HTML documents under
node.js.



NAME
----

 bbm - BakaBakaMark; An extensible, versatile lightweight markup 
       language that compiles to HTML.


DESCRIPTION
-----------

 BakaBakaMark (bbm) is an experimental lightweight markup language built for
 read, writ-ability, and a versatile main syntax. It comes with a compiler 
 producing W3C-valid, XSS-safe HTML snippets or standalone files with 
 permission settings. Moreover, the language features a stable, comprehensive 
 grammar definition with fairly complete coverage, which should help porting 
 the language into other platforms with no ambiguity.
 
 For further philosophical details: """$(ROOT)/doc/intro.txt"""
 
 Note: """$(ROOT)""" denotes the root folder of this project.
 


INSTALL (Node.js only)
----------------------

Install node.js >= 0.8.0 from ?<http://nodejs.org/>, then from the command 
line:

"""
npm install bbm
"""

Add """-g""" if using it as a compiler in your favorite shell.



USAGE (WEB BROWSER)
-------------------

 Grab """bbm.html""" and """bbm.min.js""" from """$(ROOT)/lib/""". 
 Launch the """.html""" file from a web browser.

 Alternatively: """<script src="${YOUR-DIR}/bbm.min.js"></script>""", then 
 refer to **USAGE (API)** for using the program.
 
 === Browser Compatibility ===

 The following web browsers have been sufficiently tested to work with the 
 compiler itself:

 - Mozilla Firefox 3.6.28+
 - Google Chrome 14+
 - Safari 5.1.7 (Windows Edition)
 - Internet Explorer 7+
 - Opera 12+

 - Lunascape 6.8.1 
   (Using Internet Explorer 9.11.9600.16428, WebKit 535.3 r95080, and
   Firefox 3.6.28)



USAGE (API)
-----------

 === General usage ===

 """
 var bbm = require("bbm"); //node.js import
 var bbmBrowser = BBMCompiler; //Browser import or copy & paste

 var htmlString = bbm.compileStr("?<http://www.google.com>"); //String
 someDomNode.innerHTML = htmlString;

 var docFrag = bbm.compileDOM("?<http://www.google.com>"); //Browser
 someDomNode.appendChild(docFrag);
 
 //Sample jquery usages; Hook event handler.
 $(docFrag).find(".wiki-bbm").on("click", function(event){
  alert("This is a special type of link, not a normal anchor.");
 });
 
 //Sample jquery usage; Change text color
 $(docFrag).find(".bbm-custom-class-in-frag").css("color", "#0f0");
 """


 
 === Specifying options ===

 There are two sets of options; The first set is front-end specific, 
 the second set is back-end, for when the language starts to support 
 compiling into other document markup languages.

 Use """null""" to omit specifying a set of options; In such cases, the 
 compiler shall use the built-in default for that set. For a full set of 
 available options, refer to the section **OPTIONS (API)**.
 
 """
 bbm.setOptions({ 
  MAX_BLOCKS : 4,
  MAX_SPANS : 4
 },
 { 
  XHTML : 1
 });

 bbm.compileStr("...");
 """

 
 
 === Access Lexer & Parser ===
 
 """
 var str = "...";
 var tokens = bbm.lexer(str);
 var ast = bbm.parser(tokens);
 ast = bbm.filter(ast);
 """

 For full API references, please consult """$(ROOT)/doc/api.txt"""



USAGE (COMMAND-LINE)
--------------------

=== SYNOPSIS ===

"""
bbm inFile outFile [-options] [-cfg config-file]
"""



=== NOTES ===

bbm currently only accepts and outputs UTF-8 encoded files.



=== OPTIONS ===

; """-v"""
: Prints version information and exits.

; """-h"""
: Prints this help file and exits.

; """-cfg path/to/CONFIG.JSON"""
: Specifies a configuration file for inserting meta data into the generated 
  HTML file. This configuration file should be in valid JSON format. For 
  detailed information, consult the sample JSON files @ CONFIG JSON



=== CONFIG JSON ===

Minimal configuration file: (Also the default if the config file is left 
unspecified.)

""""
{
 "title": "This is your document's Title",
 "meta": [],
 "extern": {
  "css" : [],
  "js" : []
 },
 "intern": {
  "css" : [],
  "js" : []
 },
 "cfg": {}
}
""""



Complete reference:

""""
{
 //string: HTML Page Title
 "title": "This is your document's Title",
 
 //Array: Recommended meta tags to insert into the page.
 //Use an empty array if no meta tags to specify.
 "meta": [
  {
   "key" : "author",
   "value" : "Your Name(s) Here"
  },
  {
   "key" : "description",
   "value" : "The description of the web page. (For SEO)"
  },
  {
   "key" : "keywords",
   "value" : "Keywords for search engines, Comma-Separated."
  }
 ],
 
 //External CSS & Javascript, referenced using relative path.
 "extern": {
 
  //Required; Use empty array if not importing anything
  /*
  Each object has these two properties:
   fpath : Relative file path to the CSS file.
   mediaQ : (Optional) The media query string, which specifies the type and 
    specific conditions this CSS applies to the webpage. An incorrect media 
    query string will result in invalid W3C HTML.
  */
  "css" : [
   {
    "fpath" : "file1.css",
   },
   {
    "fpath" : "file2.css",
   }
  ],
  
  //Required; Use empty array if not importing anything
  //Expects a list of strings (file path to javascript files to link to)
  "js" : [
   "f1.js",
   "f2.js"
  ]
 },
 
 //Embedded Javascript & CSS; These are read from an external file and 
 //written directly into the HTML file. If the files are not found, an
 //exception will be generated.
 "intern": {
 
  //Required; Use empty array if not embedding anything.
  //Same object as extern.css
  "css" : [
   {
    "fpath" : "file1.css",
    "mediaQ" : ""
   },
   {
    "fpath" : "file2.css",
    "mediaQ" : ""
   }
  ],
  
  //Required; Use empty array if not embedding anything
  "js" : [
   "f1.js",
   "f2.js"
  ]
 },
 
 //Compiler configuration; See: **OPTIONS (COMPILER)**
 "cfg": {
 
  //Basic options
  "OPT_BASE" : {
   "RM_EOL" : 0,
   "MAX_BLOCKS" : 8,
   "MAX_SPANS" : 10,
   "ALLOW_IMG" : 1,
   "ALLOW_LINK" : 1,
   "ALLOW_CLASS" : 1,
   "ALLOW_ID" : 1
  },

  //HTML-specific options
  "OPT_HTML" : {
   "MAX_ATTR_CHARS" : 2048,
   "CSS_PRE" : "bbm-",
   "CSS_WIKI" : "w-bbm",
   "MIN_HEADER" : 0,
   "XHTML" : 0
  }
 }
}
""""


OPTIONS (COMPILER)
------------------

Note: All option parameters of type """boolean""" can use a "falsy" or 
"truthy" value instead of the constant """true""" and """false""". E.g:
"""1, 0, null""".


=== OPT_BASE ===

Front-end customization. Options under this category applies to all output 
regardless of the code generator (In the future) used.



==== MAX_SPANS ====

Type: """number"""; Default: """10"""

Maximum inline element nesting level. Further inline level tokens shall be 
treated as literal text.



==== MAX_BLOCKS ====

Type: """number"""; Default: """8"""

Maximum block element nesting level. Further block level tokens shall be 
treated as literal text.



==== RM_EOL ====

Type: """boolean"""; Default: """false"""

Remove End of line characters, so they are not considered as significant 
white space by the target document. Useful for East-Asian alphabets, which 
do not treat line breaks as white space.



==== ALLOW_LINK ====

Type: """boolean"""; Default: """true"""

Allows Hyperlinks; Applies to Internal, External, and custom hyperlinks.



==== ALLOW_IMG ====

Type: """boolean"""; Default: """true"""

Allows Images.



==== ALLOW_ID ====

Type: """boolean"""; Default: """true"""

Allows custom CSS ID



==== ALLOW_CLASS ====

Type: """boolean"""; Default: """true"""

Allows custom CSS classes



=== OPT_HTML ===

HTML output specific setting used by the code generator. The following list 
describes the possible options present in the built-in HTML code generator.



==== MAX_ATTR_CHARS ====

Type: """number"""; Default: """2048"""

Maximum character length of a tag's attribute value; This applies to 
custom CSS ID, classes, hyperlink URLs, but is not limited to such.



==== CSS_PRE ====

Type: """string"""; Default: """bbm-"""

CSS prefix string for avoiding namespace poisoning using the BlockID and 
BlockClass elements. This string value should not contain any control or 
white space characters.



==== CSS_WIKI ====

Type: """string"""; Default: """w-bbm"""

CSS class constant for wiki (customizable) links. This all wiki links are 
given this class name, so they can be selected for further processing 
without affecting other types of links.



==== XHTML ====

Type: """boolean"""; Default: """false"""

Output valid XHTML instead of HTML; Only applies for printing HTML String. 
(No effect on generating HTML DOM trees)



==== MIN_HEADER ====

Type: """number""" (Integer); Default: """0"""

If this value is greater than 0, all """<h1>""" to """<h6>""" HTML tags 
will be incremented by one level, up to a maximum of 6. Set this value if 
you plan to automatically outline the HTML document containing this snippet.



=== Sample Default JSON ===

"""
{
 "OPT_BASE" : {
  "RM_EOL" : 0,
  "MAX_BLOCKS" : 8,
  "MAX_SPANS" : 10,
  "ALLOW_IMG" : 1,
  "ALLOW_LINK" : 1,
  "ALLOW_CLASS" : 1,
  "ALLOW_ID" : 1
 },

 "OPT_HTML" : {
  "MAX_ATTR_CHARS" : 2048,
  "CSS_PRE" : "bbm-",
  "CSS_WIKI" : "w-bbm",
  "MIN_HEADER" : 0,
  "XHTML" : 0
 }
}
"""

Use """JSON.parse()""" to read the it into the Javascript program, and 
use the dot notation to access the groups of options:

"""
var bbmOpt = JSON.parse(fs.readFileSync("config.json"));
bbm.setOptions(bbmOpt.OPT_BASE, bbmOpt.OPT_HTML);
bbm.compileStr(someSnippet);
/*...*/
"""



FILES
-----

All files in the project are to be encoded in UTF-8, no exceptions. The list 
of relevant files are as follows:

; ${ROOT}/doc/api.(txt|html)
: Compiler's API references for use with other Javascript libraries.

; ${ROOT}/doc/ebnf-grammar.(txt|html)
: EBNF grammar, comprehensive semantic documentation. Helps in maintaining 
  implementation consistency in other platforms & programming languages. 
  (Such as Python)

; ${ROOT}/doc/quick-ref.(txt|html)
; ${ROOT}/doc/syntax-ref.(txt|html
: BakaBakaMark Syntax Reference; The former is quick and short, while the 
  latter is more in-depth.

; ${ROOT}/lib/bbm.html
: HTML driver file for using the compiler directly in web browsers; 
  Depends on """${ROOT}/lib/bbm.min.js""".
  
; ${ROOT}/lib/bbm.js
; ${ROOT}/lib/bbm.min.js
: Source files (And the minified version) used in the project; Also doubles 
  as libraries.

; ${ROOT}/man/*
: Man Pages

; ${ROOT}/resources/*
: Private helper files, such as HTML templates for documentation generation, 
  and default configuration JSON files.

; ${ROOT}/tests/*
; ${ROOT}/tests-expect/*
: BakaBakaMark test case input files; One test case per file; They should 
  all be text files, having meaningful names separated by a single """-""",
  and mirror each other's directory structure. The former directory is used
  to store test cases in source code, while the other is the expected HTML 
  output.

  A test case is considered successful if the expected and the actual 
  output achieve "exact" string match, character by character. They may 
  have their line breaks normalized to "\\n" prior to testing, as well as 
  stripping leading and trailing spaces.

; ${ROOT}/cli.js
: Command line interface for the compiler, which generates a complete, 
  standalone HTML web page.
  
; ${ROOT}/doc.js
: Automated HTML documentation generation script, compiling BakaBakaMark 
  source into their """.html""" equivalent; Also generates man pages.
  
; ${ROOT}/test.js
: Automated test script. Invoke with """node test.js""" if you only have 
  node.js, or """grunt test""" if you have grunt-cli as well.
  
  All errors generated by this script are printed to the """stderr""" 
  output stream.

; ${ROOT}/config.json
: Sample, default compiler configuration file.

; ${ROOT}/package.json
: Install configuration for use by """npm""". (Node package manager)

; ${ROOT}/journal/
: Personal journal of the project's history. [.gitignore]
  
; ${ROOT}/node_modules/
: node.js files.
 

RUNNING TESTS
-------------

"""
node test.js
"""
"""
grunt test
"""



GENERATING DOCS
---------------

"""
node doc.js
"""
"""
grunt doc
"""

 

EXIT STATUS
-----------

(Command-Line only) Always 0
 

LICENSE
-------

See """$(ROOT)/License.txt""" (BSD-2-Clause) 


NOTICES
-------

- I shall not change any of the language's existing features; I want others 
  and myself to rely on a stable set of features for years to come.

- I am happy to handle issues involving the language, its tools, and its 
  applications, such as optimizing for speed and adding syntax highlighting 
  support. (Which I have no experiences with)

- I highly welcome challenges to add support to other platforms & programming 
  languages.


SEE ALSO
--------

 ; bbm(2)
 : Quick syntax reference.
 
 ; bbm(3)
 : In-depth syntax reference.
 
 ; bbm(4)
 : EBNF grammar, comprehensive semantic documentation. Helps in maintaining 
   implementation consistency in other platforms.
   
 ; bbm(5)
 : Detailed Javascript API for integrating with other Javascript projects.
```
