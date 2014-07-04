//the reson for using this function is that in our solution files order really matter
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
    };

    var m = config.modules + '/',
      modules = [
        m + 'hazzle.js',
        m + 'features.js',
        m + 'selector.js',
        m + 'traversing.js',
        m + 'css.js',
        m + 'classes.js',
        m + 'manipulation.js',
        m + 'removeable.js',
        m + 'events.js',
        m + 'data.js',
        m + 'clone.js',
        m + 'parsing.js',
        m + 'observer.js',
        m + 'localestorage.js',
        m + 'browser.js'
      ];

    conf.info = {
      config: config,
      modules: modules,
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