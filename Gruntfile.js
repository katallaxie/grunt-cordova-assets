'use strict';

module.exports = (grunt) => {

  // Project configuration.
    grunt.initConfig({
        assets: {
          options: {
            config: 'cordova.xml',
            platforms: ['ios', 'android']
          },
          ios: {
            options: {
              platforms: ['ios'],
              icon: './icon.png',
              splash: './splash.png',
              // this expands the dest to the platform
              expand: false
            },
            dest: 'build/res/ios'
          },
          android: {
            options: {
              platforms: 'ios'
            },
            src: 'icon.png',
            dest: 'build/res'
          }
        },
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/*.js',
                '<%= nodeunit.tests %>'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        // Before generating any new files, remove any previously-created files.
        clean: {
            tests: ['myHybridAppFolder','cordova']
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js']
        }

    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin's task(s), then test the result.
    grunt.registerTask('test', ['assets']);
    // grunt.registerTask('test', ['cordova-assets', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);

};
