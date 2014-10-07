(function (){
"use strict";

var BBM = require("./BBM.js"),
ENUM = BBM.ENUM,
EMPTY = {},
ASTMAP =
{
 _TR : appendTable,
 _TH : appendTable,
 _TD : appendTable,
 _DT : appendDL,
 _DD : appendDL,
 _LI_UL : appendULOL,
 _LI_OL : appendULOL
};





//Private append for use by the parser. Resolves special node types into 
//their proper structures as they're being added.
function append()
{
 
}

BBM.prototype._append = append;

}());