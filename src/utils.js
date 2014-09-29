(function (){
"use strict";

function toString(obj)
{
 return Object.prototype.toString.call(obj);
}

function isNull(obj)
{
 return obj === null;
}

function isObject(obj)
{
 return obj instanceof Object || (typeof obj === "object" && !isNull(obj));
}

function isString(obj)
{
 return typeof obj === "string" || toString(obj) === "[object String]";
}

function isNumber(obj)
{
 return typeof obj === "number" || toString(obj) === "[object Number]";
}

function isFunction(obj)
{
 return typeof obj === "function" || toString(obj) === "[object Function]";
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

module.exports {
 isNull : isNull,
 isObject : isObject,
 isString : isString,
 isNumber : isNumber,
 isFunction : isFunction,
 isBlankString : isBlankString,
 hasOwn : hasOwn,
 extend : extend
};

}());