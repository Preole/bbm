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




//Serializes this subtree into BBM.
function toBBM()
{
 
}

BBM.fn.toBBM = toBBM;

}());