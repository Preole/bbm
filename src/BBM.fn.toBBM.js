(function (){
"use strict";

var BBM = require("./BBM.js");
var ENUM = BBM.ENUM;
var REGSTR =
[
  "\"{3,}"
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

var REGEX = new RegExp(REGSTR.join("|"), "g");



//Serializes this subtree into BBM.
function toBBM()
{
 
}

BBM.prototype.toBBM = toBBM;

}());