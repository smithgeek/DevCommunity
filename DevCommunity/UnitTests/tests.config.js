// Karma configuration
// Generated on Tue Jun 17 2014 20:50:51 GMT-0500 (Central Daylight Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],


    // list of files / patterns to load in the browser
    files: [
      'http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js',
	  'http://netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js',
	  'public/dist/js/readmore.min.js',
      'http://ajax.googleapis.com/ajax/libs/angularjs/1.2.17/angular.js',
      'http://ajax.googleapis.com/ajax/libs/angularjs/1.2.17/angular-mocks.js',
	  'http://ajax.googleapis.com/ajax/libs/angularjs/1.2.17/angular-route.js',
	  'http://ajax.googleapis.com/ajax/libs/angularjs/1.2.17/angular-sanitize.js',
	  'public/dist/js/angular-local-storage.min.js',
      'public/dist/ckeditor/ckeditor.js',
      'node_modules/expect.js/index.js',
      'node_modules/sinon/lib/sinon.js',
      'node_modules/sinon/lib/sinon.js',
      'node_modules/sinon/lib/sinon/call.js',
      'node_modules/sinon/lib/sinon/spy.js',
      'node_modules/sinon/lib/sinon/behavior.js',
      'node_modules/sinon/lib/sinon/stub.js',
      'node_modules/sinon/lib/sinon/mock.js',
      'node_modules/sinon/lib/sinon/collection.js',
      'node_modules/sinon/lib/sinon/assert.js',
      'node_modules/sinon/lib/sinon/sandbox.js',
      'node_modules/sinon/lib/sinon/test.js',
      'node_modules/sinon/lib/sinon/test_case.js',
      'node_modules/sinon/lib/sinon/assert.js',
      'node_modules/sinon/lib/sinon/match.js',
	  
      'public/**/*.js',
      //'../routes/**/*.js',
      'UnitTests/*.js',
      //'../server.js'
    ],


    // list of files to exclude
    exclude: [
      
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'public/assets/**/*.js': ['coverage']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage', 'html'],

    htmlReporter: {
        outputDir: 'TestResults'
	},

	coverageReporter: {
	    type: 'html',
        dir: 'TestResults/coverage/'
	},

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
