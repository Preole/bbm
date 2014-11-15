
"use strict";

var __ = module.exports = {};
var arrayFN = Array.prototype;
var objFN = Object.prototype;

__.toString = function (obj)
{
 return objFN.toString.call(obj);
};

__.isArray = Array.isArray || function (obj)
{
 return __.toString(obj) === "[object Array]";
};

__.isString = function (obj)
{
 return typeof obj === "string";
};

__.isNumber = function (obj)
{
 return typeof obj === "number";
};

__.isFunction = function (obj)
{
 return typeof obj === "function";
};

__.isObject = function (obj)
{
 return __.isFunction(obj) || (typeof obj === "object" && obj !== null);
};

__.isBlankString = function (str)
{
 return /^\s*$/.test(str);
};

__.flatten = function (arr, shallow)
{
 arr = arrayFN.concat.apply([], arr);
 while (!shallow && arr.some(__.isArray))
 {
  arr = arrayFN.concat.apply([], arr);
 }
 return arr;
};

__.map = function (array, callback, extras)
{
 return array.map(function (element){
  return callback(element, extras);
 });
};

__.repeatString = function (str, times)
{
 var res = "";
 while (times > 0)
 {
  res += (times % 2 === 1) ? str : "";
  str += times > 1 ? str : "";
  times = Math.floor(times / 2);
 }
 return res;
};

__.rmNL = function (str)
{
 return str.replace(/[\v\f\r\n\u0085\u2028\u2029]+/g, "");
};

__.rmNLTail = function (str)
{
 return str.replace(/[\v\f\r\n\u0085\u2028\u2029]+$/, "");
};

__.rmCTRL = function (str)
{
 return str.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g, "");
};

__.escapeHTML = function (str)
{
 return str.replace(/&/g, "&amp;")
 .replace(/</g, "&lt;")
 .replace(/>/g, "&gt;");
};

__.escapeATTR = function (str)
{
 return __.escapeURI(__.rmCTRL(__.escapeHTML(str).replace(/"/g, "&quot;")
 .replace(/'/g, "&#x27;")
 .replace(/`/g, "&#x60;")));
};

__.escapeURI = function (str)
{
 return str.replace(/^javascript:/i, "javascript;")
 .replace(/^data:/i, "data;");
};

__.has = function (obj, key)
{
 return objFN.hasOwnProperty.call(obj, key);
};

__.get = function (obj, key)
{
 return __.has(obj, key) ? obj[key] : void(0);
};

__.extend = function (others)
{
 var toObj = __.isObject(others) ? others : {};

 arrayFN.forEach.call(arguments, function (fromObj){
  if (fromObj === toObj || !__.isObject(fromObj)) {return;}
  for (var key in fromObj)
  {
   if (__.has(fromObj, key))
   {
    toObj[key] = fromObj[key];
   }
  }
 });

 return toObj;
};

