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

	var BBM = __webpack_require__(2) && __webpack_require__(3);
	var __ = BBM.__;
	var Lexer = BBM.Lexer;
	var LEX = Lexer.ENUM;
	var AST = BBM.ENUM;
	var EOF = {};
	var LEX_DELIM = [LEX.HR, LEX.ATX_END, LEX.DIV];
	var LEX_SETEXT = [LEX.HR, LEX.ATX_END];
	var LEX_FMT = [LEX.DEL, LEX.BOLD, LEX.EM, LEX.SUP, LEX.SUB, LEX.UNDER];
	var LEX_LINKS = [LEX.LINK_INT, LEX.LINK_WIKI, LEX.LINK_EXT];
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




	/*
	Block-level iterators
	---------------------
	*/

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

	function isParaEnd(tok, minCol)
	{
	 return this.isLineStart() &&
	 (
	  this.isLineEnd()
	  || LEX_DELIM.indexOf(tok.type) > -1
	  || (notWSNL(tok) && tok.col < minCol)
	 );
	}



	/*
	Inline-level Iterators
	----------------------
	*/

	function isCode(tok, tokStart)
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



	/*
	Block-level Grammar
	-------------------
	*/

	function parseBlock(lexer)
	{
	 var tok = (lexer.peekUntil(notWSNL) || EOF);
	 var isNotAbuse = lexer.lvl < lexer.maxDepth;
	 var node = null;
	 var func = LEX_LIST[tok.type]
	 ? parseListPre
	 : LEX_BLOCK[tok.type]
	 ? LEX_BLOCK[tok.type]
	 : null;

	 
	 lexer.lvl += 1;
	 if (func && isNotAbuse)
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
	 var text = lexer.nextPast(isNL).textPast(lexer.isDelim, lexTok, lexTok.col);
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
	 var node = BBM(AST.HEADER);
	 
	 node.level = lexTok.lexeme.length;
	 
	 lexer.mark = endPos;
	 lexer.pos = startPos;
	 parseInline(lexer, [], node);
	 lexer.mark = -1;
	 lexer.pos = endPos <= startPos ? endPos : endPos + 1;
	 
	 return node;
	}

	function parseLabel(lexer, lexTok)
	{
	 var idClass = __.rmCTRL(lexer.next().textPast(isNL)).trim();
	 var isID = lexTok.type === LEX.ID;
	 if (idClass.length > 0)
	 { 
	  return BBM(isID ? AST._ID : AST._CLASS).attr(isID ? "id" : "class", idClass);
	 }
	}

	function parseRef(lexer)
	{
	 var id = lexer.next().textPast(isRefEnd).trim();
	 var url = lexer.peekT(LEX.NL, -1) ? "" : lexer.textUntil(isNL).trim();
	 if (url.length > 0 && id.length > 0)
	 {
	  lexer.root.symTable[id] = url;
	 }
	}

	function parsePara(lexer, lexTok, forceType)
	{
	 var minCol = lexTok.col || 0;
	 var startPos = lexer.pos;
	 var endPos = lexer.nextUntil(isParaEnd, minCol).pos;
	 var endTok = lexer.peek() || EOF;
	 var node = BBM(AST.P);
	 
	 lexer.minCol = minCol;
	 lexer.mark = lexer.next(-2).nextUntil(isNL).pos;
	 lexer.pos = startPos;
	 
	 parseInline(lexer, [], node);
	 if (forceType)
	 {
	  node.type(forceType);
	 }
	 else if (LEX_SETEXT.indexOf(endTok.type) > -1)
	 {
	  node.type(AST.HEADER);
	  node.level = endTok.type === LEX.HR ? 2 : 1;
	 }
	 
	 lexer.minCol = 0;
	 lexer.mark = -1;
	 lexer.pos = endPos <= startPos ? endPos + 1 : endPos;

	 return node;
	}



	/*
	Inline-Level Grammar
	--------------------
	*/

	function parseInline(lexer, stack, node)
	{
	 var hasLink = stack.indexOf(LEX.BRACKET_R) > -1;
	 while (lexer.pos < lexer.mark)
	 {
	  var text = lexer.textUntil(isInline, hasLink);
	  var tok = lexer.peek() || EOF;
	  lexer.next();
	  node.append(text);
	  
	  if (tok.type === LEX.CODE || tok.type === LEX.PRE)
	  {
	   node.append(parseCode(lexer, tok));
	  }
	  else if (tok.type === LEX.LINK_IMG)
	  {
	   node.append(parseImg(lexer, tok));
	  }
	  else if (!hasLink && LEX_LINKS.indexOf(tok.type) > -1)
	  {
	   node.append(parseLink(lexer, tok, stack));
	  }
	  else if (stack.indexOf(tok.type) === -1 && LEX_FMT.indexOf(tok.type) > -1)
	  {
	   stack.push(tok.type);
	   node.append(parseInline(lexer, stack, BBM(LEX_INLINE[tok.type])));
	   stack.pop();
	  }
	  else
	  {
	   break;
	  }
	 }
	 return node;
	}

	function parseLink(lexer, lexTok, stack)
	{
	 var callback = lexTok.type === LEX.LINK_INT ? isBracket : isAngle;
	 var href = __.rmCTRL(lexer.textPast(callback)).trim();
	 if (href.length === 0)
	 {
	  return;
	 }
	 
	 var node = BBM(LEX_INLINE[lexTok.type]).attr({href : href});
	 if (lexer.nextUntil(isCont).peekT(LEX.LINK_CONT))
	 {
	  stack.push(LEX.BRACKET_R);
	  parseInline(lexer.next(), stack, node);
	  stack.pop();
	 }
	 return node;
	}

	function parseImg(lexer)
	{
	 var src = __.rmCTRL(lexer.textPast(isAngle)).trim();
	 if (src.length === 0)
	 {
	  return;
	 }
	 
	 var alt = "";
	 if (lexer.nextUntil(isCont).peekT(LEX.LINK_CONT))
	 {
	  alt = lexer.next().textPast(isBracket).trim();
	 }
	 return BBM(AST.LINK_IMG).attr({src : src, alt : alt});
	}

	function parseCode(lexer, lexTok)
	{
	 return BBM(AST.CODE).append(lexer.textPast(isCode, lexTok));
	}




	/*
	Exporting
	---------
	*/

	BBM.parse = function (bbmStr, maxDepth)
	{
	 var lexer = Lexer.isLexer(bbmStr) ? bbmStr : Lexer(bbmStr, maxDepth);
	 lexer.root = BBM(AST.ROOT);
	 lexer.root.symTable = {};
	 while (lexer.peek())
	 {
	  lexer.root.append(parseBlock(lexer));
	 }
	 return lexer.root.prune();
	};

	BBM.fn.parse = function (bbmStr, maxDepth)
	{
	 return this.empty().append(BBM.parse(bbmStr, maxDepth).children());
	};

	module.exports = BBM;



