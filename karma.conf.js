// Karma configuration file
//
// For all available config options and default values, see:
// https://github.com/karma-runner/karma/blob/stable/lib/config.js#L54
module.exports = function(config) {
    'use strict';

    var path = 'modules/',
        modules, files,
        hAzzleFiles = [],
        testFiles = [],
        i = 0,
        l;

    var modules = [
        'hazzle.js',
        'uniqueid.js',
        'cache.js',
        'doml4.js',
        'ntapi.js',
        'types.js',
        'ready.js',
        'shims/pnow.js',
        'extra.js',
        'text.js',
        'core.js',
        'setter.js',
        'storage.js',
        'cl3.js',
        'cl4.js',
        'changers.js',
        'compile.js',
        'jiesa.js',
        'matchesselector.js',
        'matches.js',
        'raf.js',
        'fx.js',
        'html.js',
        'shims/classlist.js',
        'classes.js',
        'appendhtml.js',
        'manipulation.js',
        'attributes.js',
        'removeable.js',
        'units.js',
        'styles.js',
        'css.js',
        'position.js',
        'offset.js',
        'showhide.js',
        'detection.js',
        'events.js',
        'trigger.js',
        'aliases.js',
        'eventHooks.js',
        'ajax.js',
        'clone.js',
        'jsonxml.js',
    ];

    for (l = modules.length; i < l; i++) {
        hAzzleFiles.push(path + modules[i]);
        testFiles.push('test/' + path + modules[i]);
    };

    files = ['components/chai/chai.js']
        .concat(hAzzleFiles)
        .concat(testFiles);

    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        frameworks: [
            'mocha'
        ],

        // list of files / patterns to load in the browser
        files: files,

        // use dots reporter, as travis terminal does not support escaping sequences
        // possible values: 'dots', 'progress', 'junit', 'teamcity'
        // CLI --reporters progress
        //reporters: ['dots'],
        reporters: ['progress', 'coverage'],

        preprocessors: {
            'modules/*js': 'coverage'
        },
        coverageReporter: {
            type: 'lcov',
            dir: 'coverage/'
        },

        // enable / disable watching file and executing tests whenever any file changes
        // CLI --auto-watch --no-auto-watch
        autoWatch: true,

        // start these browsers
        // CLI --browsers Chrome,Firefox,Safari
        browsers: [
            //'Firefox',
            //'Chrome',
            'PhantomJS'
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
            'karma-phantomjs-launcher',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-ie-launcher',
            'karma-safari-launcher',
            'karma-opera-launcher',

            'karma-coverage'
        ]
    });
};