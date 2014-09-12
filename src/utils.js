(function (){
"use strict";

var expose =
{
 isObject : isObject,
 isString : isString,
 isBlankString : isBlankString,
 removeWS : removeWS,
 hasOwn : hasOwn,
 extend : extend
},
reBlank = /^\s*$/;

function isObject(obj)
{
 return typeof obj === "object" && obj !== null;
}

function isString(obj)
{
 return typeof obj === "string" || obj instanceof String;
}

function isBlankString(str)
{
 return reBlank.test(str);
}

function removeWS(str)
{
 return str.replace(/\s+/g, "");
}

function hasOwn(obj, key)
{
 return Object.prototype.hasOwnProperty.call(obj, key);
}

function extend(obj)
{
 var otherObjs = Array.prototype.slice.call(arguments).filter(isObject),
  toObj = isObject(otherObjs[0]) ? otherObjs[0] : {};
  
 otherObjs.forEach(function (fromObj, index){
  if (isObject(fromObj) && index > 0)
  {
   for (var key in fromObj)
   {
    if (hasOwn(fromObj, key))
    {
     toObj[key] = fromObj[key];
    }
   }
  }
 });
 return toObj;
}

if (typeof module === "object" && module.exports)
{
 module.exports = expose;
}

}());