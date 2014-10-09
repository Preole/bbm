(function (){
"use strict";

var BBM = require("./BBM.js");




function _pruneURL(node, )
{

}

//Resolves reference links.
function pruneURL()
{
 return this.eachPost(_pruneURL, this);
}

BBM.prototype.pruneURL = pruneURL;

}());