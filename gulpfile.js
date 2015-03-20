var gulp = require('gulp'),
	shell = require('gulp-shell');

var mocha,
	jscs,
	eslint,
	browserify,
	uglify,
	watchify,
	browsersync;

function d( description, fn ) {
	fn.description = description;
	return fn;
}

gulp.task('mocha', d('Run unit tests using Mocha', shell.task([
	mocha = 'mocha test/*.js --colors'
])));

gulp.task('jscs', d('Enforce coding style using jscs', shell.task([
	jscs = 'jscs src/**.js'
])));

gulp.task('eslint', d('Lint code using eslint', shell.task([
	eslint = 'eslint src/**.js'
])));

gulp.task('browserify', d('Build standalone prototypo.js in dist/prototypo.js',
	shell.task([ browserify =
		'browserify src/prototypo.js --igv global --debug ' +
		'--standalone prototypo | derequire | exorcist ' +
		'dist/prototypo.js.map > dist/prototypo.js'
	])
));

gulp.task('uglify', d('Minimize dist file using Uglify', shell.task([
	uglify = 'uglifyjs dist/prototypo.js > dist/prototypo.min.js'
])));

gulp.task('watchify', d('Update dist/prototypo.js on source change',
	shell.task([ watchify =
		'watchify src/prototypo.js --igv global --debug ' +
		'--standalone prototypo -o dist/prototypo.js -v'
	])
));

gulp.task('browsersync', d('Live-reload using browsersync', shell.task([
	browsersync = 'browser-sync start --server --files "dist/*.js, index.html"'
])));

// High
gulp.task('build', d('Build standalone plumin.js and plumins.min.js in dist',
	shell.task([ browserify, uglify ])
));

gulp.task('test', d('Lint + Unit tests', shell.task([
	jscs, eslint, mocha
])));

gulp.task('serve', d(
	'Opens index.html in the browser and live-reload on changes',
	shell.task([ watchify + ' & ' + browsersync ])
));

gulp.task('debug', d(
	'Debug prototypo.js using node-inspector (required as global module)',
	shell.task([
		'node-inspector --no-preload --web-port=8081 ' +
		'& mocha --debug-brk -w test/*.js'
	])
));
