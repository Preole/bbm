"use strict";

var webpack = require("webpack");
var webpackOpt =
{
  entry : "./index.js"
, output :
  {
    filename : "./dist/BBM.js"
  , libraryTarget : "umd"
  }
};
var webpackOptMin =
{
  entry : "./index.js"
, plugins : [new webpack.optimize.UglifyJsPlugin({mangle: true, minimize: true})]
, output :
  {
    filename : "./dist/BBM.min.js"
  , libraryTarget : "umd"
  }
};

var runBuild = function (err, stats)
{
 if (err)
 {
  throw new Error(err);
 }
 console.log(stats.toString());
};

webpack(webpackOpt).run(runBuild);
webpack(webpackOptMin).run(runBuild);

