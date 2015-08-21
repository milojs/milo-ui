module.exports = function(grunt) {

    grunt.initConfig({
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: 'test/**/*.js'
            }
        },
        browserify: {
            milo_ui: {
                files: {
                    'dist/milo-ui.bundle.js': 'lib/milo-ui.js'
                },
                options: {
                    transform: ['brfs'],
                    debug: true
                }
            },
            tests: {
                files: [{
                    expand: true,
                    src: 'test_browser/**/*.js',
                    dest: '.tmp-test-browser'
                }],
                options: {
                    transform: ['brfs']
                }
            }
        },
        exorcise: {
            build: {
                options: {},
                files: {
                    'dist/milo-ui.bundle.map': 'dist/milo-ui.bundle.js'
                }
            }
        },
        uglify: {
            options: {
                sourceMap: sourceMap,
                sourceMappingURL: sourceMappingURL,
                sourceMapRoot: '/',
                mangle: !grunt.option('no-mangle')
            },
            milo: {
                files: {
                    'dist/milo-ui.min.js': 'dist/milo-ui.bundle.js'
                }
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        watch: {
            milo_ui: {
                files: ['lib/**/*.js'],
                tasks: 'browserify:milo_ui'
            },
            tests: {
                files: ['test_browser/**/*.{js,html}'],
                tasks: 'browserify:tests'
            }
        }
    });

    function sourceMap(dest) {
        return dest + '.map';
    }

    function sourceMappingURL(dest) {
        return sourceMap(dest.split('/').pop());
    }

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-exorcise');

    grunt.registerTask('test', 'mochaTest');
    grunt.registerTask('karma', 'browserify:tests');
    grunt.registerTask('karmatest', 'karma');
    grunt.registerTask('tests', ['mochaTest', 'browserify', 'karmatest']);
    grunt.registerTask('build', ['test', 'browserify', 'uglify', 'exorcise']);
    grunt.registerTask('default', ['build', 'watch']);
    grunt.registerTask('skiptest', ['browserify', 'watch']);
};
