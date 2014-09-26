'use strict';

function complexityInfo(files, brief) {
    return {
        src: files,
        options: {
            breakOnErrors: false,

            jsLintXML: 'report/report.xml',
            checkstyleXML: 'report/checkstyle.xml',
            errorsOnly: false, // show only maintainability errors

            //number of cycles in the program flow control graph
            cyclomatic: 3,

            //number of distinct operators, the number of distinct operands,
            //the total number of operators and the total number of operands in each function
            halstead: 8,

            maintainability: 100,

            // only display maintainability
            hideComplexFunctions: brief === undefined ? false : brief,

            // broadcast data over event-bus
            broadcast: true
        }
    };
}

function conf(grunt) {
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
                'core.js',
                'booleans.js',
                'doml4.js',
                'query.js',
                'types.js',
                'has.js',                
                'ready.js',
                'text.js',
				'cache.js',
                'setter.js',
                'detection.js',
                'storage.js',
                'callback.js',
                'signals.js',
                'promises.js',
                'jiesa.js',
                'cl3.js',
                'cl4.js',								
                'matchesselector.js',
                'html.js',
                'clone.js',
                'showhide.js',
                'shims/classlist.js',
                'val.js',
                'manipulation.js',
                'attributes.js',
                'removeable.js',
                'curcss.js',
				'csscore.js',
                'styles.js',
                'csshooks.js',
                'events.js',
				'props.js',
                'trigger.js',
                'aliases.js',
                'eventHooks.js',
                'classes.js',
                'dimensions.js',
                'units.js',
                'offset.js',
				'raf.js',
				'traversing.js',
                'ajax.js',
                'jsonxml.js',
            ],
            modules = [],
            i = 0,
            l = hAzzleModules.length;

        for (; i < l; i++) {
            modules.push(config.modules + '/' + hAzzleModules[i]);
        }

        conf.info = {
            config: config,
            modules: modules,
            pkg: grunt.file.readJSON('package.json'),
            complexity: complexityInfo(modules),
            briefComplexity: complexityInfo(modules, true)
        };
        return conf.info;
    }
}

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: conf(grunt).pkg,
        config: conf(grunt).config,
        modules: conf(grunt).modules,

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: conf(grunt).modules,
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
            files: ['Gruntfile.js', 'test/modules/*.js', 'test/**/spec/*.js'].concat(conf(grunt).modules),

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
        },

        complexity: {
            generic: conf(grunt).complexity,
            brief: conf(grunt).briefComplexity
        }
    });

    grunt.loadNpmTasks('grunt-complexity');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-karma-coveralls');

    //test task should be also added here
    grunt.registerTask('test', ['jshint']);

    grunt.registerTask('metrics', ['complexity:generic']);
    grunt.registerTask('metrics:brief', ['complexity:brief']);

    grunt.registerTask('build', ['concat', 'uglify']);
    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};