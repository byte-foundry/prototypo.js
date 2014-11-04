'use strict';

var tests = [];
for (var file in window.__karma__.files) {
	if (window.__karma__.files.hasOwnProperty(file)) {
		if (/spec\.js$/i.test(file)) {
			tests.push(file);
		}
	}
}

requirejs.config({
	// Karma serves files from '/base'
	baseUrl: '/base/es5',

	// paths: {
	// 	'lodash': 'src/bower_components/lodash/dist/lodash',
	// 	'bezierjs': 'src/bower_components/bezierjs/bezier',
	// 	'opentype': 'src/bower_components/opentype.js/opentype.js',
	// },

	// shim: {
	// 	'lodash': {
	// 		exports: '_'
	// 	},
	// 	'bezierjs': {
	// 		exports: 'Bezier'
	// 	},
	// 	'opentype': {
	// 		exports: 'opentype'
	// 	}
	// },

	// ask Require.js to load these files (all our tests)
	deps: tests,

	// start test run, once Require.js is done
	callback: window.__karma__.start
});