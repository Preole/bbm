(function (){
"use strict";

function toString(obj)
{
 return Object.prototype.toString.call(obj);
}

function toArray(obj, startPos)
{
 return Array.prototype.slice.call(obj, Number(startPos) || 0);
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
 return /^\s*$/.test(str);
}

function repeatString(str, times)
{
 var s = "";
 if (times <= 0) {return s;}
 for (;;)
 {
  if (times & 1) {s += str;}
  times >>= 1;
  if (times) {str += str;}
  else {break;}
 }
 return s;
}

function rmWS(str)
{
 return str.replace(/ \t\u00a0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000/g, "");
}

function rmNL(str)
{
 return str.replace(/[\v\f\r\n\u0085\u2028\u2029]+/g, "");
}

function rmNLTail(str)
{
 return str.replace(/[\v\f\r\n\u0085\u2028\u2029]+$/, "");
}

function rmCTRL(str)
{
 return str.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g, "");
}

function escapeHTML(str)
{
 return str.replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;");
}

function escapeATTR(str)
{
 return escapeURI(rmCTRL(escapeHTML(str).replace(/"/g, "&quot;")
  .replace(/'/g, "&#x27;")
  .replace(/\//g, "&#x2F;")
  .replace(/`/g, "&#x60;")));
}

function escapeURI(str)
{
 return str.replace(/^javascript:/i, "javascript;")
  .replace(/^data:/i, "data;");
}


function hasOwn(obj, key)
{
 return Object.prototype.hasOwnProperty.call(obj, key);
}

function extend()
{
 var otherObjs = toArray(arguments).filter(isObject),
  toObj = isObject(this) ? this : isObject(otherObjs[0]) ? otherObjs[0] : {};
  
 otherObjs.forEach(function (fromObj){
  if (isObject(fromObj) && fromObj !== toObj)
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

module.exports = {
 toString : toString,
 toArray : toArray,
 isNull : isNull,
 isObject : isObject,
 isString : isString,
 isNumber : isNumber,
 isFunction : isFunction,
 isBlankString : isBlankString,
 repeatString : repeatString,
 rmWS : rmWS,
 rmNL : rmNL,
 rmNLTail : rmNLTail,
 rmCTRL : rmCTRL,
 escapeHTML : escapeHTML,
 escapeATTR : escapeATTR,
 escapeURI : escapeURI,
 hasOwn : hasOwn,
 extend : extend
};

}());