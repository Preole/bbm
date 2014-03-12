/*!
 * @desc BakaBakaMark: An Extensible LML-HTML Compiler
 * @version 1.0.0
 * @license BSD-2-Clause; Copyright (c) 2014 Preole, All rights reserved.
*/
/*jshint eqnull:true, newcap:false*/
var BBM = (function()
{
 "use strict";
 var OPT =
 {
  RM_EOL : 0,
  MAX_ATTR_CHARS : 2048,
  MAX_BLOCKS : 8,
  MAX_SPANS : 10,
  ALLOW_IMG : 1,
  ALLOW_LINK : 1,
  ALLOW_CLASS : 1,
  ALLOW_ID : 1,
  CSS_PRE_ID : "bbm-",
  CSS_PRE : "bbm-",
  CSS_WIKI : "w-bbm",
  MIN_HEADER : 0,
  XHTML : 0
 },



 // Regular expression cache. //

 REGEX_WS_STR = "[ \\u2000-\\u200d\\t\\u202f\\u205f\\u3000\\u1680" +
 "\\u180e\\u00a0\\u00b7\\u237d\\u2420\\u2422\\u2423]+",
 REGEX_NL_STR = "[\\v\\f\\r\\n\\u0085\\u2028\\u2029]+",
 REGEX_CTRL_STR = "[\\u0000-\\u001f\\u007f-\\u009f\\u2028\\u2029]+",

 REGEX_WS = new RegExp(REGEX_WS_STR),
 REGEX_WS_G = new RegExp(REGEX_WS_STR, "g"),
 REGEX_NL = new RegExp(REGEX_NL_STR),
 REGEX_NL_G = new RegExp(REGEX_NL_STR, "g"),
 REGEX_CTRL_G = new RegExp(REGEX_CTRL_STR, "g"),
 REGEX_WS_ONLY = /^\s*$/,
 REGEX_DIGIT = /[0-9]+/,

 NL_STR = "\n", //Default line break.
 WS_STR = " ", //Default space.

 
 
 // Syntax tree nodes, Lexical Tokens types & subsets //

 LEX_ENUM =
 {
  SPACES : "SPACES",
  NL : "NL",
  TEXT : "TEXT",
  UNDER : "UNDER",
  SUB : "SUB",
  SUP : "SUP",
  CODE : "CODE",
  ITAL : "ITAL",
  BOLD : "BOLD",
  INS : "INS",
  INS_END : "INS_END",
  DEL : "DEL",
  DEL_END : "DEL_END",
  DIV_LINE : "DIV_LINE",
  COMMENT_DELIM : "COMMENT_DELIM",
  ASIDE_DELIM : "ASIDE_DELIM",
  TH : "TH", //Table Head
  TD : "TD", //Table Cell
  TR_DELIM : "TR_DELIM", //Table Row Delimiter
  ATX : "ATX",
  ATX_END : "ATX_END",
  OL_ITEM : "OL_ITEM",
  UL_ITEM : "UL_ITEM",
  DT_MARK : "DT_MARK",
  DD_MARK : "DD_MARK",
  LABEL_CLASS : "LABEL_CLASS",
  LABEL_ID : "LABEL_ID",
  LABEL_STOP : "LABEL_STOP",
  LINK_REF_END : "LINK_REF_END",
  LINK_REF : "LINK_REF",
  LINK_CONT : "LINK_CONT",
  LINK_INT : "LINK_INT",
  LINK_WIKI : "LINK_WIKI",
  LINK_EXT : "LINK_EXT",
  LINK_IMG : "LINK_IMG",
  GT_THAN : "GT_THAN",
  BRACKET_L : "BRACKET_L",
  BRACKET_R : "BRACKET_R",
  EOF : "EOF"
 },

 AST_ENUM =
 {
  ROOT : "ROOT",
  PARA : "PARA",
  STOP : "STOP",
  BLOCKQUOTE : "BLOCKQUOTE",
  CODE_BLOCK : "CODE_BLOCK",
  ASIDE : "ASIDE",
  ID : "ID",
  CLASS : "CLASS",
  UL : "UL",
  OL : "OL",
  UL_LI : "UL_LI",
  OL_LI : "OL_LI",
  HEADER : "HEADER",
  DIV_LINE : "DIV_LINE",
  DT : "DT",
  DD : "DD",
  DL : "DL",
  TH : "TH",
  TD : "TD",
  TR : "TR",
  TABLE : "TABLE",
  LINK_REF : "LINK_REF",
  LINK_INT : "LINK_INT",
  LINK_EXT : "LINK_EXT",
  LINK_IMG : "LINK_IMG",
  LINK_WIKI : "LINK_WIKI",
  TEXT : "TEXT",
  DEL : "DEL",
  INS : "INS",
  UNDER : "UNDER",
  SUB : "SUB",
  SUP : "SUP",
  ITAL : "ITAL",
  BOLD : "BOLD",
  CODE : "CODE"
 },

 LEX_AST_LIST_MAP =
 { //Maps list-like block construct tokens to ASTNode types.
  GT_THAN : AST_ENUM.BLOCKQUOTE,
  UL_ITEM : AST_ENUM.UL_LI,
  OL_ITEM : AST_ENUM.OL_LI,
  DT_MARK : AST_ENUM.DT,
  DD_MARK : AST_ENUM.DD,
  TH : AST_ENUM.TH,
  TD : AST_ENUM.TD
 },

 LEX_AST_LINK_MAP =
 { //Maps link tokens types to ASTNode types.
  LINK_INT : AST_ENUM.LINK_INT,
  LINK_EXT : AST_ENUM.LINK_EXT,
  LINK_IMG : AST_ENUM.LINK_IMG,
  LINK_WIKI : AST_ENUM.LINK_WIKI
 },

 LEX_AST_FMT_MAP =
 { //Maps text-formatting lexical tokens to ASTNode types.
  INS : AST_ENUM.INS,
  DEL : AST_ENUM.DEL,
  INS_END : AST_ENUM.INS,
  DEL_END : AST_ENUM.DEL,
  BOLD : AST_ENUM.BOLD,
  ITAL : AST_ENUM.ITAL,
  SUP : AST_ENUM.SUP,
  SUB : AST_ENUM.SUB,
  UNDER : AST_ENUM.UNDER
 },

 LEX_FMT_START_END_MAP =
 {
  INS : LEX_ENUM.INS_END,
  DEL : LEX_ENUM.DEL_END,
  BOLD : LEX_ENUM.BOLD,
  ITAL : LEX_ENUM.ITAL,
  SUP : LEX_ENUM.SUP,
  SUB : LEX_ENUM.SUB,
  UNDER : LEX_ENUM.UNDER
 },

 LEX_PARA_DELIM_MAP = {ASIDE_DELIM: 1, ATX_END : 1, DIV_LINE : 1},
 LEX_ANGLE_LINK_MAP = {LINK_EXT : 1, LINK_IMG : 1, LINK_WIKI : 1},
 LEX_ATX_END_MAP = {ATX_END : 1, NL : 1},
 LEX_REF_END_MAP = {LINK_REF_END : 1, NL : 1},
 LEX_BRACKET_L_MAP = {BRACKET_L : 1, LINK_INT : 1, LINK_CONT : 1},
 LEX_BRACKET_R_MAP = {BRACKET_R : 1},
 
 AST_LINK_MAP = {LINK_IMG : 1, LINK_EXT : 1, LINK_INT : 1, LINK_WIKI : 1},
 AST_SPAN_MAP =
 {
  SUB : 1,
  SUP : 1,
  ITAL : 1,
  BOLD : 1,
  DEL : 1,
  INS : 1,
  UNDER : 1,
  CODE : 1
 },
 AST_BLOCK_NON_EMPTY_MAP =
 {
  STOP : 1,
  PARA : 1,
  BLOCKQUOTE : 1,
  ASIDE : 1,
  UL_LI : 1,
  OL_LI : 1,
  HEADER : 1,
  OL : 1,
  UL : 1,
  DL : 1,
  DD : 1,
  DT : 1,
  TR : 1
 },
 AST_ID_CLASS_MAP = {ID : 1, CLASS : 1, STOP : 1},
 AST_HTML_MAP =
 {
  PARA : "p",
  BLOCKQUOTE : "blockquote",
  CODE_BLOCK : "pre",
  ASIDE : "div", //Arbitrary div.
  UL_LI : "li",
  OL_LI : "li",
  OL : "ol",
  UL : "ul",
  DL : "dl",
  DD : "dd",
  DT : "dt",
  DIV_LINE : "hr",
  TH : "th",
  TD : "td",
  TR : "tr",
  TABLE : "table",
  LINK_INT : "a",
  LINK_EXT : "a",
  LINK_WIKI : "a", //Extensible, clickable link.
  LINK_IMG : "img",
  SUB : "sub",
  SUP : "sup",
  ITAL : "em",
  BOLD : "strong",
  DEL : "del",
  INS : "ins",
  UNDER : "u",
  CODE : "code",
  HEADER : "h" //h1-h6
 },
 AST_XHTML_MAP = {LINK_IMG : 1, DIV_LINE : 1};

 
 


 function str_printCSSClasses(classArray)
 {
  var res = [];
  for (var i = 0, ii = classArray.length; i < ii; i += 1)
  {
   res.push(OPT.CSS_PRE + str_encodeCSS(classArray[i]));
  }
  return res.join(WS_STR);
 }

 function str_printCSSID(str, sanitize)
 {
  return OPT.CSS_PRE_ID + (sanitize ? str_encodeCSS(str) : str);
 }

 function str_removeWS(str)
 {
  REGEX_WS_G.lastIndex = 0;
  return str.replace(REGEX_WS_G, "");
 }

 function str_removeCTRL(str)
 {
  REGEX_CTRL_G.lastIndex = 0;
  return str.replace(REGEX_CTRL_G, "");
 }

 function str_removeEOL(str)
 {
  REGEX_NL_G.lastIndex = 0;
  return str.replace(REGEX_NL_G, "");
 }

 function str_trim(str)
 {
  return str.replace(/(^\s+)|(\s+$)/g, "");
 }

 function str_trimTail(str)
 {
  return str.replace(/\s+$/g, "");
 }

 function str_encodeURL(str)
 {
  return str_encodeURIDir(str_trim(str_removeCTRL(str)));
 }

 function str_encodeCSS(str)
 {
  return str_removeWS(str_removeCTRL(str));
 }

 function str_encodeHTML(str)
 {
  return str.replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#x27;")
  .replace(/\//g, "&#x2F;");
 }

 function str_encodeHTMLBody(str)
 {
  return str.replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");
 }

 //Do not use this on unquoted attribute values.
 function str_encodeHTMLAttr(str)
 {
  return str_encodeHTML(str_trim(str_removeCTRL(str)))
  .replace(/`/g, "&#x60;");
 }

 function str_encodeURIDir(str)
 {
  return str.replace(/^javascript:/i, "javascript;")
  .replace(/^data:/i, "data;");
 }

 //From <http://www.webreference.com/programming/javascript/jkm3/3.html>
 function str_repeat(str, times)
 {
  var s = "";
  if (times <= 0) {return s;}
  for (;;)
  {
   if (times & 1) {s += str;}
   times >>= 1;
   if (times) {str += str;}
   else {break;}
  }
  return s;
 }

 function arr_lastIndexOf(arr, obj, fromIndex)
 {
  var len = (arr.length >>> 0) - 1;
  var i = (fromIndex) ? fromIndex : len;
  if (i < 0) {return -1;}
  if (i > arr.length - 1) {i = len;}
  for (i; i >= 0; i -= 1)
  {
   if (arr[i] === obj) {break;}
  }
  return i;
 }

 function arr_filter(arr, func, thisPtr)
 {
  var res = [];
  for (var i = 0, ii = arr.length >>> 0; i < ii; i += 1)
  {
   var val = arr[i];
   if (func.call(thisPtr, val, i, arr)) {res.push(val);}
  }
  return res;
 }

 function obj_merge()
 {
  var args = Array.prototype.slice.call(arguments, 0);
  var i = 0, ii = args.length, obj = null;
  
  for (i = 0; i < ii; i += 1)
  {
   obj = args[i];
   if (obj instanceof Object) {break;}
  }
  
  for (i += 1; i < ii; i += 1)
  {
   if (!(args[i] instanceof Object)) {continue;}
   for (var key in args[i])
   {
    if (args[i].hasOwnProperty(key)) {obj[key] = args[i][key];}
   }
  }
  return obj;
 }

 function LexToken(type, lexeme, col)
 {
  this.col = col;  //Integer
  this.lexeme = lexeme; //String
  this.type = type; //String: One of the LEX_ENUM types.
 }

 LexToken.prototype =
 {
  isType : function(lexType)
  {
   return this.type === lexType;
  },

  isSameType : function(lexToken)
  {
   return this.type === lexToken.type;
  },

  substring : function(startPos, endPos)
  {
   return this.lexeme.substring(startPos, endPos);
  },

  getLength : function()
  {
   return this.lexeme.length;
  }
 };

 /* Abstract Syntax Tree node constructor
 * The meta (Meta Data) property has the following key-value pairs:
 *
 * HEADERLVL: For HEADER nodes. Range: [1-6] Integer inclusive
 * TEXT: For TEXT nodes. A block of text.
 * URL: For LINK_WIKI, LINK_INT, LINK_EXT, and LINK_IMG nodes:
    Denotes the source URL attribute for images and external links.
 * ALT: For LINK_IMG nodes:
    ALT text of the image element.
 * ID: For CLASS and ID nodes, it's the CSS Class or ID identifier they
    will bestow upon the next sibling within the syntax tree. If there's
    no next sibling, this attribute has no effect.
 * REF_ID: For LINK_REF nodes:
    The reference identifier for the URL the node contains, which is stored
    in the URL attribute. (Will never actually appear in the AST)
 * SYM_TABLE:
    ID-URL Mapping symbol table for URL substitution in links and image
    elements. These elements will first look in the symbol table of their
    containing node and their parents, before using that ID as the URL.
 */
 function ASTNode(type, meta)
 {
  this.children = [];
  this.type = type;
  this.err = false;
  this.meta = meta || {};
  this.parent = null;
  this.isDeleted = false;
 }

 ASTNode.prototype =
 {
  getLast : function()
  {
   return this.children[this.children.length - 1];
  },

  getFirst : function()
  {
   return this.children[0];
  },

  getLength : function()
  {
   return this.children.length;
  },

  isType : function(ASTEnumType)
  {
   return this.type === ASTEnumType;
  },

  isSameType : function(child)
  {
   return this.type === child.type;
  },

  pop : function()
  {
   this.children.pop();
  },

  popFirst : function()
  {
   this.children.shift();
  },

  addNode_simple : function(child)
  { //(Private) The function that does the actual insertion.
   var last = this.getLast();
   if (last && last.isType(AST_ENUM.TEXT) && last.isSameType(child))
   {
    last.meta.TEXT += child.meta.TEXT;
    return;
   }
   child.parent = this;
   this.children.push(child);
  },

  addNode_table : function(child)
  { //(Private) Special case handling for table elements.
   var last = this.getLast();
   if (!last || !last.isType(AST_ENUM.TABLE))
   {
    if (child.isType(AST_ENUM.TR))
    {
     return; //Table row delimiters should not start a table.
    }
    last = new ASTNode(AST_ENUM.TABLE);
    this.addNode_simple(last);
   }
   if (last.getLength() <= 0)
   {
    last.addNode_simple(new ASTNode(AST_ENUM.TR));
   }

   var rowNode = last.getLast();
   if (child.isType(AST_ENUM.TH) || child.isType(AST_ENUM.TD))
   {
    rowNode.addNode_simple(child);
   }
   else if (child.isType(AST_ENUM.TR) && rowNode.getLength() > 0)
   {
    last.addNode_simple(child);//New row, if previous row is not empty
   }
  },

  addNode_ul_ol : function(child)
  { //(Private) Special case for ordered list, and unordered list items.
   var listType = child.isType(AST_ENUM.UL_LI) ? AST_ENUM.UL : AST_ENUM.OL;
   var last = this.getLast();
   if (!last || !last.isType(listType))
   {
    last = new ASTNode(listType);
    this.addNode_simple(last);
   }
   last.addNode_simple(child);
  },

  addNode_dl : function(child)
  { //(Private) Special case for definition list.
   var last = this.getLast();
   if (!last || !last.isType(AST_ENUM.DL))
   {
    last = new ASTNode(AST_ENUM.DL);
    this.addNode_simple(last);
   }
   last.addNode_simple(child);
  },

  addNode : function(child)
  { //Append an ASTNode object.
   if ((child instanceof ASTNode) && child !== this)
   {
    if (child.isType(AST_ENUM.LINK_REF))
    {
     if (!this.meta.SYM_TABLE)
     {
      this.meta.SYM_TABLE = {};
     }
     this.meta.SYM_TABLE[child.meta.REF_ID] = child.meta.URL;
    }
    else if (this.isType(AST_ENUM.PARA) && this.isSameType(child))
    {
     this.addNodes(child); //Flatten nested paragraphs.
    }
    else if (child.isType(AST_ENUM.UL_LI) || child.isType(AST_ENUM.OL_LI))
    {
     this.addNode_ul_ol(child);
    }
    else if (child.isType(AST_ENUM.TR) || child.isType(AST_ENUM.TH) ||
    child.isType(AST_ENUM.TD))
    {
     this.addNode_table(child);
    }
    else if (child.isType(AST_ENUM.DD) || child.isType(AST_ENUM.DT))
    {
     this.addNode_dl(child);
    }
    else
    {
     this.addNode_simple(child);
    }
   }
  },

  addText : function(rawText)
  { //Append a TEXT ASTNode, given some raw string.
   if (rawText && rawText.length > 0)
   {
    this.addNode_simple(new ASTNode(AST_ENUM.TEXT, {TEXT : rawText}));
   }
  },

  addNodes : function(child)
  { //Append the descendants of the child into this node.
   if ((child instanceof ASTNode) && child !== this)
   { //No invalid object type, and no circular reference permitted.
    for (var ci = 0, clen = child.children.length; ci < clen; ci += 1)
    { //Flatten.
     this.addNode_simple(child.children[ci]);
    }
   }
  }
 };

 //Generates a list of lexical tokens.
 function lexer(BBMCode)
 {
  var nullToken = null,
  tokenList = [],
  lastCol = 1,
  lastPos = 0,
  currCol = 1,
  currPos = 0,
  currChar = BBMCode.charAt(currPos),
  currTok = null,
  NLTally = {"\r\n" : 0, "\n" : 0, "\r" : 0},

  cases =
  {
   "[" : lexLeftBracket,
   "]" : lexRightBracket,
   "{" : lexLeftBrace,
   "}" : lexRightBrace,
   ":" : lexColon,
   ";" : lexSemiColon,
   "-" : lexHyphen,
   "=" : lexEqual,
   "|" : lexPipe,
   "!" : lexExclaim,
   "#" : lexHash,
   "+" : lexPlus,
   "*" : lexAsterisk,
   "^" : lexCaret,
   "," : lexComma,
   "_" : lexUnder,
   "'" : lexSingleQuote,
   ">" : lexGT,
   "?" : lexQuestion,
   "." : lexPeriod,
   "/" : lexSlash,
   "\"" : lexDblQuote,
   "\\" : lexBackslash,
   "\u2022" : lexBullet,
   "\u2043" : lexBullet
  };

  //Returns the character at the current position + offset value. (Default: 0)
  function LA(offset)
  {
   return BBMCode.charAt(currPos + (offset || 0));
  }

  //Attempts an exact substring match from the current character position + 1.
  function LA_substr(subStr)
  {
   var codeStr = BBMCode.substring(currPos + 1, subStr.length + currPos + 1);
   return codeStr === subStr;
  }

  //Attempts to match a white-space character class.
  function LA_space(offset)
  {
   return REGEX_WS.test(LA(offset));
  }

  //Attempts to match an EOL (End of Line) character. (Includes EOF)
  function LA_NL(offset)
  {
   return REGEX_NL.test(LA(offset)) || (LA(offset) === "");
  }

  //Attempts to match a space or an EOL character.
  function LA_spaceNL(offset)
  {
   return (LA_NL(offset) || LA_space(offset));
  }

  //Consumes |X| (At least 1) characters in the input.
  function shiftChar(offset)
  {
   offset = Math.abs(offset || 1);
   currPos += offset;
   currCol += offset;
   currChar = BBMCode.charAt(currPos);
  }

  function skipChar(offset)
  {
   offset = Math.abs(offset || 1);
   lastPos += offset;
   currPos += offset;
   currChar = BBMCode.charAt(currPos);
  }

  function hasMoreChars()
  {
   return (currChar !== "");
  }

  //Creates a lexeme token of a given type.
  function createToken(tokenType)
  {
   var lexeme = BBMCode.substring(lastPos, currPos);
   var top = tokenList[tokenList.length - 1];
   if (top && top.isType(LEX_ENUM.TEXT) && tokenType === LEX_ENUM.TEXT)
   {
    currTok = top;
    top.lexeme += lexeme; //Merge consecutive text tokens.
   }
   else
   {
    currTok = new LexToken(tokenType, lexeme, lastCol);
    tokenList.push(currTok);
   }
  }

  function lexBullet()
  {
   if (LA_space(1))
   {
    shiftChar(2);
    createToken(LEX_ENUM.UL_ITEM);
   }
  }

  function lexHyphen()
  {
   if (LA_substr("-}"))
   {
    shiftChar(3);
    createToken(LEX_ENUM.DEL_END);
   }
   else if (LA_substr("---"))
   {
    while (currChar === "-")
    {
     shiftChar();
    }
    if (LA_NL())
    {
     createToken(LEX_ENUM.DIV_LINE);
    }
   }
   else if (LA(1) === "[")
   {
    shiftChar(2);
    createToken(LEX_ENUM.LINK_CONT);
   }
   else if (LA_space(1))
   {
    shiftChar(2);
    createToken(LEX_ENUM.UL_ITEM);
   }
  }

  function lexEqual()
  {
   while (currChar === "=")
   {
    shiftChar();
   }
   if (LA_NL())
   {
    createToken(LEX_ENUM.ATX_END);
   }
   else
   {
    createToken(LEX_ENUM.ATX);
   }
  }

  function lexPlus()
  {
   if (LA_space(1))
   {
    shiftChar(2);
    createToken(LEX_ENUM.UL_ITEM);
   }
   else if (LA_substr("+}"))
   {
    shiftChar(3);
    createToken(LEX_ENUM.INS_END);
   }
  }

  function lexAsterisk()
  {
   if (LA_space(1))
   {
    shiftChar(2);
    createToken(LEX_ENUM.UL_ITEM);
   }
   else if (LA(1) === "*" && !LA_substr("***"))
   {
    shiftChar(2);
    createToken(LEX_ENUM.BOLD);
   }
   else if (LA_substr("***"))
   {
    while (currChar === "*")
    {
     shiftChar();
    }
    if (LA_NL())
    {
     createToken(LEX_ENUM.ASIDE_DELIM);
    }
   }
  }

  function lexExclaim()
  {
   if (LA(1) === "!")
   {
    shiftChar(2);
    createToken(LEX_ENUM.TH);
   }
   else if (LA(1) === "<" && OPT.ALLOW_IMG)
   {
    shiftChar(2);
    createToken(LEX_ENUM.LINK_IMG);
   }
  }

  function lexPipe()
  {
   if (LA(1) === "|")
   {
    shiftChar(2);
    createToken(LEX_ENUM.TD);
   }
   else if (LA(1) === "=")
   {
    shiftChar();
    while (currChar === "=")
    {
     shiftChar();
    }
    if (LA_NL())
    {
     createToken(LEX_ENUM.TR_DELIM);
    }
   }
  }

  function lexDblQuote()
  {
   if (LA_substr("\"\""))
   {
    while (currChar === "\"")
    {
     shiftChar();
    }
    createToken(LEX_ENUM.CODE);
   }
  }

  function lexHash()
  {
   if (LA(1) === "." && LA_space(2))
   {
    shiftChar(3);
    createToken(LEX_ENUM.OL_ITEM);
   }
   else if (LA(1) === "<" && OPT.ALLOW_LINK)
   {
    shiftChar(2);
    createToken(LEX_ENUM.LINK_WIKI);
   }
   else if (LA(1) === "[" && OPT.ALLOW_LINK)
   {
    shiftChar(2);
    createToken(LEX_ENUM.LINK_INT);
   }
  }

  function lexNumber()
  {
   while (REGEX_DIGIT.test(currChar))
   {
    shiftChar();
   }
   if (LA() === "." && LA_space(1))
   {
    shiftChar(2);
    createToken(LEX_ENUM.OL_ITEM);
   }
  }

  function lexCaret()
  {
   if (LA(1) === "^")
   {
    shiftChar(2);
    createToken(LEX_ENUM.SUP);
   }
  }

  function lexComma()
  {
   if (LA(1) === ",")
   {
    shiftChar(2);
    createToken(LEX_ENUM.SUB);
   }
  }

  function lexUnder()
  {
   if (LA(1) === "_")
   {
    shiftChar(2);
    createToken(LEX_ENUM.UNDER);
   }
  }

  function lexQuestion()
  {
   if (LA(1) === "<" && OPT.ALLOW_LINK)
   {
    shiftChar(2);
    createToken(LEX_ENUM.LINK_EXT);
   }
  }

  function lexLeftBracket()
  {
   shiftChar();
   createToken(LEX_ENUM.BRACKET_L);
  }

  function lexRightBracket()
  {
   shiftChar();
   createToken(LEX_ENUM.BRACKET_R);
  }

  function lexLeftBrace()
  {
   if (LA_substr("--"))
   {
    shiftChar(3);
    createToken(LEX_ENUM.DEL);
   }
   else if (LA_substr("++"))
   {
    shiftChar(3);
    createToken(LEX_ENUM.INS);
   }
  }

  function lexRightBrace()
  {
   if (LA(1) === ":")
   {
    shiftChar(2);
    createToken(LEX_ENUM.LINK_REF_END);
   }
  }

  function lexGT()
  {
   shiftChar();
   createToken(LEX_ENUM.GT_THAN);
  }

  function lexPeriod()
  {
   if (LA_NL(1))
   {
    shiftChar();
    createToken(LEX_ENUM.LABEL_STOP);
   }
   else if (OPT.ALLOW_ID && LA_space(1))
   {
    shiftChar(2);
    createToken(LEX_ENUM.LABEL_ID);
   }
   else if (OPT.ALLOW_CLASS && LA(1) === "." && LA_space(2))
   {
    shiftChar(3);
    createToken(LEX_ENUM.LABEL_CLASS);
   }
  }

  function lexSingleQuote()
  {
   if (LA(1) === "'")
   {
    shiftChar(2);
    createToken(LEX_ENUM.ITAL);
   }
  }

  function lexSlash()
  {
   if (LA_substr("///"))
   {
    while (currChar === "/")
    {
     shiftChar();
    }
    if (LA_NL())
    {
     createToken(LEX_ENUM.COMMENT_DELIM);
    }
   }
  }

  function lexSemiColon()
  {
   if (LA_space(1))
   {
    shiftChar(2);
    createToken(LEX_ENUM.DT_MARK);
   }
  }

  function lexColon()
  {
   if (LA_space(1))
   {
    shiftChar(2);
    createToken(LEX_ENUM.DD_MARK);
   }
   else if (LA(1) === "{")
   {
    shiftChar(2);
    createToken(LEX_ENUM.LINK_REF);
   }
  }

  function lexText()
  {
   while (!cases[currChar] && !LA_spaceNL() && hasMoreChars())
   {
    shiftChar();
   }
   createToken(LEX_ENUM.TEXT);
  }

  function lexSpace()
  {
   while (REGEX_WS.test(currChar))
   {
    shiftChar();
   }
   createToken(LEX_ENUM.SPACES);
  }

  function lexNL()
  {
   if (currChar === "\r" && LA(1) === "\n")
   {
    shiftChar(2);
    NLTally["\r\n"] = ((NLTally[currChar] || 0) + 1);
   }
   else
   {
    shiftChar(1);
    NLTally[currChar] = ((NLTally[currChar] || 0) + 1);
   }
   createToken(LEX_ENUM.NL);
   currCol = 1;
  }

  function lexBackslash()
  {
   skipChar();
   if (!LA_spaceNL())
   {
    shiftChar();
    lexText(LEX_ENUM.TEXT);
   }
   else if (LA_space())
   {
    lexSpace();
   }
   else
   {
    lexNL();
   }
  }

  while (hasMoreChars())
  {
   if (cases[currChar])
   {
    cases[currChar]();
   }
   else if (REGEX_WS.test(currChar))
   {
    lexSpace();
   }
   else if (REGEX_NL.test(currChar))
   {
    lexNL();
   }
   else if (REGEX_DIGIT.test(currChar))
   {
    lexNumber();
   }
   else
   {
    lexText();
   }

   if (currPos === lastPos)
   {
    shiftChar();
   }

   if (currTok === nullToken)
   {
    lexText();
   }
   currChar = BBMCode.charAt(currPos);
   currTok = nullToken;
   lastCol = currCol;
   lastPos = currPos;
  }

  createToken(LEX_ENUM.EOF);

  var NLFreq = 0;
  for (var NLType in NLTally)
  {
   if (NLTally[NLType] > NLFreq)
   {
    NLFreq = NLTally[NLType];
    NL_STR = NLType; //Set default NL.
   }
  }
  if (NL_STR !== "\r\n" && NL_STR !== "\r" && NL_STR !== "\n")
  {
   NL_STR = "\n"; //Bad Default NL. Reset to Windows NL.
  }

  return tokenList;
 }

 //Generates the basic syntax tree.
 function parser(tokenList)
 {
  var AST = new ASTNode(AST_ENUM.ROOT),
  currPos = 0,
  currTok = tokenList[currPos],
  nestLvl = 0,
  IDTable = {};

  function shift()
  {
   if (tokenList[currPos + 1])
   {
    currPos += 1;
    currTok = tokenList[currPos];
   }
   return currPos;
  }

  function shiftTo(newPos)
  {
   if (tokenList[newPos])
   {
    currPos = newPos;
    currTok = tokenList[currPos];
   }
   return currPos;
  }

  function LA(tokenType, off) //LookAhead
  {
   var realLA = off ? (off + currPos) : currPos;
   if (tokenList[realLA])
   {
    return (tokenList[realLA].isType(tokenType));
   }
   return false;
  }

  function LA_EOL(offset)
  {
   var off = offset || 0;
   return (LA(LEX_ENUM.NL, off) || LA(LEX_ENUM.EOF, off));
  }

  function LA_hasNext()
  {
   return ((currTok instanceof LexToken) && !LA(LEX_ENUM.EOF));
  }

  function LA_trimLeadWS(minCol)
  {
   var isWS = LA(LEX_ENUM.SPACES);
   if (isWS && LA_isLineStart())
   {
    currTok.lexeme = currTok.substring(minCol - 1, currTok.getLength());
   }
   return isWS;
  }

  function LA_isParaEnd(minCol)
  {
   if (!LA_hasNext() || LA_isBlankLine())
   {
    return true;
   }
   if (currTok.col < minCol && !LA(LEX_ENUM.SPACES) && !LA_EOL())
   {
    return true;
   }

   var isDelim = LEX_PARA_DELIM_MAP[currTok.type];
   var isAloneLine = LA_isLineStart() && LA_isELR();
   return isDelim && isAloneLine;
  }

  function LA_isLineStart()
  {
   return (LA_EOL(-1) || (LA(LEX_ENUM.SPACES, -1) && LA_EOL(-2)));
  }

  function LA_isBlankLine()
  {
   var off = 0;
   if (!LA_EOL(off))
   {
    return false;
   }
   if (LA_EOL(off + 1))
   {
    return true;
   }
   return (LA(LEX_ENUM.SPACES, off + 1) && LA_EOL(off + 2));
  }

  function LA_isSetext(minCol)
  {
   if (!LA_isLineStart() || currTok.col !== minCol)
   {
    return false;
   }
   return LA(LEX_ENUM.DIV_LINE) || LA(LEX_ENUM.ATX_END);
  }

  function LA_isELR()
  {//Empty line remainder after the current token?
   return (LA_EOL(1) || (LA(LEX_ENUM.SPACES, 1) && LA_EOL(2)));
  }

  function LA_isBracketBal(b_stack, symbol)
  {//Given the current token & a bracket stack, check bracket balancing.
   var sym = symbol ? symbol : currTok;
   if (!b_stack) {return false;}
   if (LEX_BRACKET_L_MAP[sym.type])
   {
    b_stack.push(0);
   }
   else if (LEX_BRACKET_R_MAP[sym.type])
   {
    b_stack.pop();
   }
   return (b_stack.length <= 0); //Ignore all other tokens.
  }

  function LA_isEndURL(urlTok)
  {//Is {"?<", "!<", or "#<"} matched with ">"?
   return LA(LEX_ENUM.GT_THAN) && LEX_ANGLE_LINK_MAP[urlTok.type];
  }

  function LA_isMatchingDelim(delimTok)
  {
   if (!LA_isLineStart() || currTok.col !== delimTok.col || !LA_isELR())
   {
    return false;
   }
   return currTok.isSameType(delimTok) && currTok.lexeme === delimTok.lexeme;
  }

  function LA_isEndCode(codeToken)
  {//Is """ matched with another """?
   if (currTok === codeToken || !currTok.isSameType(codeToken))
   {//Do not permit identical token objects or wrong type of quotes.
    return false;
   }
   return LA(LEX_ENUM.CODE) && currTok.lexeme == codeToken.lexeme;
  }

  function LA_isLinkCont()
  {//Link SPACES? NL? SPACES? LINK_CONT
   var offset = 0;
   if (LA(LEX_ENUM.SPACES, offset)) {offset += 1;}
   if (LA(LEX_ENUM.NL, offset)) {offset += 1;}
   if (LA(LEX_ENUM.SPACES, offset)) {offset += 1;}
   return LA(LEX_ENUM.LINK_CONT, offset);
  }

  function extractText(start, end)
  {
   var str = "";
   for (var i = start; i < end && (tokenList[i] instanceof LexToken); i += 1)
   {
    str += tokenList[i].lexeme;
   }
   return str;
  }

  function skipUntil(untilMap, toStr)
  {
   var savedPos = currPos;
   while (LA_hasNext() && !untilMap[currTok.type])
   {
    shift();
   }
   if (toStr)
   {
    return extractText(savedPos, currPos);
   }
  }

  function skipLine(toStr, past) //Skip the rest of the line.
  {
   var savedPos = currPos;
   while (!LA_EOL())
   {
    shift();
   }
   if (past)
   {
    shift();
   }
   if (toStr)
   {
    return extractText(savedPos, currPos);
   }
  }

  function skipWSNL() //Skip white space and newlines.
  {
   while (LA(LEX_ENUM.SPACES) || LA(LEX_ENUM.NL))
   {
    shift();
   }
  }

  function parseAside()
  {
   var asideToken = currTok;
   var asideNode = new ASTNode(AST_ENUM.ASIDE);
   skipLine(false, true);
   skipWSNL();
   while (LA_hasNext() && currTok.col >= asideToken.col)
   {
    if (LA_isMatchingDelim(asideToken))
    {
     skipLine();
     break;
    }
    asideNode.addNode(parseBlock());
    skipWSNL();
   }
   return asideNode;
  }

  function parseATX()
  {
   var hLen = currTok.lexeme.length;
   var startPos = currPos;
   shift();

   var hText = str_trim(skipUntil(LEX_ATX_END_MAP, true));
   skipLine();

   if (hText.length === 0)
   {
    shiftTo(startPos);
    currTok.type = LEX_ENUM.TEXT;
    return null;
   }

   var hNode = new ASTNode(AST_ENUM.HEADER);
   hNode.addText(hText);
   hNode.meta.HEADERLVL = hLen;
   return hNode;
  }

  function parseBlock()
  {
   var blockNode = null;
   var isNotAbuse = nestLvl < OPT.MAX_BLOCKS;
   skipWSNL();
   if (LEX_AST_LIST_MAP[currTok.type] && isNotAbuse)
   {//Tables, blockquotes, lists.
    nestLvl += 1;
    blockNode = parseList();
    nestLvl -= 1;
   }
   else if (LA(LEX_ENUM.LABEL_ID) || LA(LEX_ENUM.LABEL_CLASS))
   {
    return parseLabel(); //Don't use paragraph error fallback for this one.
   }
   else if (LA(LEX_ENUM.CODE) && LA(LEX_ENUM.NL, 1))
   {
    blockNode = parseCodeBlock();
   }
   else if (LA(LEX_ENUM.ASIDE_DELIM) && isNotAbuse)
   {
    nestLvl += 1;
    blockNode = parseAside();
    nestLvl -= 1;
   }
   else if (LA(LEX_ENUM.ATX))
   {
    blockNode = parseATX();
   }
   else if (LA(LEX_ENUM.LINK_REF))
   {
    blockNode = parseLinkRef();
   }
   else if (LA(LEX_ENUM.COMMENT_DELIM))
   {
    parseComment();
    return blockNode;
   }
   else if (LA(LEX_ENUM.TR_DELIM)) //Table row delimiter
   {
    skipLine();
    blockNode = new ASTNode(AST_ENUM.TR);
   }
   else if (LA(LEX_ENUM.LABEL_STOP)) //Block Stopper
   {
    skipLine();
    blockNode = new ASTNode(AST_ENUM.STOP);
   }
   else if (LA(LEX_ENUM.DIV_LINE)) //Divider Line
   {
    skipLine();
    blockNode = new ASTNode(AST_ENUM.DIV_LINE);
   }
   else if (LA(LEX_ENUM.ATX_END))
   {
    currTok.type = LEX_ENUM.TEXT; //Demote; avoid Setext Recognition
   }

   if (!blockNode && LA_hasNext()) //Error Recovery: Paragraphs.
   {
    skipWSNL();
    blockNode = parsePara();
   }

   return blockNode;
  }

  function parseCodeBlock()
  {
   var cbNode = new ASTNode(AST_ENUM.CODE_BLOCK);
   var cbToken = currTok;

   skipLine(false, true);
  
   var startPos = currPos;
   var endPos = currPos;
  
   while (LA_hasNext())
   {
    LA_trimLeadWS(cbToken.col);
    if (LA_isMatchingDelim(cbToken))
    {
     break;
    }
    endPos = shift();
   }

   if (LA(LEX_ENUM.SPACES, -1))
   {
    endPos -= 1;
   }

   cbNode.addText(extractText(startPos, endPos));
   if (startPos >= endPos)
   {//Add an EOL filler if the fenced code block is empty.
    cbNode.addText(NL_STR);
   }
   skipLine();
   return cbNode;
  }

  function parseComment()
  {
   var commentToken = currTok;
   while (LA_hasNext())
   {
    skipLine();
    skipWSNL();
    if (LA_isMatchingDelim(commentToken))
    {
     skipLine();
     break;
    }
   }
  }

  function parseLabel()
  {
   var isID = currTok.isType(LEX_ENUM.LABEL_ID);
   shift(); //Skip the start symbol, then consume the line of text.
   var labelName = str_encodeCSS(skipLine(true, false));
   
   if (labelName.length === 0 || (isID && IDTable[labelName]))
   {
    return null; //No empty names or repeated ID allowed.
   }
   else if (isID)
   {
    IDTable[labelName] = labelName;
   }
   return new ASTNode(isID ? AST_ENUM.ID : AST_ENUM.CLASS, {ID : labelName});
  }

  function parseList() //Tables, Various lists, blockquote.
  {
   var node_li = new ASTNode(LEX_AST_LIST_MAP[currTok.type]);
   shift(); //Skip the starting token.
   if (LA(LEX_ENUM.SPACES))
   {
    shift(); //Skip trailing space as well.
   }

   if (LA_EOL())
   {
    return node_li; //Empty block item.
   }

   if (node_li.isType(AST_ENUM.DT))
   {
    node_li.addNodes(parsePara());
    return node_li;
   }

   var minCol = currTok.col;
   while (LA_hasNext() && currTok.col >= minCol)
   {
    node_li.addNode(parseBlock());
    skipWSNL();
   }
   return node_li;
  }

  function parseLinkRef() //Reference-style Links
  {
   var startPos = currPos,
    id = "",
    url = "";

   shift();
   id = str_encodeURL(skipUntil(LEX_REF_END_MAP, true));
   if (!LA(LEX_ENUM.LINK_REF_END))
   {//ID didn't close properly.
    shiftTo(startPos);
    return parsePara();
   }
   shift();
   url = str_encodeURL(skipLine(true)); //The rest of the line is the URL.
   if (id.length === 0 || url.length === 0)
   { //Empty ID or URL
    shiftTo(startPos);
    return parsePara();
   }
   return new ASTNode(AST_ENUM.LINK_REF, {REF_ID : id, URL : url});
  }

  /*
  startCol: The paragraph's left margin.
  formatStack: A list of text-formatting tags in effect.
  b_stack: Bracket stack. If present and this is empty, the paragraph ends.
  noLink: If true, disallow wiki, external, and internal links.
  */
  function parsePara(startCol, formatStack, b_stack, noLink)
  {
   var fmtStack = formatStack ? formatStack : [],
   minCol = (startCol || currTok.col),
   paraNode = new ASTNode(AST_ENUM.PARA),
   txtStart = currPos,
   txtEnd = currPos,
   symbol = currTok,
   canEditLink = false,
   subNode = null;

   while (!LA_isParaEnd(minCol))
   {
    LA_trimLeadWS(minCol);
    if (!canEditLink && LA_isBracketBal(b_stack, symbol))
    { //Bracket balancing, unless expecting a LINK_CONT token.
     break;
    }

    if (LEX_AST_FMT_MAP[symbol.type])
    { //Text-formatting.
     var foundAt = arr_lastIndexOf(fmtStack, symbol.type);
     if (foundAt >= 0)
     {
      if (foundAt === fmtStack.length - 1)
      { //Good tag nesting if found atop the stack.
       paraNode.type = LEX_AST_FMT_MAP[symbol.type];
      }
      break;
     }

     var endSymbol = LEX_FMT_START_END_MAP[symbol.type];
     var isAbuse = fmtStack.length >= OPT.MAX_SPANS;
     if (endSymbol && !isAbuse)
     { //New text-formatting tag, given these conditions.
      shift();
      fmtStack.push(endSymbol);
      subNode = parsePara(minCol, fmtStack, b_stack, noLink);
      fmtStack.pop();
      subNode.err = subNode.isType(AST_ENUM.PARA);
     }
    }
    else if (LEX_AST_LINK_MAP[symbol.type])
    { //Hyperlink.
     subNode = parseURL(minCol, noLink);
    }
    else if (symbol.isType(LEX_ENUM.CODE))
    { //Inline Code
     subNode = parseCode(minCol);
    }
    else if (canEditLink && symbol.isType(LEX_ENUM.LINK_CONT))
    { //Modifying hyperlink subtree.
     var linkNode = parseLinkCont(minCol, paraNode.getLast());
     if (linkNode === paraNode.getLast()) //Successful link modification.
     {
      txtStart = currPos + 1; //Skip to the end of the link.
     }
     else //Failure
     {
      subNode = linkNode; //Append the subtree as normal paragraph.
     }
     canEditLink = false;
    }


    if (subNode instanceof ASTNode)
    {
     if (subNode.err)
     { //If sub-node has errors, eat the starting token as text.
      txtEnd += 1;
     }
     else if (!LA_isParaEnd(minCol))
     { //Skip the sub-node's ending token otherwise.
      shift();
      canEditLink = AST_LINK_MAP[subNode.type] && LA_isLinkCont();
     }
     paraNode.addText(extractText(txtStart, txtEnd));
     paraNode.addNode(subNode);
     txtStart = currPos;
    }
    else
    { //Insignificant token.
     shift();
    }

    txtEnd = currPos;
    symbol = currTok;
    subNode = null;
   }

   if (!formatStack && LA_isSetext(minCol))
   { //Promote to HEADER if SeTeXT && Root Paragraph
    paraNode.type = AST_ENUM.HEADER;
    paraNode.meta.HEADERLVL = LA(LEX_ENUM.ATX_END) ? 1 : 2;
    shift();
   }

   paraNode.addText(extractText(txtStart, txtEnd));
   return paraNode;
  }

  function parseLinkCont(minCol, linkNode)
  {
   if (!(linkNode instanceof ASTNode && AST_LINK_MAP[linkNode.type]))
   {
    return null; //Not link or image. Return no node.
   }

   var subNode = null;
   if (linkNode.isType(AST_ENUM.LINK_IMG))
   {
    subNode = parseVerbatim(minCol);
    if (subNode.err)
    {
     return subNode;
    }
    linkNode.meta.ALT = subNode.meta.TEXT; //Balanced; Set Alt Text.
   }
   else
   {
    var b_stack = [0];
    shift(); //Skip the leading bracket.
    subNode = parsePara(minCol, [], b_stack, true);
    if (b_stack.length !== 0)
    {
     subNode.err = true;
     return subNode;
    }
    linkNode.addNodes(subNode); //Subtree is balanced; Modify link node.
   }
   return linkNode;
  }

  function parseCode(minCol)
  {
   var codeContent = parseVerbatim(minCol);
   if (codeContent.err)
   {
    return codeContent;
   }
   var codeNode = new ASTNode(AST_ENUM.CODE);
   codeNode.addNode(codeContent);
   return codeNode;
  }

  function parseURL(minCol, noLink) //TEXT on failure, LINK on success.
  {
   var symbol = currTok;
   var isImg = symbol.isType(LEX_ENUM.LINK_IMG);
   if (noLink && !isImg)
   {
    return null; //No hyperlinks allowed under LinkDisplayText context.
   }

   var linkNode = parseVerbatim(minCol);
   if (!linkNode.err)
   { //Transform into a proper hyperlink/image node.
    linkNode.type = LEX_AST_LINK_MAP[symbol.type];
    linkNode.meta.URL = str_encodeURL(linkNode.meta.TEXT);
    linkNode.err = (linkNode.meta.URL.length === 0);
    if (linkNode.err)
    {
     linkNode.type = AST_ENUM.TEXT; //Bad URL value. Demote to a TEXT node.
     delete linkNode.meta.URL;
    }
    else
    {
     delete linkNode.meta.TEXT;
     if (isImg)
     {
      linkNode.meta.ALT = "";
     }
    }
   }
   return linkNode;
  }

  function parseVerbatim(minCol) //TEXT. Always
  {
   var txt_node = new ASTNode(AST_ENUM.TEXT),
   s_tok = currTok,
   s_pos = currPos + 1,
   b_stack = LEX_BRACKET_L_MAP[s_tok.type] ? [0] : null;

   txt_node.err = true; //Assume verbatim text parsing will fail.
   shift(); //Skip starting symbol
   while (!LA_isParaEnd(minCol))
   {
    LA_trimLeadWS(minCol);
    if (LA_isBracketBal(b_stack) || LA_isEndCode(s_tok) || LA_isEndURL(s_tok))
    {//Balanced brackets, inline code, angle link -> End of verbatim text
     txt_node.err = false;
     break;
    }
    shift();
   }
   txt_node.meta.TEXT = extractText(s_pos, currPos);
   return txt_node;
  }

  while (LA_hasNext())
  {
   AST.addNode(parseBlock());
  }
  return AST;
 }

 //Prunes the syntax tree.
 function filter(AST)
 {
  function filterTable(node)
  {
   var last = node.getLast();
   while (last && last.isType(AST_ENUM.TR) && last.getLength() === 0)
   {
    node.pop(); //Remove trailing, empty rows.
    last = node.getLast();
   }

   var maxCol = node.getFirst().getLength();
   for (var i = 0, ii = node.getLength(); i < ii; i += 1)
   {
    var ch = node.children[i];
    while (ch.getLength() > maxCol)
    { //Too many columns at this row; shrink.
     ch.pop();
    }
    while (ch.getLength() < maxCol && ch.getLength() > 0)
    { //Except for intentionally empty rows, fill this row with empty cells.
     ch.addNode_simple(new ASTNode(AST_ENUM.TD));
    }
    ch.isDeleted = ch.getLength() <= 0;
   }
  }

  function filterDL(node)
  {
   var last = node.getLast();
   while (last && last.isType(AST_ENUM.DT))
   {
    node.pop(); //Remove trailing DT nodes.
    last = node.getLast();
   }

   var first = node.getFirst();
   while (first && first.isType(AST_ENUM.DD))
   {
    node.popFirst(); //Remove leading DD ndoes.
    first = node.getFirst();
   }
   node.isDeleted = node.getLength() === 0;
  }
  
  function filterInline(node)
  {
   var i = 0, ii = 0, ch = null;
   for (i = 0, ii = node.getLength(); i < ii; i += 1)
   {
    ch = node.children[i];
    if (ch.isType(AST_ENUM.TEXT) && !REGEX_WS_ONLY.test(ch.meta.TEXT))
    {
     break;
    }
    else if (ch.getLength() > 0 || AST_LINK_MAP[ch.type])
    {
     filterInline(ch);
     if (!ch.isDeleted) {break;}
    }
   }
   
   node.isDeleted = (i >= ii && !AST_LINK_MAP[node.type]);
   if (node.isDeleted) {return;}
   
   //If the link's display text contains only WS, remove that text node.
   if (AST_LINK_MAP[node.type] && node.getLength() === 1)
   {
    ch = node.getLast();
    if (ch.isType(AST_ENUM.TEXT) && REGEX_WS_ONLY.test(ch.meta.TEXT))
    {
     node.pop();
    }
   }
   
   if (OPT.RM_EOL)
   {
    for (i = 0, ii = node.getLength(); i < ii; i += 1)
    {
     ch = node.children[i];
     if (ch.isType(LEX_ENUM.TEXT))
     {
      ch.meta.TEXT = str_removeEOL(ch.meta.TEXT);
     }
    }
   }
  }

  function filterBlock(node)
  {
   for (var i = 0, ii = node.getLength(); i < ii; i += 1)
   {
    var ch = node.children[i];
    if (ch.isType(AST_ENUM.TABLE)) {filterTable(ch);}
    if (ch.isType(AST_ENUM.DL)) {filterDL(ch);}

    if (ch.isType(AST_ENUM.TEXT) || AST_SPAN_MAP[ch.type] ||
    AST_LINK_MAP[ch.type])
    {
     filterInline(node);
     if (!node.isDeleted)
     {
      var last = node.getLast();
      if (last.isType(AST_ENUM.TEXT))
      {
       last.meta.TEXT = str_trimTail(last.meta.TEXT);
      }
     }
     return;
    }
    else if (ch.getLength() > 0 && !ch.isType(AST_ENUM.CODE_BLOCK))
    {//If not codeblock and has subtree, filter it too.
     filterBlock(ch);
    }
    ch.isDeleted = (AST_BLOCK_NON_EMPTY_MAP[ch.type] && ch.getLength() <= 0);
   }
   filterTail(node);
  }

  function filterTail(node)
  {
   var i = node.getLength() - 1;
   for (i; i >= 0; i -= 1)
   {
    var ch = node.children[i];
    if (ch.isDeleted || AST_ID_CLASS_MAP[ch.type])
    { //Remove trailing ID, CLASS, STOP, and other deleted nodes.
     node.pop();
    }
    else {break;}
   }
   node.isDeleted = (i < 0) && !AST_LINK_MAP[node.type];
  }

  function isNodeKept(node)
  {
   if (node.isDeleted)
   {
    return false; //Chop off deleted subtree.
   }
   node.children = arr_filter(node.children, isNodeKept);
   if (AST_BLOCK_NON_EMPTY_MAP[node.type] || AST_SPAN_MAP[node.type])
   {//Propagate deletion if the node is not allowed to be empty.
    node.isDeleted = node.getLength() <= 0;
   }
   return !node.isDeleted;
  }

  filterBlock(AST);
  AST.children = arr_filter(AST.children, isNodeKept);
  return AST;
 }

 //Performs Lexing, Parsing, then filtering
 function frontEnd(BBMCode)
 {
  return filter(parser(lexer(BBMCode)));
 }

 //Returns the HTML snippet from the parse tree.
 function codeGen(AST)
 {
  function printTagOpen(node, attrMap)
  {
   if (!AST_HTML_MAP[node.type])
   {
    return ""; //These kinds of nodes don't have an HTML tag.
   }

   var tagName = AST_HTML_MAP[node.type];
   var openTagStr = "<" + tagName;

   if (node.isType(AST_ENUM.HEADER) && node.meta.HEADERLVL)
   {
    var h_lvl = node.meta.HEADERLVL + OPT.MIN_HEADER;
    openTagStr += (h_lvl > 6) ? "6" : (h_lvl + "");
   }

   if (attrMap)
   {
    for (var each in attrMap)
    {
     attrMap[each] = attrMap[each].substring(0, OPT.MAX_ATTR_CHARS);
     openTagStr += " " + each + "=\"" +
     str_encodeHTMLAttr(attrMap[each]) + "\"";
    }
   }

   if (AST_XHTML_MAP[node.type] && OPT.XHTML)
   {
    openTagStr += "/";
   }
   openTagStr += ">";

   if (node.isType(AST_ENUM.CODE_BLOCK))
   {
    openTagStr += "<code>";
   }
   return openTagStr;
  }

  function printTagClose(node)
  {
   if (!AST_HTML_MAP[node.type])
   {
    return "";
   }

   var tagName = AST_HTML_MAP[node.type];
   if (node.isType(AST_ENUM.HEADER) && node.meta.HEADERLVL)
   {
    var h_lvl = node.meta.HEADERLVL + OPT.MIN_HEADER;
    tagName += (h_lvl > 6) ? "6" : (h_lvl + "");
   }
   if (node.isType(AST_ENUM.CODE_BLOCK))
   {
    return "</code>" + "</" + tagName + ">";
   }
   return "</" + tagName + ">";
  }

  function printText(node)
  {
   if (!(node instanceof ASTNode) || !node.meta.TEXT)
   {
    return "";
   }
   if (OPT.XHTML)
   { //If XHTML, encode ", ', and / as well
    return str_encodeHTML(node.meta.TEXT);
   }
   return str_encodeHTMLBody(node.meta.TEXT);
  }

  function printLink(node)
  {
   var url = node.meta.URL,
    isImg = node.isType(AST_ENUM.LINK_IMG),
    altText = node.meta.ALT, //alt text -> Image node.
    parent = node.parent,
    isParentLink = false;

   while (parent)
   {
    if (AST_LINK_MAP[parent.type])
    {
     isParentLink = true;
    }
    if (parent.meta.SYM_TABLE && parent.meta.SYM_TABLE[url])
    {
     url = parent.meta.SYM_TABLE[url];
     break;
    }
    parent = parent.parent;
   }

   if (node.isType(AST_ENUM.LINK_INT))
   {
    url = "#" + str_printCSSID(url, true);
   }

   if (isImg && REGEX_WS_ONLY.test(altText) && isParentLink)
   {
    altText = url;
   }

   var linkAttr = isImg ? {src : url, alt : altText} : {href : url};
   if (isImg)
   {
    return printTagOpen(node, linkAttr);
   }
   if (node.isType(AST_ENUM.LINK_WIKI))
   {
    linkAttr["class"] = str_encodeCSS(OPT.CSS_WIKI);
   }

   if (node.getLength() > 0)
   {
    return printTagOpen(node, linkAttr) + printInline(node, linkAttr) +
    printTagClose(node);
   }
   return printTagOpen(node, linkAttr) + str_encodeHTMLBody(node.meta.URL) +
   printTagClose(node);
  }

  function printInline(node)
  {
   var cc = node.getLength(), ci = 0, middle = "";

   for (ci = 0; ci < cc; ci += 1)
   {
    var ch = node.children[ci];
    if (AST_LINK_MAP[ch.type])
    {
     middle += printLink(ch);
    }
    else if (AST_SPAN_MAP[ch.type])
    {
     middle += printTagOpen(ch) + printInline(ch) + printTagClose(ch);
    }
    else
    {
     middle += printText(ch);
    }
   }
   return middle;
  }

  function printDivLine(node, attrMap, lvl)
  {
   return (str_repeat(WS_STR, lvl) + printTagOpen(node, attrMap) + NL_STR);
  }

  function printBlock(node, attrMap, lvl, last)
  {
   var cc = node.getLength(),
    ci = 0,
    ch = null,
    middle = "",
    classes = null,
    chAttrTable = null,
    id = null,
    returnStr = "",
    open = printTagOpen(node, attrMap),
    close = printTagClose(node, attrMap),
    indent = str_repeat(WS_STR, lvl);

   for (ci = 0; ci < cc; ci += 1)
   {
    ch = node.children[ci];
    if (ch.isType(AST_ENUM.ID))
    {
     id = str_printCSSID(ch.meta.ID);
     continue;
    }
    else if (ch.isType(AST_ENUM.CLASS))
    {
     classes = classes ? classes : [];
     classes.push(ch.meta.ID);
     continue;
    }
    else
    {//Prepare attribute table. Clear id & class buffer.
     if (id || classes)
     {
      chAttrTable = {};
      if (id)
      {
       chAttrTable.id = id;
      }
      if (classes)
      {
       chAttrTable["class"] = str_printCSSClasses(classes, true);
      }
     }
     id = null;
     classes = null;
    }

    if (ch.isType(AST_ENUM.DIV_LINE))
    {
     middle += printDivLine(ch, attrMap, lvl);
    }
    else if (ch.isType(AST_ENUM.TEXT) || AST_SPAN_MAP[ch.type] ||
    AST_LINK_MAP[ch.type])
    {
     middle += printInline(node); //Let printInline enumerate this subtree.
     break;
    }
    else
    {
     middle += printBlock(ch, chAttrTable, lvl + 1, (ci === cc - 1));
    }
    chAttrTable = null;
   }

   if (node.isType(AST_ENUM.CODE_BLOCK))
   {
    returnStr = open + middle + close;
   }
   else if (node.isType(AST_ENUM.ROOT))
   {
    return middle;
   }
   else
   { //Alternatively, just trim trailing WS for the middle here.
    returnStr = indent + open + NL_STR + middle + NL_STR + indent + close;
   }

   if (!last)
   {
    returnStr += NL_STR;
   }
   return returnStr;
  }
  return printBlock(AST, null, -1, false);
 }

 function setOptions(options)
 {
  return obj_merge(OPT, options);
 }

 function compile(BBMCode, options)
 {
  var oldOpt = obj_merge({}, OPT);
  setOptions(options);
  var text = codeGen(frontEnd(BBMCode));
  OPT = oldOpt;
  return text;
 }

 return {
  lexer : lexer,
  parser : parser,
  filter : filter,
  frontEnd : frontEnd,
  compile : compile,
  setOptions : setOptions,
  AST_ENUM : AST_ENUM,
  LEX_ENUM : LEX_ENUM,
  
  //Expose constructors AST and Token object constructors
  ASTNode : function(type, meta)
  {
   return (new ASTNode(type, meta));
  },
  LexToken : function(type, lexeme, col)
  {
   return (new LexToken(type, lexeme, col));
  }
  
 };
}());

//Node.js module exports; The export object is the compiler itself.
if (typeof module != "undefined")
{
 module.exports = BBM;
}
