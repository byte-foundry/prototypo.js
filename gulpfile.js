'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

gulp.task('clean', function () {
	return gulp.src(['es5', 'dist'], { read: false }).pipe($.rimraf());
});

gulp.task('build', ['lint', 'test', 'clean'], function() {
	$.requirejs({
		baseUrl: 'src/',
		name: 'bower_components/almond/almond',
		include: ['main'],
		insertRequire: ['main'],
		out: 'prototypo.js',
		wrap: {
			startFile: 'src/start.frag',
			endFile: 'src/end.frag'
		}
	})
	.pipe(gulp.dest('dist'));
});

// var wiredep = require('wiredep');

gulp.task('traceur', function() {
	return gulp.src('src/**/*.js')
		.pipe($.sourcemaps.init())
		.pipe($.traceur({
			modules: 'amd'
		}))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest('es5'));
});

gulp.task('lint', function() {
	return gulp.src(['src/*.js', 'src/classes/*.js'])
		.pipe($.size())
		.pipe($.jshint())
		.pipe($.jshint.reporter('jshint-stylish'))
		.pipe($.jshint.reporter('fail'));
});

gulp.task('test', function() {
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