/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var BBM = __webpack_require__(4);


	/*
	Private methods: Lexing
	-----------------------
	*/

	var WS = "[ \\t\\u00a0\\u1680\\u180e\\u2000-\\u200a\\u202f\\u205f\\u3000]";
	var NL = "[\\v\\f\\n\u0085\u2028\u2029]|\\r\\n?";
	var EOL = "(?=" + NL + "|$)";
	var EMPTY = __LexToken();
	var RULES =
	[
	  __Rule("ESCAPE"   , "\\\\[\\S]")
	, __Rule("TH"       , "!!" + WS)
	, __Rule("TD"       , "\\|\\|" + WS)
	, __Rule("TRSEP"    , "\\|[=]+" + EOL)
	, __Rule("ATX_END"  , "=+" + EOL)
	, __Rule("ATX"      , "=+")
	, __Rule("HR"       , "-{4,}" + EOL)
	, __Rule("COMMENT"  , "/{4,}" + EOL)
	, __Rule("CLASS"    , "\\.\\." + WS)
	, __Rule("ID"       , "\\." + WS)
	, __Rule("GT"       , ">")
	, __Rule("REF"      , ":{")
	, __Rule("REF_END"  , "}:")
	, __Rule("DD"       , ":" + WS)
	, __Rule("DT"       , ";" + WS)
	, __Rule("OL"       , "[0-9]+\\." + WS)
	, __Rule("OL"       , "#\\." + WS)
	, __Rule("DIV"      , "\\*{4,}" + EOL)
	, __Rule("UL"       , "[\\-\\+\\*\\u2022\\u2043]" + WS)
	, __Rule("PRE"      , "\"{3,}" + EOL)
	, __Rule("CODE"     , "\"{3,}")
	, __Rule("DEL"      , "--")
	, __Rule("BOLD"     , "\\*{2}")
	, __Rule("SUP"      , "\\^{2}")
	, __Rule("SUB"      , ",,")
	, __Rule("UNDER"    , "__")
	, __Rule("EM"       , "''")
	, __Rule("LINK_EXT" , "\\?<")
	, __Rule("LINK_IMG" , "!<")
	, __Rule("LINK_WIKI", "#<")
	, __Rule("LINK_INT" , "#\\[")
	, __Rule("LINK_CONT", "-\\[")
	, __Rule("BRACKET_R", "\\]")
	, __Rule("NL"       , NL)
	, __Rule("WS"       , WS + "+")
	];

	var ENUM = RULES.reduce(__reduceRulesTypes, {TEXT : "TEXT"});
	var REGEX = new RegExp(RULES.map(__mapRules).join("|"), "g");


	function __Rule(name, pattern)
	{
	 return {name : name, pattern : pattern};
	}

	function __mapRules(rule)
	{
	 return "(" + rule.pattern + ")";
	}

	function __reduceRulesTypes(acc, rule)
	{
	 acc[rule.name] = rule.name;
	 return acc;
	}

	function __LexToken(lexeme, type, col)
	{
	 return {
	   lexeme : lexeme || ""
	 , type : type || ""
	 , col : col || -1
	 };
	}

	function __Lexer(bbmStr)
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
	   toks.push(__LexToken(bbmStr.slice(pos, textEnd), ENUM.TEXT));
	  }
	  if (ruleObj)
	  {
	   toks.push(__LexToken(res[0], ruleObj.name));
	  }
	  pos = res ? (regex.lastIndex += pos > regex.lastIndex ? 1 : 0) : textEnd;
	 }
	 return toks;
	}

	/*
	Private methods: Iteration
	--------------------------
	*/

	function __updateEscapes(tok)
	{
	 if (tok.type === ENUM.ESCAPE && tok.lexeme.length > 1)
	 {
	  tok.lexeme = tok.lexeme.slice(1);
	 }
	}

	function __updateCols(tok, index, toks)
	{
	 var prev = toks[index - 1] || EMPTY;
	 tok.col = (index === 0 || prev.type === ENUM.NL)
	 ? 0
	 : prev.col + prev.lexeme.length;
	}





	/*
	Public Methods: peek
	--------------------
	*/

	function peek(offset)
	{
	 return this._tokens[this.pos + (parseInt(offset, 10) || 0)];
	}

	function peekT(type, offset)
	{
	 return (this.peek(offset) || EMPTY).type === type;
	}

	function peekUntil(callback, extras)
	{
	 return this._tokens[this.nextUntil(callback, extras).pos];
	}

	/*
	Public Methods: peek extras
	---------------------------
	*/

	function isLineStart(offset)
	{
	 var off = parseInt(offset, 10) || 0;
	 var prev1 = this.peek(off - 1);
	 var prev2 = this.peek(off - 2);
	  
	 return !prev1
	 || prev1.type === ENUM.NL
	 || prev1.type === ENUM.WS && (!prev2 || prev2.type === ENUM.NL);
	}

	function isLineEnd(offset)
	{
	 var off = parseInt(offset, 10) || 0;
	 var now = this.peek(off);
	 var next = this.peek(off + 1);
	  
	 return !now
	 || now.type === ENUM.NL 
	 || now.type === ENUM.WS && (!next || next.type === ENUM.NL);
	}

	function isDelim(currTok, sTok)
	{
	 var now = (currTok || this.peek() || EMPTY);
	 return now !== EMPTY
	 && sTok.type === now.type
	 && sTok.lexeme === now.lexeme
	 && sTok.col === now.col
	 && this.isLineStart();
	}




	/*
	Public Methods: next, text
	--------------------------
	*/

	function size()
	{
	 return this._tokens.length;
	}

	function next(offset)
	{
	 this.pos = Math.max(0, this.pos + (parseInt(offset, 10) || 1));
	 return this;
	}

	function nextUntil(callback, extras)
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
	}

	function nextPast(callback, extras)
	{
	 this.nextUntil(callback, extras);
	 return this.pos === this.mark ? this : this.next();
	}

	function textUntil(callback, extras, minCol)
	{
	 var col = Number(minCol) || Number(this.minCol) || 0;
	 var text = "";
	 
	 this.nextUntil(function (tok){
	  if (callback.call(this, tok, extras))
	  {
	   return true;
	  }
	  
	  text += col > 0 && tok.type === ENUM.WS && this.isLineStart()
	  ? tok.lexeme.slice(col)
	  : tok.lexeme;
	 });
	 
	 return text;
	}

	function textPast(callback, extras, minCol)
	{
	 var text = this.textUntil(callback, extras, minCol);
	 if (this.pos !== this.mark)
	 {
	  this.next();
	 }
	 return text;
	}



	/*
	Public Method: Constructor
	--------------------------
	*/

	function Lexer(bbmStr, maxDepth)
	{
	 var obj = Object.create(Lexer.prototype);
	 obj._tokens = __Lexer(bbmStr);
	 obj.minCol = 0;
	 obj.mark = -1;
	 obj.pos = 0;
	 obj.lvl = 0;
	 obj.maxDepth = Math.abs(parseInt(maxDepth, 10) || 8);

	 obj._tokens.forEach(__updateEscapes);
	 obj._tokens.forEach(__updateCols);
	 return obj;
	}

	function isLexer(obj)
	{
	 return Lexer.prototype.isPrototypeOf(obj);
	}


	BBM.Lexer = Lexer;
	Lexer.ENUM = ENUM;
	Lexer.isLexer = isLexer;
	Lexer.prototype =
	{
	  peek : peek
	, peekUntil : peekUntil
	, peekT : peekT
	, isLineStart : isLineStart
	, isLineEnd : isLineEnd
	, isDelim : isDelim

	, size : size
	, next : next
	, nextUntil : nextUntil
	, nextPast : nextPast
	, textUntil : textUntil
	, textPast : textPast
	};

	module.exports = BBM;



