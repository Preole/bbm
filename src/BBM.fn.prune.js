(function (){
"use strict";

require("./BBM.fn.pruneList.js");
require("./BBM.fn.pruneBlank.js");
require("./BBM.fn.pruneURL.js");
require("./BBM.fn.pruneID.js");

var BBM = require("./BBM.js");

BBM.fn.prune = function (bbmStr, options)
{
 return this.pruneList().pruneBlank().pruneURL().pruneID();
};


}());