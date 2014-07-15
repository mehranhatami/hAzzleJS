'use strict';

var conf = function conf() {
  if (conf.info) {
    return conf.info;
  } else {

    var config = {
        //although we don't have any app here but I think we will probably have it very soon
        //the app could be the hAzzle's documentaion site
        app: 'app',
        dist: 'distro',
        modules: 'modules'
      },
      hAzzleModules = [
        'hazzle.js',
        'ntapi.js',
        'types.js',
        'ready.js',
        'identify.js',		
        'shims/pnow.js',
        'document.js',
        'core.js',
        'cl3.js',
        'cl4.js',
        'changers.js',
        'compile.js',
        'jiesa.js',
        'funcs.js',
        'fx.js',
        'data.js',
        'shims/classlist.js',
        'classes.js',
        'html.js',
        'manipulation.js',
        'attributes.js',
        'removeable.js',
        'units.js',
        'css.js',
		'topleft.js',
        'position.js',
        'offset.js',
        'showhide.js',
        'detection.js',
        'events.js',
        'props.js',		
        'aliases.js',
        'eventhooks.js',
        'ajax.js',
        'clone.js',
        'parsing.js',
        'localestorage.js'
      ],
      modules = [],
      i = 0,
      l = hAzzleModules.length;

    for (; i < l; i++) {
      modules.push(config.modules + '/' + hAzzleModules[i]);
    }

    conf.info = {
      config: config,
      modules: modules
    };
    return conf.info;
  }
};

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
      files: ['Gruntfile.js', 'test/modules/*.js', 'test/**/spec/*.js'].concat(conf().modules),

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
    },

    coveralls: {
      options: {
        debug: true,
        coverage_dir: 'coverage',
        dryRun: false,
        force: true,
        recursive: true
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-karma-coveralls');

  //test task should be also added here
  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('build', ['concat', 'uglify']);
  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};