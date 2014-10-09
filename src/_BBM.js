
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
function BBM(type, attr)
{
 var obj = Object.create(BBM.prototype);
 obj._type = (BBM.isString(type) ? type : "").toLocaleUpperCase();
 obj._attr = BBM.isObject(attr) ? attr : {};
 obj._nodes = [];
 return obj;
}

function isNode(target)
{
 return (target instanceof BBM); //TODO: More reliability than instanceof
}



//Static variables.
__.extend(BBM, __);
BBM.ENUM = BBM.extend({}, ENUM);
BBM.isNode = isNode;


//Class methods.
BBM.fn = BBM.prototype;
BBM.fn.extend = function (extendObj)
{
 return BBM.extend(this, extendObj);
};

//Export module
module.exports = BBM;
}());