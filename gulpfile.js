'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

// var wiredep = require('wiredep');

gulp.task('test', function() {
	// var bowerDeps = wiredep({
	// 	directory: 'src/bower_components',
	// 	dependencies: true,
	// 	devDependencies: true
	// });

	return gulp.src('undefined.js')
		.pipe($.karma({
			configFile: 'karma.conf.js',
			action: 'run'
		}))
		.on('error', function(err) {
			// Make sure failed tests cause gulp to exit non-zero
			throw err;
		});
});
