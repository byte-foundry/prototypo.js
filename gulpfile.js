var path = require('path'),
	gulp = require('gulp'),
	shell = require('gulp-shell'),
	browserify = require('browserify'),
	watchify = require('watchify'),
	exorcist = require('exorcist'),
	source = require('vinyl-source-stream');

function d( description, fn ) {
	fn.description = description;
	return fn;
}

function noop(done) {
	return done();
}

function _browserify() {
	return browserify({
		entries: require.resolve('./src/prototypo.js'),
		detectGlobals: false,
		debug: true,
		standalone: 'prototypo',
		noParse: [
			path.join(
				__dirname, 'node_modules/plumin.js/dist/plumin.js'
			)
		],
		cache: {},
		packageCache: {}
	});
}

function _bundle(b) {
	return b.bundle()
		.pipe(exorcist(path.join(__dirname, 'dist/prototypo.js.map')))
		.pipe(source('prototypo.js'))
		.pipe(gulp.dest('./dist'));
}

// low level tasks
gulp.task('mocha', d('Run unit tests using Mocha', shell.task([
	'mocha test/*.js --colors'
])));

gulp.task('jscs', d('Enforce coding style using jscs', shell.task([
	'jscs src/**.js'
])));

gulp.task('eslint', d('Lint code using eslint', shell.task([
	'eslint src/**.js'
])));

gulp.task('browserify', d('Build standalone prototypo.js in dist/',
	function() {
		return _bundle( _browserify() );
	}
));

gulp.task('uglify', d('Minimize dist file using Uglify', shell.task([
	'uglifyjs dist/prototypo.js > dist/prototypo.min.js'
])));

gulp.task('watchify', d('Update dist/prototypo.js on source change',
	function() {
		var b = _browserify();
		watchify(b).on('update', function() {
			console.log('[watchify] update');
			_bundle( b );
		});

		_bundle( b );
	}
));

gulp.task('browsersync', d('Live-reload using browsersync', shell.task([
	'browser-sync start --server --files "dist/*.js, index.html"'
])));

// high level tasks
gulp.task('build', [ 'browserify', 'uglify' ],
	d('Build standalone prototypo.js and prototypo.min.js in dist', noop)
);

gulp.task('test', [ 'jscs', 'eslint', 'mocha' ],
	d('Lint + Unit tests', noop)
);

gulp.task('serve', [ 'watchify', 'browsersync' ],
	d('Opens index.html and live-reload on changes', noop)
);

gulp.task('debug',
	d(
		'Debug prototypo.js using node-inspector (required as global module)',
		shell.task([
			'node-inspector --no-preload --web-port=8081 ' +
			'& mocha --debug-brk -w test/*.js'
		])
	)
);
