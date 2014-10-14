
(function (){
"use strict";

var __ = require("./__.js"),
ENUM =
{
 _DT : "_DT",
 _DD : "_DD",
 _TH : "_TH",
 _TD : "_TD",
 _TR : "_TR",
 _LI_UL : "_LI_UL",
 _LI_OL : "_LI_OL",
 _ID : "_ID",
 _CLASS : "_CLASS",
 _DUMMY : "_DUMMY",
 
 ROOT : "ROOT",
 P : "P",
 BLOCKQUOTE : "BLOCKQUOTE",
 PRE : "PRE",
 DIV : "DIV",
 LI : "LI",
 UL : "UL",
 OL : "OL",
 HEADER : "HEADER",
 DT : "DT",
 DD : "DD",
 DL : "DL",
 TH : "TH",
 TD : "TD",
 HR : "HR",
 TR : "TR",
 TABLE : "TABLE",
 LINK_INT : "LINK_INT",
 LINK_EXT : "LINK_EXT",
 LINK_IMG : "LINK_IMG",
 LINK_WIKI : "LINK_WIKI",
 DEL : "DEL",
 INS : "INS",
 U : "U",
 SUB : "SUB",
 SUP : "SUP",
 EM : "EM",
 BOLD : "BOLD",
 CODE : "CODE",
 TEXT : "TEXT"
};

//Abstract syntax tree node.
function BBM(type)
{
 var obj = Object.create(BBM.prototype);
 obj._type = (BBM.isString(type) ? type : "").toLocaleUpperCase();
 obj._attr = {};
 obj._nodes = [];
 obj._parent = null;
 return obj;
}

function isNode(target)
{
 return BBM.prototype.isPrototypeOf(target);
}

function extend(extendObj)
{
 var argLen = arguments.length;
 return argLen === 0 
  ? return this
  : argLen === 1
  ? return __.extend(this, extendObj)
  : return __.extend.apply(null, BBM.toArray(arguments));
}

function fnExtend(extendObj)
{
 return BBM.extend(this, extendObj);
}


__.extend(BBM, __);
BBM.extend = extend;
BBM.extend({ENUM : ENUM, isNode : isNode});
BBM.fn = BBM.prototype;
BBM.fn.extend = fnExtend;


module.exports = BBM;
}());

