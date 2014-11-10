
"use strict";

var __ = module.exports = {};

__.map = function (array, callback, extras)
{
 return array.map(function (element){
  return callback(element, extras);
 });
};

__.toString = function (obj)
{
 return Object.prototype.toString.call(obj);
};

__.toArray = function (obj, sPos, ePos)
{
 return Array.prototype.slice.call(obj, sPos, ePos);
};

__.flatten = function (arr, shallow)
{
 var res = __.isArray(arr) ? arr : __.toArray(arr);
 while (res.some(__.isArray))
 {
  res = Array.prototype.concat.apply([], res);
  if (shallow)
  {
   break;
  }
 }
 return res;
};

__.isArray = function (obj)
{
 return Array.isArray
 ? Array.isArray(obj)
 : __.toString(obj) === "[object Array]";
};

__.isObject = function (obj)
{
 return __.isFunction(obj) || (typeof obj === "object" && obj !== null);
};

__.isString = function (obj)
{
 return typeof obj === "string" || __.toString(obj) === "[object String]";
};

__.isNumber = function (obj)
{
 return typeof obj === "number" || __.toString(obj) === "[object Number]";
};

__.isFunction = function (obj)
{
 return typeof obj === "function" || __.toString(obj) === "[object Function]";
};

__.isBlankString = function (str)
{
 return /^\s*$/.test(str);
};

__.repeatString = function (str, times)
{
 var many = Math.abs(parseInt(times, 10)) || 0;
 var res = "";
 while (many > 0)
 {
  if (many % 2 === 1)
  {
   res += str;
  }
  if (many > 1)
  {
   str += str;
  }
  many = Math.floor(many / 2);
 }
 return res;
};

__.rmWS = function (str)
{
 return str.replace(/ \t\u00a0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000/g, "");
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
 return Object.prototype.hasOwnProperty.call(obj, key);
};

__.get = function (obj, key)
{
 return __.has(obj, key) ? obj[key] : void(0);
};

__.extend = function (others)
{
 var toObj = __.isObject(others) ? others : {};

 Array.prototype.forEach.call(arguments, function (fromObj){
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