/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var BBM = __webpack_require__(4)
	&& __webpack_require__(5)
	&& __webpack_require__(6)
	&& __webpack_require__(7)
	&& __webpack_require__(8)
	&& __webpack_require__(9)
	&& __webpack_require__(10);

	BBM.fn.prune = function (bbmStr, options)
	{
	 return this.pruneList().pruneBlank().pruneURL().pruneID();
	};

	module.exports = BBM;




/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var __ = __webpack_require__(11);
	var ENUM =
	{
	  _DT : "_DT"
	, _DD : "_DD"
	, _TH : "_TH"
	, _TD : "_TD"
	, _TR : "_TR"
	, _LI_UL : "_LI_UL"
	, _LI_OL : "_LI_OL"
	, _ID : "_ID"
	, _CLASS : "_CLASS"
	, _DUMMY : "_DUMMY"

	, ROOT : "ROOT"
	, COMMENT : "COMMENT"
	, P : "P"
	, BLOCKQUOTE : "BLOCKQUOTE"
	, PRE : "PRE"
	, DIV : "DIV"
	, LI : "LI"
	, UL : "UL"
	, OL : "OL"
	, HEADER : "HEADER"
	, DT : "DT"
	, DD : "DD"
	, DL : "DL"
	, TH : "TH"
	, TD : "TD"
	, HR : "HR"
	, TR : "TR"
	, TABLE : "TABLE"
	, LINK_INT : "LINK_INT"
	, LINK_EXT : "LINK_EXT"
	, LINK_IMG : "LINK_IMG"
	, LINK_WIKI : "LINK_WIKI"
	, DEL : "DEL"
	, U : "U"
	, SUB : "SUB"
	, SUP : "SUP"
	, EM : "EM"
	, BOLD : "BOLD"
	, CODE : "CODE"
	, TEXT : "TEXT"
	};



	/*
	Private Methods
	---------------
	*/

	function __mapArgs(node)
	{
	 var res = node;
	 if ((__.isString(res) && res.length > 0) || __.isNumber(res))
	 {
	  res = BBM(ENUM.TEXT).text(res + "");
	 }
	 if (isNode(res))
	 {
	  res.replaceWith();
	  res._parent = this;
	 }
	 return res;
	}

	function __procArgs(elems, node)
	{
	 return __.isArray(elems)
	 ? __.flatten(elems).map(__mapArgs, node).filter(isNode)
	 : __mapArgs.call(node, elems);
	}

	function __nullParent(node)
	{
	 if (isNode(node))
	 {
	  node._parent = null;
	 }
	}

	function __empty(node)
	{
	 var kids = node.children();
	 var nodes = kids.length > 0 ? kids.splice(0, kids.length) : kids;
	 nodes.forEach(__nullParent);
	 return nodes;
	}



	/*
	Basic & Low-Level Accessors
	---------------------------
	*/

	function splice(from, count, elems)
	{
	 var eles = __procArgs(elems, this);
	 var kids = this.children();
	 var args = __.isArray(eles) ? [from, count].concat(eles) : eles;
	 var removed = __.isArray(args)
	 ? kids.splice.apply(kids, args)
	 : isNode(args)
	 ? kids.splice(from, count, args)
	 : kids.splice(from, count);
	 
	 removed.forEach(__nullParent);
	 return this;
	}

	function parent()
	{
	 return this._parent;
	}

	function children(shallow)
	{
	 return shallow ? this._nodes.slice() : this._nodes;
	}

	function size()
	{
	 return this.children().length;
	}

	function last()
	{
	 return this.children()[this.children().length - 1];
	}

	function first()
	{
	 return this.children()[0];
	}

	function isFirstChild()
	{
	 return this.parent() && this.parent().first() === this;
	}

	function isLastChild()
	{
	 return this.parent() && this.parent().last() === this;
	}




	/*
	Manipulation
	------------
	*/

	function pop()
	{
	 __nullParent(this.children().pop());
	 return this;
	}

	function shift()
	{
	 __nullParent(this.children().shift());
	 return this;
	}


	function append(content)
	{
	 var eles = __procArgs(content, this), kids = this.children();
	 if (isNode(eles))
	 {
	  kids.push(eles);
	 }
	 else if (__.isArray(eles))
	 {
	  kids.push.apply(kids, eles);
	 }
	 return this;
	}

	function prepend(content)
	{
	 var eles = __procArgs(content, this), kids = this.children();
	 if (isNode(eles))
	 {
	  kids.unshift(eles);
	 }
	 else if (__.isArray(eles))
	 {
	  kids.unshift.apply(kids, eles);
	 }
	 return this;
	}

	function replaceWith(content)
	{
	 var pos = this.parent() ? this.parent().children().indexOf(this) : -1;
	 if (pos > -1)
	 {
	  this.parent().splice(pos, 1, content);
	 }
	 return this;
	}

	function replace(target)
	{
	 if (isNode(target))
	 {
	  target.replaceWith(this);
	 }
	 return this;
	}

	function empty()
	{
	 __empty(this);
	 return this;
	}



	/*
	Children Iteration
	------------------
	*/

	function filterChild(callback)
	{
	 var that = this;
	 __empty(that).forEach(function (node, index, sibs){
	  that.append(callback.call(that, node, index, sibs) ? node : null);
	 });
	 return that;
	}

	function rebuildChild(callback)
	{
	 __empty(this).forEach(callback, this);
	 return this;
	}



	/*
	Subtree Iteration
	-----------------
	*/

	/**
	 * @desc Depth-first pre-order traversal.
	 */
	function eachPre(callback, params)
	{
	 return __eachPre(this, this, callback, params);
	}

	function __eachPre(start, curr, callback, params)
	{
	 callback.call(start, curr, params);
	 curr.children().forEach(function (node){
	  __eachPre(start, node, callback, params);
	 });
	 return start;
	}

	function find(callback, params)
	{
	 var res = [];
	 this.eachPre(function (node){
	  if (callback.call(this, node, params))
	  {
	   res.push(this);
	  }
	 });
	 return res;
	}

	/**
	 * @desc Depth-first post-order traversal.
	 */
	function eachPost(callback, params)
	{
	 return __eachPost(this, this, callback, params);
	}

	function __eachPost(start, curr, callback, params)
	{
	 curr.children().forEach(function (node){
	  __eachPost(start, node, callback, params);
	 });
	 callback.call(start, curr, params);
	 return start;
	}


	/*
	Attributes, Properties, and Class Extension
	-------------------------------------------
	*/

	function text(val)
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
	}

	function attr(key, val)
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
	  this._attr[key] = val + "";
	 }
	 return this;
	}

	function removeAttr(key)
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
	}

	function type(newType)
	{
	 if (arguments.length === 0)
	 {
	  return this._type;
	 }
	 this._type = (newType + "").toLocaleUpperCase();
	 return this;
	}

	function extend(extendObj)
	{
	 return __.extend(this, extendObj);
	}

	function toJSON()
	{
	 var obj = __.extend({}, this);
	 delete obj._parent;
	 return obj;
	}



	/*
	Public: Constructors & Static Methods
	-------------------------------------
	*/

	function BBM(type)
	{
	 var obj = Object.create(BBM.prototype);
	 obj._type = (__.isString(type) ? type : "").toLocaleUpperCase();
	 obj._attr = {};
	 obj._nodes = [];
	 obj._parent = null;
	 return obj;
	}

	function isNode(target)
	{
	 return BBM.prototype.isPrototypeOf(target);
	}




	/*
	Export basic API
	----------------
	*/
	BBM.__ = __;
	BBM.ENUM = ENUM;
	BBM.isNode = isNode;
	BBM.fn = BBM.prototype =
	{
	  splice : splice
	, parent : parent
	, children : children
	 
	, size : size
	, last : last
	, first : first
	, isLastChild : isLastChild
	, isFirstChild : isFirstChild

	, pop : pop
	, shift : shift
	, append : append
	, prepend : prepend
	, replaceWith : replaceWith
	, replace : replace
	, empty : empty

	, filterChild : filterChild
	, rebuildChild : rebuildChild

	, eachPre : eachPre
	, find : find
	, eachPost : eachPost

	, text : text
	, attr : attr
	, type : type
	, removeAttr : removeAttr
	, extend : extend
	, toJSON : toJSON
	};


	module.exports = BBM;



