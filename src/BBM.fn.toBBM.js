(function (){
"use strict";

require("./BBM.fn.pruneText.js");

var BBM = require("./BBM.js");
var ENUM = BBM.ENUM;
var REGSTR =
[
  "\\\\"
, "\"{3,}"
, "--"
, "\\*{2}"
, "\\^{2}"
, ",,"
, "__"
, "''"
, "\\?<"
, "!<"
, "#<"
, "#\\["
, "-\\["
, "\\]"
];

var REGEX_TEXT = new RegExp(REGSTR.join("|"), "g");
var REGEX_PRE = new RegExp("\"{3,}", "g");
var REGEX_NL = new RegExp("TODORegex", "g");
var REGEX_NL_PARA = new RegExp("TODORegex|TODORegex2", "g");



//Serializes this subtree into approximate BBM representation.
//No guarantee in identical document though.
function toBBM()
{
 
}

BBM.fn.toBBM = toBBM;

}());

