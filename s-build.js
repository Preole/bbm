"use strict";

var webpack = require("webpack");
var mstr = require("mstring");
var uglify = new webpack.optimize.UglifyJsPlugin({minimize: true});
var banner = new webpack.BannerPlugin(mstr(function (){
/***
BareBonesMarkup v2.0.0
Copyright 2013-2014 Preole Soandso
License: MIT
***/
}));

var webpackOpt =
{
  entry : "./index.js"
, plugins : [banner]
, output :
  {
    filename : "./dist/bbm.js"
  , library : "bbm"
  , libraryTarget : "umd"
  }
};
var webpackOptMin =
{
  entry : "./index.js"
, plugins : [banner, uglify]
, output :
  {
    filename : "./dist/bbm.min.js"
  , library : "bbm"
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

