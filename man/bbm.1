BakaBakaMark README
===================

A Lightweight Markup Language (LML), BakaBakaMark, and its compiler. It can 
be installed as a javascript library for generating complete HTML documents 
under node.js or as a standalone script file.



NAME
----

 bbm - BakaBakaMark; An extensible, versatile lightweight markup 
       language that compiles to HTML.


DESCRIPTION
-----------

 BakaBakaMark (bbm) is an experimental lightweight markup language built for
 read, writ-ability, and a versatile main syntax. It comes with a compiler 
 producing W3C-valid, XSS-safe HTML snippets with permission settings. 
 Moreover, the language features a stable, comprehensive grammar definition 
 with fairly complete coverage, which should help porting the language into 
 other platforms with no ambiguity.
 
 Note: """$(ROOT)""" denotes the root folder of this project.
 


INSTALL (Node.js only)
----------------------

Install node.js >= 0.8.0 from ?<http://nodejs.org/>, then from the command 
line:

"""
npm install bbm
"""



USAGE (WEB BROWSER)
-------------------

 Grab """bbm.html""" and """bbm.min.js""" from """$(ROOT)/lib/""". 
 Launch the """.html""" file from a web browser.

 Alternatively: """< script src="${YOUR-DIR}/bbm.min.js"></script>""", then 
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
 var bbmBrowser = bbm; //Browser import or copy & paste

 var htmlString = bbm.compile("?<http://www.google.com>"); //String
 someDomNode.innerHTML = htmlString;
 
 //Sample jquery usages; Hook event handler.
 $(docFrag).find(".wiki-bbm").on("click", function(event){
  alert("This is a special type of link, not a normal anchor.");
 });
 
 //Sample jquery usage; Change text color
 $(docFrag).find(".bbm-custom-class-in-frag").css("color", "#0f0");
 """


 
 === Specifying options ===

 There are two ways to specify the compiler's options; At preparation time, 
 or right before compilation. Options set in preparation time shall be 
 applied to all future parses, while options passed into the compilation
 function are effective only for this parse.
 
 Permanent option setting:
 
 """
 //Permanent
 var optUsed = bbm.setOptions({
  MAX_BLOCKS : 4,
  MAX_SPANS : 4,
  XHTML : 1
 });

 bbm.compile("...");
 """
 
 Temporary option setting:
 
 """
 bbm.compile("...", {
  MAX_BLOCKS : 4,
  MAX_SPANS : 4,
  XHTML : 1
 });
 """

 
 
 === Access Lexer & Parser ===
 
 """
 var str = "...";
 var tokens = bbm.lexer(str);
 var ast = bbm.parser(tokens);
 ast = bbm.filter(ast);
 """

 For full API references, please consult """$(ROOT)/doc/api.txt"""




OPTIONS (COMPILER)
------------------

Note: All option parameters of type """boolean""" can use a "falsy" or 
"truthy" value instead of the constant """true""" and """false""". E.g:
"""1, 0, null""".


=== Front-end ===

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

Allows the custom CSS ID syntax.



==== ALLOW_CLASS ====

Type: """boolean"""; Default: """true"""

Allows custom CSS classes syntax.





=== HTML Backend ===

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
 "RM_EOL" : 0,
 "MAX_BLOCKS" : 8,
 "MAX_SPANS" : 10,
 "ALLOW_IMG" : 1,
 "ALLOW_LINK" : 1,
 "ALLOW_CLASS" : 1,
 "ALLOW_ID" : 1
 
 "MAX_ATTR_CHARS" : 2048,
 "CSS_PRE" : "bbm-",
 "CSS_WIKI" : "w-bbm",
 "MIN_HEADER" : 0,
 "XHTML" : 0
}
"""

Use """JSON.parse()""" to read the it into the Javascript program, and 
use the dot notation to access the groups of options:

"""
var bbmOpt = JSON.parse(fs.readFileSync("config.json"));
bbm.setOptions(bbmOpt);
bbm.compile(someSnippet);
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
