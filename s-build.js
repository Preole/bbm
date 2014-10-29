"use strict";

var webpack = require("webpack");
var webpackOpt =
{
  entry : "./src/main.js"
, output :
  {
    filename : "./dist/BBM.js"
  , libraryTarget : "umd"
  }
};

webpack(webpackOpt).run(function (err, stats){
 if (err)
 {
  throw new Error(err);
 }
 console.log(stats.toString());
});

