module.exports = function(grunt) {
"use strict";

 var libMap = //A hash map of standard grunt libraries.
 {
  pkg: grunt.file.readJSON("package.json"),
  jshint: 
  {
   options: 
   { 
    //Strict options
    camelcase: false,
    curly: false,
    es3: true,
    forin: false,
    freeze: true,
    immed: true,
    indent: 1,
    latedef: false,
    maxlen: 80,
    newcap: false,
    noarg: true,
    noempty: false,
    nonbsp: false,
    nonew: false,
    plusplus: false,
    quotmark: "double",
    strict: true,
    trailing: true,
    undef: true,
    unused: true,
    
    //Relaxing options
    eqnull: true,
    browser: true,
    node: true
   },
   all: ["./lib/bbm.js"]
  },
  uglify: 
  {
   options: 
   {
    preserveComments: "some"
   },
   all:
   {
    files: 
    {
     "./lib/bbm.min.js": ["./lib/bbm.js"]
    }
   }
  },
  clean:
  {
   all: 
   {
    src:
    [
     "./*.html",
     "./doc/*.html",
     "./lib/bbm.min.js",
     "./*.log"
    ]
   }
  }
 };
  
 //Load standard grunt libraries
 grunt.initConfig(libMap);
 for (var each in libMap)
 {
  if (each !== "pkg") {grunt.loadNpmTasks("grunt-contrib-" + each);}
 }
 
 //Tasks
 grunt.registerTask("lint", "Lint & Validate compiler", ["jshint"]);
 grunt.registerTask("build", "As Lint, plus minify", ["jshint", "uglify"]);
 grunt.registerTask("default", "Build, test, then doc", function() {
  grunt.task.run("build");
  require("./test.js")();
  require("./doc.js")();
 });
 grunt.registerTask("doc", "Builds HTML Docs", function() {
  require("./doc.js")();
 });
 grunt.registerTask("test", "Runs compiler test cases", function() {
  require("./test.js")();
 });
};