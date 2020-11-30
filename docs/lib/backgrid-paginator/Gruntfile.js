/*
  backgrid-paginator
  http://github.com/wyuenho/backgrid-paginator

  Copyright (c) 2013-present-present Cloudflare, Inc and contributors
  Licensed under the MIT license.
*/

// jshint globalstrict:true, node:true

"use strict";

module.exports = function (grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON("package.json"),

    clean: {
      options: {
        force: true
      },
      api: [
        "api/**/*"
      ],
      "default": [
        "*.min.*",
        "test/coverage/**/*"
      ]
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      }
    },

    jsduck: {
      main: {
        src: ["backgrid-paginator.js"],
        dest: "api",
        options: {
          "external": ["Backbone.Model,Backbone.Collection,Backbone.View,Backgrid.Grid,Backgrid.Column"],
          "title": "backgrid-paginator",
          "no-source": true,
          "categories": "categories.json",
          "pretty-json": true
        }
      }
    },

    recess: {
      csslint: {
        options: {
          compile: true
        },
        files: {
          "backgrid-paginator.css": ["backgrid-paginator.css"]
        }
      },
      "default": {
        options: {
          compress: true
        },
        files: {
          "backgrid-paginator.min.css": ["backgrid-paginator.css"]
        }
      }
    },

    uglify: {
      options: {
        mangle: true,
        compress: true,
        preserveComments: "some"
      },
      "default": {
        files: {
          "backgrid-paginator.min.js": ["backgrid-paginator.js"]
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-recess");
  grunt.loadNpmTasks("grunt-jsduck");
  grunt.loadNpmTasks("grunt-karma");

  grunt.registerTask("dist", ["uglify", "recess"]);
  grunt.registerTask("default", ["clean", "jsduck", "dist", "karma"]);
};
