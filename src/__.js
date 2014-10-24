(function (){
"use strict";

function __extend(fromObj)
{
 if (fromObj === this || !isObject(fromObj)) {return;}
 for (var key in fromObj)
 {
  if (has(fromObj, key))
  {
   this[key] = fromObj[key];
  }
 }
}

function toString(obj)
{
 return Object.prototype.toString.call(obj);
}

function toArray(obj, sPos, ePos)
{
 return Array.prototype.slice.call(obj, sPos, ePos);
}

function flatten(arr, shallow)
{
 var res = isArray(arr) ? arr : toArray(arr);
 while (res.some(isArray))
 {
  res = Array.prototype.concat.apply([], res);
  if (shallow)
  {
   break;
  }
 }
 return res;
}

function isNull(obj)
{
 return obj === null;
}

function isArray(obj)
{
 return Array.isArray ? Array.isArray(obj) : toString(obj) === "[object Array]";
}

function isObject(obj)
{
 return isFunction(obj) || (typeof obj === "object" && obj !== null);
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
 return Array((Number(times) || 0) + 1).join(str);
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
 .replace(/`/g, "&#x60;")));
}

function escapeURI(str)
{
 return str.replace(/^javascript:/i, "javascript;")
 .replace(/^data:/i, "data;");
}

function has(obj, key)
{
 return Object.prototype.hasOwnProperty.call(obj, key);
}

function get(obj, key)
{
 return has(obj, key) ? obj[key] : void(0);
}

function extend(others)
{
 var toObj = isObject(others) ? others : {};
 Array.prototype.forEach.call(arguments, __extend, toObj);
 return toObj;
}



module.exports = {
  toString : toString
, toArray : toArray
, flatten : flatten
, isNull : isNull
, isObject : isObject
, isArray : isArray
, isString : isString
, isNumber : isNumber
, isFunction : isFunction
, isBlankString : isBlankString
, repeatString : repeatString
, rmWS : rmWS
, rmNL : rmNL
, rmNLTail : rmNLTail
, rmCTRL : rmCTRL
, escapeHTML : escapeHTML
, escapeATTR : escapeATTR
, escapeURI : escapeURI
, has : has
, get : get
, extend : extend
};

}());