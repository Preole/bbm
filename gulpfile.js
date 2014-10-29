"use strict";

var gulp = require("gulp");
var webpack = require("webpack");
var jshint = require("gulp-jshint");
var diff = require("gulp-diff");
var markdox = require("markdox");

var pathEnter = "./src/main.js";
var pathSrc = "./src/*.js";
var pathDist = "./dist/bbm.js";
var libFmt = "umd";

var webpackOpt =
{
  entry : pathEnter
, output :
  {
    filename : pathDist
  , libraryTarget : libFmt
  }
};

function taskLint()
{
 return gulp.src(pathSrc)
  .pipe(jshint())
  .pipe(jshint.reporter("default"));
}

function taskTest()
{
 /*
 Require built script, then for each .txt file in the test directory, 
 perform a diff between the expected .html output and the current file.
 
 If there are differences, return an error; Proceed otherwise.
 */
}

function taskBuild()
{
 var compiler = webpack(webpackOpt);
 return compiler.run(function (err, stats){
  if (err)
  {
   throw new Error(err);
  }
  console.log(stats.toString());
 });
}

function taskRelease()
{
 /*
 Put a comment header with the following information:
 
 ; From package.json
 : - description
   - author
   - version
   - license
   - repository URL
   
 ; Build information
 : Built from webpack.
 */
}

function taskDoc()
{
}

gulp.task("lint", taskLint);
gulp.task("build", ["lint"], taskBuild);
gulp.task("test", ["lint", "build"], taskTest);
gulp.task("release", ["lint", "build", "test"], taskRelease);
gulp.task("doc", taskDoc);