/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var BBM = __webpack_require__(4);
	var __ = BBM.__;
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

	function pruneSwitch(node)
	{
	 var prev = this.last() || DUMMY;
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
	  this.append(res);
	 }
	}

	function pruneList(node)
	{
	 if (node.children().some(isPrunable))
	 {
	  node.rebuildChild(pruneSwitch);
	 }
	}

	BBM.fn.pruneList = function ()
	{
	 return this.eachPost(pruneList);
	};

	module.exports = BBM;




/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var BBM = __webpack_require__(4);
	var __ = BBM.__;
	var AST = BBM.ENUM;
	var DUMMY = BBM("_DUMMY");
	var LINKS = [AST.LINK_EXT, AST.LINK_INT, AST.LINK_WIKI];
	var ALONE =
	[
	  AST.PRE
	, AST.TD
	, AST.TH
	, AST.LI
	, AST.BLOCKQUOTE
	, AST.DD
	, AST.DT
	, AST.HR
	, AST.DIV
	, AST.LINK_EXT
	, AST.LINK_INT
	, AST.LINK_WIKI
	, AST.LINK_IMG
	, AST.COMMENT
	];


	function isBlank(node)
	{
	 return __.isBlankString(node.text())
	 && node.size() === 0
	 && ALONE.indexOf(node.type()) === -1;
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
	  node.empty().append(LINKS.indexOf(type) > -1 ? node.attr("href") : null);
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



	BBM.fn.pruneBlank = function ()
	{
	 return this.eachPost(pruneBlank);
	};

	module.exports = BBM;



/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var BBM = __webpack_require__(4);
	var __ = BBM.__;
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


	BBM.fn.pruneURL = function ()
	{
	 return __.isObject(this.symTable)
	 ? this.eachPre(pruneURL, this.symTable)
	 : this;
	};

	module.exports = BBM;



/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var BBM = __webpack_require__(4);
	var __ = BBM.__;

	function pruneID(node, idList)
	{
	 var id = __.rmWS(__.rmCTRL(node.attr("id") || ""));
	 if (!id)
	 {
	  return;
	 }
	 
	 if (idList.indexOf(id) === -1)
	 {
	  idList.push(id);
	  node.attr("id", id);
	 }
	 else
	 {
	  node.removeAttr("id");
	 }
	}

	BBM.fn.pruneID = function (idList)
	{
	 return this.eachPre(pruneID, __.isArray(idList) ? idList : []);
	};

	module.exports = BBM;



/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var BBM = __webpack_require__(4);
	var DUMMY = BBM("_DUMMY");

	function isPrunable(node, index, sibs)
	{
	 return (sibs[index - 1] || DUMMY).text() && node.text();
	}

	function pruneTextWork(node)
	{
	 var prev = this.last() || DUMMY;
	 if (prev.text() && node.text())
	 {
	  prev.text(prev.text() + node.text());
	 }
	 else
	 {
	  this.append(node);
	 }
	}

	function pruneText(node)
	{
	 if (node.children().some(isPrunable))
	 {
	  node.rebuildChild(pruneTextWork);
	 }
	}



	BBM.fn.pruneText = function ()
	{
	 return this.eachPre(pruneText);
	};

	module.exports = BBM;



/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	var BBM = __webpack_require__(4);
	var __ = BBM.__;
	var AST = BBM.ENUM;
	var XHTML = [AST.HR, AST.LINK_IMG];
	var INLINES =
	[
	  AST.DEL
	, AST.INS
	, AST.U
	, AST.SUB
	, AST.SUP
	, AST.EM
	, AST.BOLD
	, AST.CODE
	, AST.LINK_IMG
	, AST.LINK_INT
	, AST.LINK_WIKI
	, AST.LINK_EXT
	];

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
	 return XHTML.indexOf(node.type()) === -1;
	}

	function printXHTML(node, opts)
	{
	 return (opts.XHTML && XHTML.indexOf(node.type()) > -1) ? " /" : ""; 
	}

	function printIndent(node, opts)
	{
	 return INLINES.indexOf(node.type()) === -1
	 ? __.repeatString(" ", opts.depth)
	 : "";
	}

	function printBlockEnd(node)
	{
	 return INLINES.indexOf(node.type()) === -1 ? "\n" : ""; 
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
	 
	 for (var key in attr)
	 {
	  if (__.has(attr, key))
	  {
	   res += __.escapeATTR(key).substring(0, opts.maxAttrChars)
	   + "=\""
	   + ((node.type() === AST.LINK_INT && key === "href") ? "#" : "")
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
	 + node.children().map(printHTML, opts).join("")
	 + indent
	 + "-->"
	 + (node.isLastChild() ? "" : printBlockEnd(node, opts));
	}

	function printText(node, opts)
	{
	 return __.escapeHTML(opts.rmNL ? __.rmNL(node.text()) : node.text()); 
	}

	function printHTML(node)
	{
	 var str = "";
	 var opts = this;
	 
	 opts.depth += 1;
	 str = node.text().length > 0
	 ? printText(node, opts)
	 : node.type() === AST.COMMENT
	 ? (opts.comment ? printComment(node, opts) : "")
	 : printTagOpen(node, opts)
	   + node.children().map(printHTML, opts).join("")
	   + printTagClose(node, opts);
	 opts.depth -= 1;
	 return str;
	}

	BBM.fn.toHTML = function (options)
	{
	 var opts = __.extend({}, options);
	 opts.depth = (parseInt(opts.depth, 10) || 0) + (printTagName(this) ? -1 : -2);
	 opts.maxAttrChars = Math.abs(parseInt(opts.maxAttrChars, 10) || 2048);
	 opts.headerOffset = Math.abs(parseInt(opts.headerOffset, 10) || 0);
	 opts.XHTML = !!opts.XHTML;
	 opts.comment = !!opts.comment;
	 opts.rmNL = !!opts.rmNL;
	 return printHTML.call(opts, this);
	};

	module.exports = BBM;



/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	
	"use strict";

	function __extend(fromObj)
	{
	 if (fromObj === this || !isObject(fromObj)) {return;}
	 for (var key in fromObj)
	 {
	  if (has(fromObj, key))
	  {
	   this[key] = fromObj[key];
	  }
	 }
	}

	function toString(obj)
	{
	 return Object.prototype.toString.call(obj);
	}

	function toArray(obj, sPos, ePos)
	{
	 return Array.prototype.slice.call(obj, sPos, ePos);
	}

	function flatten(arr, shallow)
	{
	 var res = isArray(arr) ? arr : toArray(arr);
	 while (res.some(isArray))
	 {
	  res = Array.prototype.concat.apply([], res);
	  if (shallow)
	  {
	   break;
	  }
	 }
	 return res;
	}

	function isArray(obj)
	{
	 return Array.isArray ? Array.isArray(obj) : toString(obj) === "[object Array]";
	}

	function isObject(obj)
	{
	 return isFunction(obj) || (typeof obj === "object" && obj !== null);
	}

	function isString(obj)
	{
	 return typeof obj === "string" || toString(obj) === "[object String]";
	}

	function isNumber(obj)
	{
	 return typeof obj === "number" || toString(obj) === "[object Number]";
	}

	function isFunction(obj)
	{
	 return typeof obj === "function" || toString(obj) === "[object Function]";
	}

	function isBlankString(str)
	{
	 return /^\s*$/.test(str);
	}

	function repeatString(str, times)
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
	}

	function rmWS(str)
	{
	 return str.replace(/ \t\u00a0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000/g, "");
	}

	function rmNL(str)
	{
	 return str.replace(/[\v\f\r\n\u0085\u2028\u2029]+/g, "");
	}

	function rmNLTail(str)
	{
	 return str.replace(/[\v\f\r\n\u0085\u2028\u2029]+$/, "");
	}

	function rmCTRL(str)
	{
	 return str.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g, "");
	}

	function escapeHTML(str)
	{
	 return str.replace(/&/g, "&amp;")
	 .replace(/</g, "&lt;")
	 .replace(/>/g, "&gt;");
	}

	function escapeATTR(str)
	{
	 return escapeURI(rmCTRL(escapeHTML(str).replace(/"/g, "&quot;")
	 .replace(/'/g, "&#x27;")
	 .replace(/`/g, "&#x60;")));
	}

	function escapeURI(str)
	{
	 return str.replace(/^javascript:/i, "javascript;")
	 .replace(/^data:/i, "data;");
	}

	function has(obj, key)
	{
	 return Object.prototype.hasOwnProperty.call(obj, key);
	}

	function get(obj, key)
	{
	 return has(obj, key) ? obj[key] : void(0);
	}

	function extend(others)
	{
	 var toObj = isObject(others) ? others : {};
	 Array.prototype.forEach.call(arguments, __extend, toObj);
	 return toObj;
	}



	module.exports = {
	  toArray : toArray
	, flatten : flatten
	, isObject : isObject
	, isArray : isArray
	, isString : isString
	, isNumber : isNumber
	, isFunction : isFunction
	, isBlankString : isBlankString
	, repeatString : repeatString
	, rmWS : rmWS
	, rmNL : rmNL
	, rmNLTail : rmNLTail
	, rmCTRL : rmCTRL
	, escapeHTML : escapeHTML
	, escapeATTR : escapeATTR
	, escapeURI : escapeURI
	, has : has
	, get : get
	, extend : extend
	};



/***/ }
/******/ ])
});
