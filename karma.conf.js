// Karma configuration
// Generated on Mon Aug 25 2014 11:40:25 GMT+0200 (CEST)
'use strict';

module.exports = function(config) {
	config.set({
		plugins: [
			'karma-mocha',
			'karma-chai',
			'karma-requirejs',
			'karma-phantomjs-launcher',
			'karma-chrome-launcher',
			'karma-firefox-launcher'
		],

		// base path that will be used to resolve all patterns (eg. files, exclude)
		basePath: '',


		// frameworks to use
		// available frameworks: https://npmjs.org/browse/keyword/karma-adapter
		frameworks: ['mocha', 'requirejs', 'chai'],


		// list of files / patterns to load in the browser
		files: [
			'test-main.conf.js',
			'src/bower_components/traceur-runtime/traceur-runtime.js',
			{pattern: 'src/bower_components/**/*.js', included: false},
			{pattern: 'es5/**/*.js', included: false},
			{pattern: 'mock_font/*.json', included: false}
		],

		// list of files to exclude
		exclude: [
			'es5/main.js'
		],


		// preprocess matching files before serving them to the browser
		// available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
		preprocessors: {
		},


		// test results reporter to use
		// possible values: 'dots', 'progress'
		// available reporters: https://npmjs.org/browse/keyword/karma-reporter
		reporters: ['progress'],


		// web server port
		port: 9876,


		// enable / disable colors in the output (reporters and logs)
		colors: true,


		// level of logging
		// possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_DEBUG,


		// enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,


		// start these browsers
		// available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
		browsers: ['Chrome'],


		// Continuous Integration mode
		// if true, Karma captures browsers, runs the tests and exits
		singleRun: true
	});
};
