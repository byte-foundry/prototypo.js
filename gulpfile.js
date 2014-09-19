'use strict';

var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

['es5', 'dist'].forEach(function(path) {
	gulp.task('clean-' + path, function() {
		return gulp.src([path], { read: false })
			.pipe($.rimraf());
	});
});

gulp.task('build', ['lint', 'test', 'clean-dist'], function() {
	return $.requirejs({
		baseUrl: 'es5/',
		name: '../bower_components/almond/almond',
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

gulp.task('traceur', ['clean-es5'], function() {
	return gulp.src(['src/**/*.js', '!src/bower_components/*'])
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

gulp.task('test', ['traceur'], function() {
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

gulp.task('copy-font', function() {
	return gulp.src(['test_font/*.json'])
		.pipe(gulp.dest('es5'));
});