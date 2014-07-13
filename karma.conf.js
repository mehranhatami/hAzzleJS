// Karma configuration file
//
// For all available config options and default values, see:
// https://github.com/karma-runner/karma/blob/stable/lib/config.js#L54

module.exports = function (config) {
  'use strict';

  var path = 'modules/';

  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    frameworks: [
      'mocha'
    ],

    /*

path + 'hazzle.js',
    path + 'shims/pnow.js',
    path + 'document.js',
        path + 'core.js',
        path + 'cl3.js',
        path + 'cl4.js',
        path + 'changers.js',
        path + 'compile.js',
        path + 'jiesa.js',
    path + 'funcs.js',
    path + 'fx.js',
    path + 'data.js',
        path + 'shims/classlist.js',
    path + 'classes.js',
    path + 'create.js',
    path + 'manipulation.js',
    path + 'removeable.js',
    path + 'units.js',
    path + 'css.js',
    path + 'showhide.js',
    path + 'detection.js',
    path + 'events.js',
    path + 'eventhooks.js',
    path + 'ajax.js',
    path + 'clone.js',
    path + 'parsing.js',
    path + 'localestorage.js'

*/

    // list of files / patterns to load in the browser
    files: [
      //'node_modules/requirejs/require.js',
      'components/chai/chai.js',
      path + 'hazzle.js',
      path + 'shims/pnow.js',
      path + 'document.js',
      path + 'core.js',
      path + 'cl3.js',
      path + 'cl4.js',
      path + 'changers.js',
      path + 'compile.js',
      path + 'jiesa.js',
      path + 'funcs.js',
      path + 'fx.js',
      path + 'data.js',
      path + 'shims/classlist.js',
      path + 'classes.js',
      path + 'create.js',
      path + 'manipulation.js',
      path + 'removeable.js',
      path + 'units.js',
      path + 'css.js',
      path + 'showhide.js',
      path + 'detection.js',
      path + 'events.js',
      path + 'eventhooks.js',
      path + 'ajax.js',
      path + 'clone.js',
      path + 'parsing.js',
      path + 'localestorage.js',
      //'hazzle.js',
      'test/test.js'
    ],

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress', 'junit', 'teamcity'
    // CLI --reporters progress
    reporters: ['dots'],

    // enable / disable watching file and executing tests whenever any file changes
    // CLI --auto-watch --no-auto-watch
    autoWatch: true,

    // start these browsers
    // CLI --browsers Chrome,Firefox,Safari
    browsers: [
      'ChromeCanary',
      'Firefox'
    ],

    // if browser does not capture in given timeout [ms], kill it
    // CLI --capture-timeout 5000
    captureTimeout: 20000,

    // auto run tests on start (when browsers are captured) and exit
    // CLI --single-run --no-single-run
    singleRun: false,

    plugins: [
      'karma-mocha',
      'karma-requirejs',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-ie-launcher',
      'karma-safari-launcher'
    ]
  });
};
