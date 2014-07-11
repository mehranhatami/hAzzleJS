'use strict';

module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    config: conf().config,

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: conf().modules,
        dest: '<%= config.dist %>/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          '<%= config.dist %>/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    jshint: {
      files: ['Gruntfile.js', 'test/*.js', 'test/**/spec/*.js'].concat(conf().modules),

      options: {
        globals: {
          hAzzle: true,
          console: true,
          module: true
        }
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    }
  });


  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  //test task should be also added here
  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('build', ['concat', 'uglify']);
  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};