module.exports = (function (){
"use strict";

var toString = Object.prototype.toString;

function isObject(obj)
{
 return obj instanceof Object || typeof obj === "object";
}

function isString(obj)
{
 return typeof obj === "string" || toString.call(obj) === "[object String]";
}

function isNumber(obj)
{
 return typeof obj === "number" || toString.call(obj) === "[object Number]";
}

function isBlankString(str)
{
 return isString(str) && /^\s*$/.test(str);
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

return {
 isObject : isObject,
 isString : isString,
 isNumber : isNumber,
 isBlankString : isBlankString,
 hasOwn : hasOwn,
 extend : extend
};
}());