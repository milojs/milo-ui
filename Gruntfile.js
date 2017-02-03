'use strict';
module.exports = function(grunt) {

    grunt.initConfig({
        browserify: {
            milo_ui: {
                files: {
                    'dist/milo_ui.bundle.js': 'lib/milo_ui.js'
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
                    'dist/milo_ui.bundle.map': 'dist/milo_ui.bundle.js'
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
                    'dist/milo_ui.min.js': 'dist/milo_ui.bundle.js'
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
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('tests', ['karma']);
    grunt.registerTask('karma', ['browserify']);
    grunt.registerTask('build', ['browserify', 'uglify']);
    grunt.registerTask('default', ['build', 'watch']);
    grunt.registerTask('skiptest', ['browserify', 'watch']);
};
