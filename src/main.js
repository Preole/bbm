(function (root, factory){
"use strict";

if (typeof define === "function" && define.amd)
{
 define([], factory);
}
else if (typeof module === "object" && typeof module.exports === "object")
{
 module.exports = factory();
}
else if (typeof module === "object" && typeof exports === "object")
{
 exports.BBM = factory(); 
}
else
{
 root.BBM = factory(); 
}



}(this, function (){
"use strict";

return require("./BBM.parse.js");
}));


