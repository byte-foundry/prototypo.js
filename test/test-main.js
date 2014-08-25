'use strict';

var tests = [];
for (var file in window.__karma__.files) {
	if (window.__karma__.files.hasOwnProperty(file)) {console.log(file);
		if (/spec\.js$/i.test(file)) {
			tests.push(file);
		}
	}
}

console.log(tests);

requirejs.config({
	// Karma serves files from '/base'
	baseUrl: '/base/src',

	paths: {
		//'underscore': '../lib/underscore',
	},

	shim: {
		// 'underscore': {
		// 	exports: '_'
		// }
	},

	// ask Require.js to load these files (all our tests)
	deps: tests,

	// start test run, once Require.js is done
	callback: window.__karma__.start
});