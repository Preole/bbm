(function (){
"use strict";

var expose =
{
 isObject : isObject,
 hasOwn : hasOwn,
 trim : trim,
 extend : extend
};

function isObject(obj)
{
 return typeof obj === "object" && obj !== null;
}

function hasOwn(obj, key)
{
 return Object.prototype.hasOwnProperty.call(obj, key);
}

function extend(obj)
{
 var otherObjs = Array.prototype.slice.call(arguments, 1),
  toObj = isObject(obj) ? obj : {};
  
 otherObjs.forEach(function (fromObj, index){
  if (isObject(fromObj))
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
 return obj;
}

function trim(str)
{
 return str.replace(/(^\s+)|(\s+$)/g, "");
}

if (typeof module === "object" && module.exports)
{
 module.exports = expose;
}

}());