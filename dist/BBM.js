(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	module.exports = __webpack_require__(1);



/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var BBM = module.exports = __webpack_require__(2);
	var __ = __webpack_require__(3);
	var Lexer = __webpack_require__(4);
	var LEX = Lexer.ENUM;
	var AST = BBM.ENUM;
	var EOF = {};
	var LEX_FMT =
	{
	  DEL : 1
	, BOLD : 1
	, EM : 1
	, SUP : 1
	, SUB : 1
	, UNDER : 1
	};

	var LEX_LINKS =
	{
	  LINK_INT : 1
	, LINK_WIKI : 1
	, LINK_EXT : 1
	};

	var LEX_BLOCK =
	{
	  HR : parseHRTR
	, TRSEP : parseHRTR
	, REF : parseRef
	, ATX : parseATX
	, COMMENT : parsePre
	, PRE : parsePre
	, DIV : parseDiv
	, CLASS : parseLabel
	, ID : parseLabel
	};

	var LEX_LIST =
	{
	  TH : AST._TH
	, TD : AST._TD
	, GT : AST.BLOCKQUOTE
	, DT : AST._DT
	, DD : AST._DD
	, OL : AST._LI_OL
	, UL : AST._LI_UL
	};

	var LEX_INLINE =
	{
	  LINK_INT : AST.LINK_INT
	, LINK_EXT : AST.LINK_EXT
	, LINK_IMG : AST.LINK_IMG
	, LINK_WIKI : AST.LINK_WIKI
	, DEL : AST.DEL
	, BOLD : AST.BOLD
	, EM : AST.EM
	, SUP : AST.SUP
	, SUB : AST.SUB
	, UNDER : AST.U
	, CODE : AST.CODE
	, PRE : AST.CODE
	};




	// Block-level iterators
	// ---------------------

	function notWSNL(tok)
	{
	 return tok.type !== LEX.WS && tok.type !== LEX.NL;
	}

	function isNL(tok)
	{
	 return tok.type === LEX.NL;
	}

	function isRefEnd(tok)
	{
	 return tok.type === LEX.NL || tok.type === LEX.REF_END;
	}

	function isATXEnd(tok)
	{
	 return tok.type === LEX.NL || tok.type === LEX.ATX_END;
	}

	function isParaEnd(tok, lexer)
	{
	 return lexer.isLineStart() &&
	 (
	  lexer.isLineEnd()
	  || isDelim(tok)
	  || (notWSNL(tok) && tok.col < lexer.minCol)
	 );
	}

	function isSetext(tok)
	{
	 return tok.type === LEX.ATX_END || tok.type === LEX.HR;
	}

	function isDelim(tok)
	{
	 return isSetext(tok) || tok.type === LEX.DIV;
	}



	// Inline-level Iterators
	// ----------------------

	function isCodeEnd(tok, tokStart)
	{
	 return (tok.type === LEX.CODE || tok.type === LEX.PRE)
	 && (tokStart.type === LEX.CODE || tokStart.type === LEX.PRE)
	 && tok.lexeme === tokStart.lexeme;
	}

	function isBracket(tok)
	{
	 return tok.type === LEX.BRACKET_R;
	}

	function isAngle(tok)
	{
	 return tok.type === LEX.GT;
	}

	function isCont(tok)
	{
	 return tok.type === LEX.LINK_CONT || notWSNL(tok);
	}

	function isInline(tok, hasLink)
	{
	 return (hasLink && tok.type === LEX.BRACKET_R) || !!LEX_INLINE[tok.type];
	}



	// Block-level Grammar
	// -------------------

	function parseBlock(lexer)
	{
	 var tok = lexer.peekUntil(notWSNL) || EOF;
	 var node = null;
	 var func = LEX_LIST[tok.type]
	 ? parseListPre
	 : LEX_BLOCK[tok.type]
	 ? LEX_BLOCK[tok.type]
	 : null;

	 lexer.lvl += 1;
	 if (func && lexer.lvl <= lexer.maxDepth)
	 {
	  node = func(lexer, tok);
	 }
	 else if (tok !== EOF)
	 {
	  node = parsePara(lexer, tok);
	 }
	 lexer.lvl -= 1;
	 return node;
	}

	function parseListPre(lexer, lexTok)
	{
	 lexer.next();
	 if (lexer.isLineEnd())
	 {
	  return BBM(LEX_LIST[lexTok.type]);
	 }
	 lexer.nextUntil(notWSNL);
	 
	 return lexTok.type === LEX.DT
	 ? parsePara(lexer, lexer.peek() || EOF, AST._DT)
	 : parseList(lexer, lexTok);
	}

	function parseList(lexer, lexTok)
	{
	 var node = BBM(LEX_LIST[lexTok.type]);
	 var col = lexTok.col + lexTok.lexeme.length;
	 var tok = null;
	  
	 while ((tok = lexer.peekUntil(notWSNL)) && tok.col >= col)
	 {
	  node.append(parseBlock(lexer));
	 }
	 return node;
	}

	function parseHRTR(lexer, lexTok)
	{
	 lexer.nextPast(isNL);
	 return BBM(lexTok.type === LEX.HR ? AST.HR : AST._TR);
	}

	function parseDiv(lexer, lexTok)
	{
	 var node = BBM(AST.DIV);
	 var col = lexTok.col;
	 var tok = null;

	 lexer.nextPast(isNL);
	 while ((tok = lexer.peekUntil(notWSNL)) && tok.col >= col)
	 {
	  if (lexer.isDelim(tok, lexTok) && lexer.nextPast(isNL))
	  {
	   break;
	  }
	  node.append(parseBlock(lexer));
	 }
	 return node;
	}

	function parsePre(lexer, lexTok)
	{
	 var text = lexer.nextPast(isNL).textPast(Lexer.fn.isDelim, lexTok, lexTok.col);
	 text = __.rmNLTail(text);
	 if (lexTok.type === LEX.PRE)
	 {
	  return BBM(AST.PRE).append(text);
	 }
	 return BBM(AST.COMMENT).append(text);
	}

	function parseATX(lexer, lexTok)
	{
	 var startPos = lexer.next().pos;
	 var endPos = lexer.nextUntil(isATXEnd).pos;
	 var endTok = lexer.peek() || EOF;
	 var node = BBM(AST.HEADER);
	 
	 node.level = lexTok.lexeme.length;
	 
	 lexer.mark = endPos;
	 lexer.pos = startPos;
	 parseInline(lexer, node);
	 lexer.mark = -1;
	 lexer.pos = (endPos <= startPos || isATXEnd(endTok)) ? endPos + 1 : endPos;
	 
	 return node;
	}

	function parseLabel(lexer, lexTok)
	{
	 var idClass = __.rmCTRL(lexer.next().textPast(isNL)).trim();
	 var isID = lexTok.type === LEX.ID;
	 if (idClass)
	 { 
	  return BBM(isID ? AST._ID : AST._CLASS).attr(isID ? "id" : "class", idClass);
	 }
	}

	function parseRef(lexer)
	{
	 var id = lexer.next().textPast(isRefEnd).trim();
	 var url = lexer.peekT(LEX.NL, -1) ? "" : lexer.textUntil(isNL).trim();
	 if (url && id)
	 {
	  lexer.root.symTable[id] = url;
	 }
	}

	function parsePara(lexer, lexTok, forceType)
	{
	 var minCol = lexer.minCol = lexTok.col || 0;
	 var startPos = lexer.pos;
	 var endPos = lexer.nextUntil(isParaEnd, lexer).pos;
	 var endTok = lexer.peek() || EOF;
	 var node = BBM(AST.P);
	 
	 lexer.minCol = minCol;
	 lexer.mark = lexer.next(-2).nextUntil(isNL).pos;
	 lexer.pos = startPos;
	 
	 parseInline(lexer, node);
	 if (forceType)
	 {
	  node.type(forceType);
	 }
	 else if (isSetext(endTok))
	 {
	  node.type(AST.HEADER);
	  node.level = endTok.type === LEX.HR ? 2 : 1;
	 }
	 
	 lexer.minCol = 0;
	 lexer.mark = -1;
	 lexer.pos = (endPos <= startPos || isSetext(endTok)) ? endPos + 1 : endPos;
	 
	 return node;
	}



	// Inline-Level Grammar
	// --------------------

	function parseInline(lexer, node)
	{
	 var hasLink = lexer.stack.indexOf(LEX.BRACKET_R) > -1;
	 while (lexer.pos < lexer.mark)
	 {
	  var text = lexer.textUntil(isInline, hasLink);
	  var tok = lexer.next().peek(-1) || EOF;
	  node.append(text);
	  
	  if (tok.type === LEX.CODE || tok.type === LEX.PRE)
	  {
	   node.append(parseCode(lexer, tok));
	  }
	  else if (tok.type === LEX.LINK_IMG)
	  {
	   node.append(parseImg(lexer, tok));
	  }
	  else if (LEX_LINKS[tok.type])
	  {
	   node.append(hasLink ? tok.lexeme : parseLink(lexer, tok));
	  }
	  else if (lexer.stack.indexOf(tok.type) === -1 && LEX_FMT[tok.type])
	  {
	   lexer.stack.push(tok.type);
	   node.append(parseInline(lexer, BBM(LEX_INLINE[tok.type])));
	   lexer.stack.pop();
	  }
	  else
	  {
	   break;
	  }
	 }
	 return node;
	}

	function parseLink(lexer, lexTok)
	{
	 var callback = lexTok.type === LEX.LINK_INT ? isBracket : isAngle;
	 var href = __.rmCTRL(lexer.textPast(callback)).trim();
	 if (href)
	 {
	  var node = BBM(LEX_INLINE[lexTok.type]).attr({href : href});
	  var prevPos = lexer.pos;
	  if (lexer.nextUntil(isCont).peekT(LEX.LINK_CONT))
	  {
	   lexer.stack.push(LEX.BRACKET_R);
	   parseInline(lexer.next(), node);
	   lexer.stack.pop();
	  }
	  else
	  {
	   lexer.pos = prevPos;
	  }
	  return node;
	 }
	}

	function parseImg(lexer)
	{
	 var src = __.rmCTRL(lexer.textPast(isAngle)).trim();
	 if (src)
	 {
	  var alt = "";
	  var prevPos = lexer.pos;
	  if (lexer.nextUntil(isCont).peekT(LEX.LINK_CONT))
	  {
	   alt = lexer.next().textPast(isBracket).trim();
	  }
	  else
	  {
	   lexer.pos = prevPos;
	  }
	  return BBM(AST.LINK_IMG).attr({src : src, alt : alt});
	 }
	}

	function parseCode(lexer, lexTok)
	{
	 return BBM(AST.CODE).append(lexer.textPast(isCodeEnd, lexTok));
	}




	/**
	 * Parses a piece of text into its abstract syntax tree representation for
	 * further processing and manipulation.
	 * 
	 * @method parse
	 * @static
	 * @param {String} bbmStr The text to be parsed, written in BareBonesMarkup.
	 * @param {Number} [maxDepth=8] The maximum allowed nesting level. Text 
	   blocks exceeding this nesting limit shall be interpreted as paragraphs 
	   instead of a block capable of nesting, such as blockquotes and nested 
	   bullet lists.
	 * @return {BBM} The abstract syntax tree obtained from the parsing run.
	   The tree nodes, in addition to their the base instance properties, shall 
	   have the following properties for specific types of nodes:
	 
	   - **HEADER**: (Number) level; The heading level of the node. "1" 
	     denotes the most important heading, while "2" and higher are increasingly 
	     less important heading, similar to HTML's `<h1>` ... `<h6>` tags.
	     
	   - **ROOT**: (Object) symTable; A key-value pair mapping between 
	     identifiers and URL values used for URL substitution within LINK_INT, 
	     LINK_EXT, LINK_WIKI and LINK_IMG elements. These key value pairs are 
	     guaranteed to be non-blank (Contains at least one visible character)
	 */
	BBM.parse = function (bbmStr, maxDepth)
	{
	 var lexer = Lexer.isLexer(bbmStr) ? bbmStr : Lexer(bbmStr);
	 lexer.maxDepth = Math.abs(parseInt(maxDepth, 10) || 8);
	 lexer.root = BBM(AST.ROOT);
	 lexer.root.symTable = {};
	 lexer.stack = [];
	 lexer.lvl = 0;
	 while (lexer.peek())
	 {
	  lexer.root.append(parseBlock(lexer));
	 }
	 return lexer.root.prune();
	};

	/**
	 * Parses a piece of text into its abstract syntax tree representation, 
	 * replacing the current node's children list with the parsed syntax tree.
	 * 
	 * @method parse
	 * @param {String} bbmStr The text to be parsed, written in BareBonesMarkup.
	 * @param {Number} [maxDepth=8] The maximum allowed nesting level.
	 * @return {BBM} The current node with its subtree content replaced.
	 * @see BBM.parse
	 */
	BBM.fn.parse = function (bbmStr, maxDepth)
	{
	 return this.empty().append(BBM.parse(bbmStr, maxDepth).children());
	};



/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var BBM = module.exports = __webpack_require__(5)
	&& __webpack_require__(6)
	&& __webpack_require__(7)
	&& __webpack_require__(8)
	&& __webpack_require__(9)
	&& __webpack_require__(10)
	&& __webpack_require__(11);

	/**
	 * Eliminate duplicate CSS identifiers, perform hyperlink URL substitution,
	 * remove empty subtrees and collapse incomplete tree structures.
	 *
	 * @method prune
	 * @return {BBM} The current node after pruning operation.
	 */
	BBM.fn.prune = function ()
	{
	 return this.pruneList().pruneBlank().pruneURL().pruneID();
	};



/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var __ = module.exports = {};

	__.map = function (array, callback, extras)
	{
	 return array.map(function (element){
	  return callback(element, extras);
	 });
	};

	__.toString = function (obj)
	{
	 return Object.prototype.toString.call(obj);
	};

	__.toArray = function (obj, sPos, ePos)
	{
	 return Array.prototype.slice.call(obj, sPos, ePos);
	};

	__.flatten = function (arr, shallow)
	{
	 var res = __.isArray(arr) ? arr : __.toArray(arr);
	 while (res.some(__.isArray))
	 {
	  res = Array.prototype.concat.apply([], res);
	  if (shallow)
	  {
	   break;
	  }
	 }
	 return res;
	};

	__.isArray = function (obj)
	{
	 return Array.isArray
	 ? Array.isArray(obj)
	 : __.toString(obj) === "[object Array]";
	};

	__.isObject = function (obj)
	{
	 return __.isFunction(obj) || (typeof obj === "object" && obj !== null);
	};

	__.isString = function (obj)
	{
	 return typeof obj === "string" || __.toString(obj) === "[object String]";
	};

	__.isNumber = function (obj)
	{
	 return typeof obj === "number" || __.toString(obj) === "[object Number]";
	};

	__.isFunction = function (obj)
	{
	 return typeof obj === "function" || __.toString(obj) === "[object Function]";
	};

	__.isBlankString = function (str)
	{
	 return /^\s*$/.test(str);
	};

	__.repeatString = function (str, times)
	{
	 var many = Math.abs(parseInt(times, 10)) || 0;
	 var res = "";
	 while (many > 0)
	 {
	  if (many % 2 === 1)
	  {
	   res += str;
	  }
	  if (many > 1)
	  {
	   str += str;
	  }
	  many = Math.floor(many / 2);
	 }
	 return res;
	};

	__.rmWS = function (str)
	{
	 return str.replace(/ \t\u00a0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000/g, "");
	};

	__.rmNL = function (str)
	{
	 return str.replace(/[\v\f\r\n\u0085\u2028\u2029]+/g, "");
	};

	__.rmNLTail = function (str)
	{
	 return str.replace(/[\v\f\r\n\u0085\u2028\u2029]+$/, "");
	};

	__.rmCTRL = function (str)
	{
	 return str.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g, "");
	};

	__.escapeHTML = function (str)
	{
	 return str.replace(/&/g, "&amp;")
	 .replace(/</g, "&lt;")
	 .replace(/>/g, "&gt;");
	};

	__.escapeATTR = function (str)
	{
	 return __.escapeURI(__.rmCTRL(__.escapeHTML(str).replace(/"/g, "&quot;")
	 .replace(/'/g, "&#x27;")
	 .replace(/`/g, "&#x60;")));
	};

	__.escapeURI = function (str)
	{
	 return str.replace(/^javascript:/i, "javascript;")
	 .replace(/^data:/i, "data;");
	};

	__.has = function (obj, key)
	{
	 return Object.prototype.hasOwnProperty.call(obj, key);
	};

	__.get = function (obj, key)
	{
	 return __.has(obj, key) ? obj[key] : void(0);
	};

	__.extend = function (others)
	{
	 var toObj = __.isObject(others) ? others : {};

	 Array.prototype.forEach.call(arguments, function (fromObj){
	  if (fromObj === toObj || !__.isObject(fromObj)) {return;}
	  for (var key in fromObj)
	  {
	   if (__.has(fromObj, key))
	   {
	    toObj[key] = fromObj[key];
	   }
	  }
	 });

	 return toObj;
	};



/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	/**
	 * BareBonesMarkup Lexer class. Used to separate BBM string into lexical 
	 * tokens.
	 *
	 * @class BBM.Lexer
	 * @static
	 * @param {String} bbmStr The BareBonesMarkup string to analyze into tokens.
	 * @property {Array.LexToken} _tokens The array of analyzed lexical tokens.
	 * @property {Number} minCol The minimum required column count in certain
	   parsing contexts, such as bullet lists.
	 * @property {Number} pos The index of the token currently being pointed to.
	 * @property {Number} mark The index to stop the iteration methods from 
	   going past. The affected methods are:
	   
	   - peekUntil(callback, extras)
	   - nextUntil(callback, extras)
	   - nextPast(callback, extras)
	   - textUntil(callback, extras, minCol)
	   - textPast(callback, extras, minCol)
	   
	 * @return {Lexer} The newly created Lexer object.
	 */
	var Lexer = module.exports = (function (){

	// Private Lexical Analysis Work
	// -----------------------------

	var WS = "[ \\t\\u00a0\\u1680\\u180e\\u2000-\\u200a\\u202f\\u205f\\u3000]";
	var NL = "[\\v\\f\\n\u0085\u2028\u2029]|\\r\\n?";
	var EOL = "(?=" + NL + "|$)";
	var Rule = function (name, pattern)
	{
	 return {name : name, pattern : pattern};
	};

	var RULES = (function (){
	return [
	  Rule("ESCAPE"   , "\\\\[\\S]")
	, Rule("TH"       , "!!" + WS)
	, Rule("TD"       , "\\|\\|" + WS)
	, Rule("TRSEP"    , "\\|[=]+" + EOL)
	, Rule("ATX_END"  , "=+" + EOL)
	, Rule("ATX"      , "=+")
	, Rule("HR"       , "-{4,}" + EOL)
	, Rule("COMMENT"  , "/{4,}" + EOL)
	, Rule("CLASS"    , "\\.\\." + WS)
	, Rule("ID"       , "\\." + WS)
	, Rule("GT"       , ">")
	, Rule("REF"      , ":{")
	, Rule("REF_END"  , "}:")
	, Rule("DD"       , ":" + WS)
	, Rule("DT"       , ";" + WS)
	, Rule("OL"       , "[0-9]+\\." + WS)
	, Rule("OL"       , "#\\." + WS)
	, Rule("DIV"      , "\\*{4,}" + EOL)
	, Rule("UL"       , "[\\-\\+\\*\\u2022\\u2043]" + WS)
	, Rule("PRE"      , "\"{3,}" + EOL)
	, Rule("CODE"     , "\"{3,}")
	, Rule("DEL"      , "--")
	, Rule("BOLD"     , "\\*{2}")
	, Rule("SUP"      , "\\^{2}")
	, Rule("SUB"      , ",,")
	, Rule("UNDER"    , "__")
	, Rule("EM"       , "''")
	, Rule("LINK_EXT" , "\\?<")
	, Rule("LINK_IMG" , "!<")
	, Rule("LINK_WIKI", "#<")
	, Rule("LINK_INT" , "#\\[")
	, Rule("LINK_CONT", "-\\[")
	, Rule("BRACKET_R", "\\]")
	, Rule("NL"       , NL)
	, Rule("WS"       , WS + "+")
	];
	}());

	var REGEX = (function (){
	 var regexStr = RULES.map(function (rule){
	  return "(" + rule.pattern + ")";
	 });
	 
	 return new RegExp(regexStr.join("|"), "g");
	}());

	var ENUM = (function (){
	 var obj = {TEXT : "TEXT"};
	 RULES.forEach(function (rule){
	  obj[rule.name] = rule.name;
	 });
	 return obj;
	}());

	var LexToken = function (lexeme, type, col)
	{
	 return {lexeme : lexeme || "", type : type || "", col : col || 0};
	};

	var LexTokens = function (bbmStr)
	{
	 var regex = new RegExp(REGEX);
	 var toks = [];
	 var pos = 0;
	 
	 while (pos < bbmStr.length)
	 {
	  var res = regex.exec(bbmStr);
	  var ruleObj = RULES[res ? res.indexOf(res[0], 1) - 1 : -1];
	  var textEnd = res ? res.index : bbmStr.length;
	  
	  if (pos < textEnd)
	  {
	   toks.push(LexToken(bbmStr.slice(pos, textEnd), ENUM.TEXT));
	  }
	  if (ruleObj)
	  {
	   toks.push(LexToken(res[0], ruleObj.name));
	  }
	  pos = res ? (regex.lastIndex += pos > regex.lastIndex ? 1 : 0) : textEnd;
	 }
	 
	 toks.forEach(function (tok){
	  if (tok.type === ENUM.ESCAPE && tok.lexeme.length > 1)
	  {
	   tok.lexeme = tok.lexeme.slice(1);
	  }
	 });
	 
	 toks.forEach(function (tok, index, tokens){
	  var prev = tokens[index - 1];
	  tok.col = (index === 0 || prev.type === ENUM.NL)
	  ? 0
	  : prev.col + prev.lexeme.length;
	 });
	 
	 
	 return toks;
	};

	var Lexer = function (bbmStr)
	{
	 var obj = Object.create(Lexer.prototype);
	 obj._tokens = LexTokens(bbmStr);
	 obj.minCol = 0;
	 obj.mark = -1;
	 obj.pos = 0;
	 return obj;
	};

	Lexer.ENUM = ENUM;
	return Lexer;
	}());


	Lexer.isLexer = function (obj)
	{
	 return Lexer.prototype.isPrototypeOf(obj);
	};

	Lexer.fn = (function (fn){
	var ENUM = Lexer.ENUM;

	fn.peek = function (offset)
	{
	 return this._tokens[this.pos + (parseInt(offset, 10) || 0)];
	};

	fn.peekT = function (type, offset)
	{
	 return this.peek(offset) ? this.peek(offset).type === type : void(0);
	};

	fn.peekUntil = function (callback, extras)
	{
	 return this._tokens[this.nextUntil(callback, extras).pos];
	};

	fn.isLineStart = function (offset)
	{
	 var off = parseInt(offset, 10) || 0;
	 var prev1 = this.peek(off - 1);
	 var prev2 = this.peek(off - 2);
	  
	 return !prev1
	 || prev1.type === ENUM.NL
	 || prev1.type === ENUM.WS && (!prev2 || prev2.type === ENUM.NL);
	};

	fn.isLineEnd = function (offset)
	{
	 var off = parseInt(offset, 10) || 0;
	 var now = this.peek(off);
	 var next = this.peek(off + 1);
	  
	 return !now
	 || now.type === ENUM.NL 
	 || now.type === ENUM.WS && (!next || next.type === ENUM.NL);
	};

	fn.isDelim = function (currTok, sTok)
	{
	 var now = (currTok || this.peek());
	 return now
	 && sTok.type === now.type
	 && sTok.lexeme === now.lexeme
	 && sTok.col === now.col
	 && this.isLineStart();
	};

	fn.size = function ()
	{
	 return this._tokens.length;
	};

	fn.next = function (offset)
	{
	 this.pos = Math.max(0, this.pos + (parseInt(offset, 10) || 1));
	 return this;
	};

	fn.nextUntil = function (callback, extras)
	{
	 while (this.peek())
	 {
	  if (this.pos === this.mark || callback.call(this, this.peek(), extras))
	  {
	   break;
	  }
	  this.next();
	 }
	 return this;
	};

	fn.nextPast = function (callback, extras)
	{
	 this.nextUntil(callback, extras);
	 return this.pos === this.mark ? this : this.next();
	};

	fn.textUntil = function (callback, extras, minCol)
	{
	 var self = this;
	 var col = Number(minCol) || Number(self.minCol) || 0;
	 var text = "";
	 
	 this.nextUntil(function (tok){
	  if (callback.call(self, tok, extras))
	  {
	   return true;
	  }
	  
	  text += col > 0 && tok.type === ENUM.WS && self.isLineStart()
	  ? tok.lexeme.slice(col)
	  : tok.lexeme;
	 });
	 
	 return text;
	};

	fn.textPast = function (callback, extras, minCol)
	{
	 var text = this.textUntil(callback, extras, minCol);
	 if (this.pos !== this.mark)
	 {
	  this.next();
	 }
	 return text;
	};

	return fn;
	}(Lexer.prototype));



/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var __ = __webpack_require__(3);


	/**
	 * BareBonesMarkup node object. Each instance of this class represents a 
	 * node within the abstract syntax tree. The `new` operator is not required. 
	 * Instance properties prefixed with an underscore are meant for private use.
	 *
	 * @constructor
	 * @type BBM
	 * @param {String} type The node's type name. @see BBM.ENUM
	 * @property {String} _type The node's type name.
	 * @property {Object} _attr Attribute key-value (String-String) pairs.
	 * @property {BBM[]} _nodes An array of child nodes.
	 * @property {BBM} _parent The node's parent node.
	 * @return {BBM} The newly created node with a specific type. 
	 */
	var BBM = module.exports = function (type)
	{
	 var obj = Object.create(BBM.prototype);
	 obj._type = String(type).toLocaleUpperCase();
	 obj._attr = {};
	 obj._nodes = [];
	 obj._parent = null;
	 return obj;
	};


	/**
	 * Enumeration of officially recognized node types. Names preceding with an 
	 * underscore are private and for internal use only.
	 * 
	 * @memberOf BBM {Object} ENUM
	 * @enum {String}
	 * @readonly
	 * @static 
	 */
	var ENUM = BBM.ENUM = (function (){

	var obj = {};
	var enums =
	[
	  "_DT"
	, "_DD"
	, "_TH"
	, "_TD"
	, "_TR"
	, "_LI_UL"
	, "_LI_OL"
	, "_ID"
	, "_CLASS"
	, "_DUMMY"

	, "ROOT"
	, "COMMENT"
	, "P"
	, "BLOCKQUOTE"
	, "PRE"
	, "DIV"
	, "LI"
	, "UL"
	, "OL"
	, "HEADER"
	, "DT"
	, "DD"
	, "DL"
	, "TH"
	, "TD"
	, "HR"
	, "TR"
	, "TABLE"
	, "LINK_INT"
	, "LINK_EXT"
	, "LINK_IMG"
	, "LINK_WIKI"
	, "DEL"
	, "U"
	, "SUB"
	, "SUP"
	, "EM"
	, "BOLD"
	, "CODE"
	, "TEXT"
	];

	enums.forEach(function (name){
	 obj[name] = name;
	});

	return obj;
	}());




	/**
	 * Queries the target object if it is an instance of BBM.
	 * 
	 * @method isNode
	 * @static
	 * @param {anything} The object to check against.
	 * @return {Boolean} True if instance of BBM; False otherwise.
	 */
	BBM.isNode = function (target)
	{
	 return BBM.prototype.isPrototypeOf(target);
	};

	BBM.fn = (function (fn){

	// Private Methods
	// ---------------

	function mapArgs(node, parent)
	{
	 if ((__.isString(node) && node.length > 0) || __.isNumber(node))
	 {
	  return BBM(ENUM.TEXT).text(String(node));
	 }
	 if (BBM.isNode(node))
	 {
	  node.replaceWith();
	  node._parent = parent;
	 }
	 return node;
	}

	function procArgs(elems, parent)
	{
	 return __.isArray(elems)
	 ? __.map(__.flatten(elems), mapArgs, parent).filter(BBM.isNode)
	 : mapArgs(elems, parent);
	}

	function nullParent(node)
	{
	 if (BBM.isNode(node))
	 {
	  node._parent = null;
	 }
	 return node;
	}

	function empty(node)
	{
	 var kids = node.children();
	 var nodes = kids.length > 0 ? kids.splice(0, kids.length) : kids;
	 nodes.forEach(nullParent);
	 return nodes;
	}

	function eachPre(start, curr, callback, params)
	{
	 callback.call(start, curr, params);
	 curr.children().forEach(function (node){
	  eachPre(start, node, callback, params);
	 });
	 return start;
	}

	function eachPost(start, curr, callback, params)
	{
	 curr.children().forEach(function (node){
	  eachPost(start, node, callback, params);
	 });
	 callback.call(start, curr, params);
	 return start;
	}



	// Low Level Manipulation & Basic Accessors
	// ----------------------------------------

	/**
	 * Low Level method for manipulating the node's children.
	 * 
	 * @method splice
	 * @param {Number} from The index to begin manipulation. (Zero or more)
	 * @param {Number} count The Number of children to remove. (Zero or more)
	 * @param {(BBM[]|BBM|String)} [elems] The new child nodes to insert. 
	   Child nodes inserted in this manner will be detached from their belonging 
	   parent nodes.

	 * @return {BBM} The modified node instance.
	 */
	fn.splice = function (from, count, elems)
	{
	 var eles = procArgs(elems, this);
	 var kids = this.children();
	 var args = __.isArray(eles) ? [from, count].concat(eles) : eles;
	 var removed = __.isArray(args)
	 ? kids.splice.apply(kids, args)
	 : BBM.isNode(args)
	 ? kids.splice(from, count, args)
	 : kids.splice(from, count);
	 
	 removed.forEach(nullParent);
	 return this;
	};



	/**
	 * Retrieves the node's parent node.
	 * 
	 * @method parent
	 * @return {(BBM|undefined)} The parent node, or undefined if there's none.
	 */
	fn.parent = function ()
	{
	 return this._parent;
	};



	/**
	 * Retrieves the node's children list.
	 * 
	 * @method children
	 * @param {Boolean} [shallow] If true, retrieves a shallow copy instead.
	 * @return {BBM[]} The pointer to the children Array, or a copy of the 
	   Array if the shallow parameter is truthy.
	 */
	fn.children = function (shallow)
	{
	 return shallow ? this._nodes.slice() : this._nodes;
	};



	/**
	 * Retrieves the size of the node's children list.
	 * 
	 * @method size
	 * @return {Number} The Number of children this node contains.
	 */
	fn.size = function ()
	{
	 return this.children().length;
	};


	/**
	 * Retrieves the node's first child node.
	 * 
	 * @method first
	 * @return {(BBM|undefined)} The first child, or undefined if there's none.
	 */
	fn.first = function ()
	{
	 return this.children()[0];
	};


	/**
	 * Retrieves the node's last child node.
	 * 
	 * @method last
	 * @return {(BBM|undefined)} The last child, or undefined if there's none.
	 */
	fn.last = function ()
	{
	 return this.children()[this.children().length - 1];
	};


	/**
	 * Queries whether the node is the first sibling within its parent.
	 * 
	 * @method isFirstChild
	 * @return {Boolean} True if the node has a parent, and it's the first sibling 
	   within its subtree; False otherwise.
	 */
	fn.isFirstChild = function ()
	{
	 return this.parent() && this.parent().first() === this;
	};


	/**
	 * Queries whether the node is the last sibling within its parent.
	 * 
	 * @method isLastChild
	 * @return {Boolean} True if the node has a parent, and it's the last sibling 
	   within its subtree; False otherwise.
	 */
	fn.isLastChild = function ()
	{
	 return this.parent() && this.parent().last() === this;
	};



	/*
	Manipulation
	------------
	*/

	/**
	 * Removes the node's last child.
	 * 
	 * @method pop
	 * @return {(BBM|undefined)} The node's last child, or undefined if there's none.
	 */
	fn.pop = function ()
	{
	 return nullParent(this.children().pop());
	};


	/**
	 * Removes the node's first child.
	 * 
	 * @method shift
	 * @return {(BBM|undefined)} The node's first child, or undefined if there's none.
	 */
	fn.shift = function ()
	{
	 return nullParent(this.children().shift());
	};


	/**
	 * Adds one or more nodes to the end of this node's children list.
	 * 
	 * @method append
	 * @param {(String|BBM[]|BBM)} [content] An Array of BBM nodes, a single 
	   BBM node, or a non-empty String to append to the current node. If no 
	   valid content is supplied, this operation does nothing.
	 * @return {BBM} The modified BBM instance.
	 */
	fn.append = function (content)
	{
	 var eles = procArgs(content, this), kids = this.children();
	 if (BBM.isNode(eles))
	 {
	  kids.push(eles);
	 }
	 else if (__.isArray(eles))
	 {
	  kids.push.apply(kids, eles);
	 }
	 return this;
	};


	/**
	 * Adds one or more nodes to the beginning of this node's children list.
	 * 
	 * @method prepend
	 * @param {(String|BBM[]|BBM)} [content] @see BBM.append
	 * @return {BBM} The modified BBM instance.
	 */
	fn.prepend = function (content)
	{
	 var eles = procArgs(content, this), kids = this.children();
	 if (BBM.isNode(eles))
	 {
	  kids.unshift(eles);
	 }
	 else if (__.isArray(eles))
	 {
	  kids.unshift.apply(kids, eles);
	 }
	 return this;
	};


	/**
	 * Replaces the current node with some other content in its belonging subtree. 
	 * If the current node has no parent, this operation does nothing.
	 * 
	 * @method replaceWith
	 * @param {(String|BBM[]|BBM)} [content] @see BBM.append
	 * @return {BBM} The current node detached from its belonging subtree.
	 */
	fn.replaceWith = function (content)
	{
	 var pos = this.parent() ? this.parent().children().indexOf(this) : -1;
	 if (pos > -1)
	 {
	  this.parent().splice(pos, 1, content);
	 }
	 return this;
	};


	/**
	 * The inverse operation of BBM.replaceWith; The current node will take 
	 * the place of the target node, if the target is a BBM instance and it 
	 * has a parent node. Otherwise, this operation does nothing.
	 *
	 * @method replace
	 * @param {BBM} [target] The target node to replace with the current node.
	 * @return {BBM} The current node attached to the target's subtree.
	 */
	fn.replace = function (target)
	{
	 if (BBM.isNode(target))
	 {
	  target.replaceWith(this);
	 }
	 return this;
	};


	/**
	 * Detaches all child nodes from the current node.
	 *
	 * @method empty
	 * @return {BBM} The current node with an empty children list.
	 */
	fn.empty = function ()
	{
	 empty(this);
	 return this;
	};






	// Children Modification
	// ---------------------

	/**
	 * Rebuilds the current node's children list, reattaching each node that 
	 * returns truthy in the callback function.
	 *
	 * @method filterChild
	 * @param {function} callback Called on each child node being visited.
	 * @return {BBM} The current node after modification.
	 */
	fn.filterChild = function (callback)
	{
	 var that = this;
	 empty(that).forEach(function (node, index, sibs){
	  that.append(callback.call(that, node, index, sibs) ? node : null);
	 });
	 return that;
	};



	/**
	 * Rebuilds the current node's children list. As BBM.filterChild, except the 
	 * callback function is responsible for explicitly adding the child nodes 
	 * back.
	 *
	 * @method rebuildChild
	 * @param {function} callback Called on each child node being visited.
	 * @return {BBM} The current node after modification.
	 */
	fn.rebuildChild = function (callback)
	{
	 var that = this;
	 empty(that).forEach(function (node, index, sibs){
	  callback(that, node, index, sibs);
	 });
	 return that;
	};




	// Subtree Iteration
	// -----------------

	/**
	 * Iterates the node's subtree using depth-first, pre-order traversal, 
	 * executing the callback once per node.
	 *
	 * @method eachPre
	 * @param {function} callback Called on each child node being visited.
	 * @param {anything} [params] Extra parameter to be supplied to the callback.
	 * @return {BBM} The current node that started the traversal.
	 */
	fn.eachPre = function (callback, params)
	{
	 return eachPre(this, this, callback, params);
	};


	/**
	 * As BBM.eachPre, but returns an Array of nodes that the returns a truthy 
	 * value within the callback function.
	 *
	 * @method find
	 * @param {function} callback Called on each child node being visited.
	 * @param {anything} [params] Extra parameter to be supplied to the callback.
	 * @return {BBM} The current node that started the traversal.
	 * @see BBM.eachPre 
	 */
	fn.find = function (callback, params)
	{
	 var res = [];
	 this.eachPre(function (node){
	  if (callback.call(this, node, params))
	  {
	   res.push(this);
	  }
	 });
	 return res;
	};


	/**
	 * Iterates the node's subtree using depth-first, post-order traversal, 
	 * executing the callback once per node.
	 *
	 * @method eachPost
	 * @param {function} callback Called on each child node being visited.
	 * @param {anything} [params] Extra parameter to be supplied to the callback.
	 * @return {BBM} The current node that started the traversal.
	 */
	fn.eachPost = function (callback, params)
	{
	 return eachPost(this, this, callback, params);
	};


	/*
	Attributes, Properties, and Class Extension
	-------------------------------------------
	*/

	/**
	 * Retrieves or sets the text value of this node. If the text value retrieved
	 * is not the empty String `""`, this node is considered a text node.
	 *
	 * This method adds an extra property `_value` to the current BBM instance.
	 * 
	 * @method text
	 * @param {(String|Number)} [val] The text value to set the node's value to.
	 * @return {(this|String)} The current node if no parameter is supplied; 
	   Returns the node's text value otherwise.
	 */
	fn.text = function (val)
	{
	 if (arguments.length === 0)
	 {
	  return this._value || "";
	 }
	 if ((__.isString(val) && val.length > 0) || __.isNumber(val))
	 {
	  this._value = val;
	 }
	 return this;
	};


	/**
	 * Retrieves or sets the attributes of this node.
	 * @name BBM
	 * @method attr
	 * @param {(String|Object)} [key] An object to merge its properties into
	   the node's attributes, or a String denoting the attribute key to set.
	 * @param {(String|Number)} [val] The attribute value for the corresponding 
	   key. Omitted if the key parameter is an object.
	 * @return {(Object|String|BBM)} 
	   - If no parameter is supplied, returns the node's attribute object.
	   - If only the key is supplied and it's not an object, returns the 
	     corresponding attribute value.
	   - Returns the current node otherwise.
	 */
	fn.attr = function (key, val)
	{
	 if (__.isObject(key))
	 {
	  __.extend(this._attr, key);
	 }
	 else if (arguments.length === 0)
	 {
	  return this._attr;
	 }
	 else if (arguments.length === 1)
	 {
	  return __.get(this._attr, key);
	 }
	 else if (arguments.length > 1)
	 {
	  this._attr[key] = String(val);
	 }
	 return this;
	};


	/**
	 * Removes attributes from the node.
	 * 
	 * @method removeAttr
	 * @param {(String|Number)} [key] The attribute key to remove. If omitted,
	   removes all attribute key value pairs instead.
	 * @return {BBM} The modified BBM instance with attributes removed.
	 */
	fn.removeAttr = function (key)
	{
	 if (arguments.length === 1)
	 {
	  delete this._attr[key];
	 }
	 if (arguments.length === 0)
	 {
	  this._attr = {};
	 }
	 return this;
	};


	/**
	 * Retrieves or sets the node's type.
	 * 
	 * @method type
	 * @param {(String|Number)} [newType] The type String to set the node into.
	 * @return {(String|BBM)} If no parameters, the node's type name; Otherwise, 
	   the modified BBM instance with a new type.
	 */
	fn.type = function (newType)
	{
	 if (arguments.length === 0)
	 {
	  return this._type;
	 }
	 this._type = String(newType).toLocaleUpperCase();
	 return this;
	};


	/**
	 * Merge the contents of an object onto the BBM prototype to add BBM methods.
	 *
	 * @method extend
	 * @param {Object} extendObj The object to merge into the prototype.
	 * @return {BBM} The calling instance.
	 */
	fn.extend = function (extendObj)
	{
	 return __.extend(this, extendObj);
	};


	/**
	 * Converts the current node into JSON-compatible format for use with 
	 * `JSON.stringify()`. Do not use this method to obtain a JSON string of the 
	 * subtree; Use `JSON.stringify(node, null, " ")` instead.
	 *
	 * @method toJSON
	 * @return {Object} A clone of the current node without the BBM prototype.
	 */
	fn.toJSON = function ()
	{
	 var obj = __.extend({}, this);
	 delete obj._parent;
	 return obj;
	};


	return fn;
	}(BBM.prototype));


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var BBM = module.exports = __webpack_require__(5);
	var __ = __webpack_require__(3);
	var AST = BBM.ENUM;
	var DUMMY = BBM("_DUMMY");
	var IDCLASS = {_ID : true, _CLASS : true};
	var SWITCH =
	{
	  _DT : pruneDL
	, _DD : pruneDL
	, _TH : pruneTable
	, _TD : pruneTable
	, _TR : pruneTable
	, _LI_UL : pruneUL
	, _LI_OL : pruneOL
	};



	function isPrunable(node)
	{
	 return __.has(SWITCH, node.type()) || __.has(IDCLASS, node.type());
	}

	function pruneIDClass(prev, node)
	{
	 var nClass = (node.attr("class") || " ");
	 if (prev.attr("id"))
	 {
	  node.attr("id", prev.attr("id"));
	 }
	 if (prev.attr("class"))
	 {
	  node.attr("class", (prev.attr("class") + " " + nClass).trim());
	 }
	 return node;
	}

	function pruneTable(prev, node)
	{
	 var isRow = node.type() === AST._TR;
	 var cellType = node.type() === AST._TD ? AST.TD : AST.TH;
	 var pNode = prev.type() === AST.TABLE
	 ? prev
	 : BBM(AST.TABLE).append(BBM(AST.TR));

	 if (!isRow)
	 {
	  pNode.last().append(node.type(cellType));
	 }
	 else if (pNode.last().size() > 0)
	 {
	  pNode.append(node.type(AST.TR));
	 }
	 return pNode;
	}

	function pruneUL(prev, node)
	{
	 var pNode = prev.type() === AST.UL ? prev : BBM(AST.UL);
	 return pNode.append(node.type(AST.LI));
	}

	function pruneOL(prev, node)
	{
	 var pNode = prev.type() === AST.OL ? prev : BBM(AST.OL);
	 return pNode.append(node.type(AST.LI));
	}

	function pruneDL(prev, node)
	{
	 var pNode = prev.type() === AST.DL ? prev : BBM(AST.DL);
	 var type = node.type();
	 return pNode.append(node.type(type === AST._DD ? AST.DD : AST.DT));
	}

	function pruneSwitch(parent, node)
	{
	 var prev = parent.last() || DUMMY;
	 var nType = node.type();
	 var pType = prev.type();
	 var res = node;
	 
	 if (__.has(SWITCH, nType))
	 {
	  res = SWITCH[nType](prev, res);
	 }
	 if (__.has(IDCLASS, pType))
	 {
	  res = pruneIDClass(prev, res);
	 }
	 if (res !== prev)
	 {
	  parent.append(res);
	 }
	}

	function pruneList(node)
	{
	 if (node.children().some(isPrunable))
	 {
	  node.rebuildChild(pruneSwitch);
	 }
	}

	/**
	 * Fleshes out intermediate node type into officially recognized types, 
	 * such as collapsing bullet list blocks into a formal bullet list.
	 *
	 * @method pruneList
	 * @return {BBM} The current node, with subtrees containing nodes with 
	   leading underscore type name pruned.
	 */
	BBM.fn.pruneList = function ()
	{
	 return this.eachPost(pruneList);
	};





/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var BBM = module.exports = __webpack_require__(5);
	var __ = __webpack_require__(3);
	var AST = BBM.ENUM;
	var DUMMY = BBM("_DUMMY");
	var LINKS =
	{
	  LINK_EXT : 1
	, LINK_INT : 1
	, LINK_WIKI : 1
	};

	var ALONE =
	{
	  PRE : 1
	, TD : 1
	, TH : 1
	, LI : 1
	, BLOCKQUOTE : 1
	, DD : 1
	, DT : 1
	, HR : 1
	, DIV : 1
	, LINK_EXT : 1
	, LINK_INT : 1
	, LINK_WIKI : 1
	, LINK_IMG : 1
	, COMMENT : 1
	};


	function isBlank(node)
	{
	 return __.isBlankString(node.text())
	 && node.size() === 0
	 && !ALONE[node.type()];
	}

	function isKept(node)
	{
	 return node.text() || !isBlank(node);
	}

	function pruneTR(node)
	{
	 var maxCol = Math.min((node.first() || DUMMY).size(), 64);
	 node.children().forEach(function (rNode){
	  if (rNode.size() > 0)
	  {
	   while (rNode.size() > maxCol)
	   {
	    rNode.pop();
	   }
	   while (rNode.size() < maxCol)
	   {
	    rNode.append(BBM(AST.TD));
	   }
	  }
	 });
	}

	function pruneDL(node)
	{
	 var ht = null;
	 while ((ht = node.first()) && ht.type() === AST.DD)
	 {
	  node.shift();
	 }
	 
	 while ((ht = node.last()) && ht.type() === AST.DT)
	 {
	  node.pop();
	 }
	}

	function pruneBlank(node)
	{
	 var type = node.type();
	 if (node.children().every(isBlank))
	 {
	  node.empty().append(LINKS[type] ? node.attr("href") : null);
	  return;
	 }
	 
	 
	 if (type === AST.TABLE)
	 {
	  pruneTR(node);
	 }
	 else if (type === AST.DL)
	 {
	  pruneDL(node);
	 }
	 node.filterChild(isKept);
	}


	/**
	 * Removes blank subtrees and nodes from the current node. A subtree is 
	 * considered empty if it's not the following element, and it contains no 
	 * visible text content: (That is, only blank strings such as " ")
	 *
	 * - TD
	 * - TH
	 * - PRE
	 * - LI
	 * - BLOCKQUOTE
	 * - DD
	 * - DT
	 * - HR
	 * - DIV
	 * - LINK_* (Hyperlink and image nodes)
	 * - COMMENT 
	 *
	 * In short, nested inline formatting containing nothing but blank strings 
	 * shall be removed from the tree, such as `** -- __ __ -- **`.
	 *
	 * @method pruneBlank
	 * @return {BBM} The current node with empty subtrees pruned.
	 */
	BBM.fn.pruneBlank = function ()
	{
	 return this.eachPost(pruneBlank);
	};



/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var BBM = module.exports = __webpack_require__(5);
	var __ = __webpack_require__(3);
	var AST = BBM.ENUM;
	var LINKS = [AST.LINK_EXT, AST.LINK_INT, AST.LINK_WIKI];

	function pruneURL(node, symTable)
	{
	 var nType = node.type();
	 var attr = node.attr();
	 if (nType === AST.LINK_IMG)
	 {
	  attr.src = __.get(symTable, attr.src) || attr.src;
	 }
	 else if (LINKS.indexOf(nType) > -1)
	 {
	  attr.href = __.get(symTable, attr.href) || attr.href;
	 }
	}

	/**
	 * Performs URL substitution within the subtree, changing ID-URL pairs in 
	 * the symbol table to corresponding identifiers inside hyperlink and image
	 * elements.
	 *
	 * @method pruneURL
	 * @return {BBM} The current node after URL substitution.
	 */
	BBM.fn.pruneURL = function ()
	{
	 return __.isObject(this.symTable)
	 ? this.eachPre(pruneURL, this.symTable)
	 : this;
	};



/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var BBM = module.exports = __webpack_require__(5);
	var __ = __webpack_require__(3);

	function pruneID(node, idList)
	{
	 var id = __.rmWS(__.rmCTRL(node.attr("id") || ""));
	 if (id && !__.has(idList, id))
	 {
	  node.attr("id", (idList[id] = id));
	 }
	 else
	 {
	  node.removeAttr("id");
	 }
	}

	/**
	 * Eliminate duplicate CSS identifiers
	 *
	 * @method pruneID
	 * @return {BBM} The current node with no duplicate IDs in its subtree.
	 */
	BBM.fn.pruneID = function ()
	{
	 return this.eachPre(pruneID, {});
	};



/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var BBM = module.exports = __webpack_require__(5);
	var DUMMY = BBM("_DUMMY");

	function isPrunable(node, index, sibs)
	{
	 return (sibs[index - 1] || DUMMY).text() && node.text();
	}

	function pruneTextWork(parent, node)
	{
	 var prev = parent.last() || DUMMY;
	 if (prev.text() && node.text())
	 {
	  prev.text(prev.text() + node.text());
	 }
	 else
	 {
	  parent.append(node);
	 }
	}

	function pruneText(node)
	{
	 if (node.children().some(isPrunable))
	 {
	  node.rebuildChild(pruneTextWork);
	 }
	}


	/**
	 * Collapses consecutive text nodes into a single text node in the subtree.
	 *
	 * @method pruneText
	 * @return {BBM} The current node with consecutive text nodes in its subtree 
	 * combined.
	 */
	BBM.fn.pruneText = function ()
	{
	 return this.eachPre(pruneText);
	};



/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var BBM = module.exports = __webpack_require__(5);
	var __ = __webpack_require__(3);
	var AST = BBM.ENUM;
	var INLINES =
	{
	  U : 1
	, EM : 1
	, DEL : 1
	, INS : 1
	, SUB : 1
	, SUP : 1
	, BOLD : 1
	, CODE : 1
	, LINK_IMG : 1
	, LINK_INT : 1
	, LINK_WIKI : 1
	, LINK_EXT : 1
	};

	var MAP_HTML =
	{
	  P : "p"
	, BLOCKQUOTE : "blockquote"
	, PRE : "pre"
	, DIV : "div"
	, LI : "li"
	, UL : "ul"
	, OL : "ol"
	, HEADER : "h"
	, DT : "dt"
	, DD : "dd"
	, DL : "dl"
	, TH : "th"
	, TD : "td"
	, HR : "hr"
	, TR : "tr"
	, TABLE : "table"
	, LINK_INT : "a"
	, LINK_EXT : "a"
	, LINK_IMG : "img"
	, LINK_WIKI : "a"
	, DEL : "del"
	, U : "u"
	, SUB : "sub"
	, SUP : "sup"
	, EM : "em"
	, BOLD : "strong"
	, CODE : "code"
	};



	function hasEndTag(node)
	{
	 return node.type() !== AST.LINK_IMG && node.type() !== AST.HR;
	}

	function printXHTML(node, opts)
	{
	 return (opts.XHTML && !hasEndTag(node)) ? " /" : ""; 
	}

	function printIndent(node, opts)
	{
	 return INLINES[node.type()] ? "" : __.repeatString(" ", opts.depth);
	}

	function printBlockEnd(node)
	{
	 return INLINES[node.type()] ? "" : "\n";
	}

	function printHeader(node, opts)
	{
	 var lvl = Math.abs(parseInt(node.level, 10) || 1);
	 return "h" + Math.min(lvl + opts.headerOffset, 6);
	}

	function printAttr(node, opts)
	{
	 var res = "";
	 var attr = node.attr();
	 var nType = node.type();
	 
	 for (var key in attr)
	 {
	  if (__.has(attr, key) && !__.isBlankString(key))
	  {
	   res += __.escapeATTR(key).substring(0, opts.maxAttrChars)
	   + "=\""
	   + ((nType === AST.LINK_INT && key === "href") ? "#" : "")
	   + __.escapeATTR(attr[key]).substring(0, opts.maxAttrChars)
	   + "\" ";
	  }
	 }
	 return res.length === 0 ? "" : " " + res.trim();
	}

	function printTagName(node, opts)
	{
	 var tagName = node.type() === AST.HEADER
	 ? printHeader(node, opts)
	 : MAP_HTML[node.type()];

	 return __.escapeATTR(tagName || "");
	}

	function printTagOpen(node, opts)
	{
	 var tagName = printTagName(node, opts);
	 if (tagName)
	 {
	  return printIndent(node, opts)
	  + "<"
	  + tagName
	  + printAttr(node, opts)
	  + printXHTML(node, opts)
	  + ">"
	  + printBlockEnd(node, opts);
	 }
	 return "";
	}

	function printTagClose(node, opts)
	{
	 var tagName = printTagName(node, opts);
	 if (tagName && hasEndTag(node, opts))
	 {
	  return printBlockEnd(node, opts)
	  + printIndent(node, opts)
	  + "</" 
	  + tagName
	  + ">" 
	  + (node.isLastChild() ? "" : printBlockEnd(node, opts));
	 }
	 return "";
	}

	function printComment(node, opts)
	{
	 var indent = printIndent(node, opts);
	 return indent
	 + "<!--\n"
	 + __.map(node.children(), printHTML, opts).join("")
	 + indent
	 + "-->"
	 + (node.isLastChild() ? "" : printBlockEnd(node, opts));
	}

	function printText(node, opts)
	{
	 return __.escapeHTML(opts.rmNL ? __.rmNL(node.text()) : node.text()); 
	}

	function printHTML(node, opts)
	{
	 var str = "";
	 
	 opts.depth += 1;
	 str = node.text().length > 0
	 ? printText(node, opts)
	 : node.type() === AST.COMMENT
	 ? (opts.comment ? printComment(node, opts) : "")
	 : printTagOpen(node, opts)
	   + __.map(node.children(), printHTML, opts).join("")
	   + printTagClose(node, opts);
	 opts.depth -= 1;
	 
	 return str;
	}


	//TODO; Document this method.
	BBM.fn.toHTML = function (options)
	{
	 var opts = __.isObject(options) ? options : {};
	 opts.depth = (parseInt(opts.depth, 10) || 0) + (printTagName(this) ? -1 : -2);
	 opts.maxAttrChars = Math.abs(parseInt(opts.maxAttrChars, 10) || 2048);
	 opts.headerOffset = Math.abs(parseInt(opts.headerOffset, 10) || 0);
	 opts.XHTML = !!opts.XHTML;
	 opts.comment = !!opts.comment;
	 opts.rmNL = !!opts.rmNL;
	 return printHTML(this, opts);
	};



/***/ }
/******/ ])
});
