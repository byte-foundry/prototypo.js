const gulp = require('gulp');
const shelter = require('gulp-shelter')(gulp);

const src = 'src';
const dest = 'dist';
const project = 'prototypo';
const webpack = 'webpack --devtool source-map';
const dist = `${webpack}`;
const watch = `${webpack} --watch`;
const jscs = `jscs ${src}/**.js test/**.js`;
const eslint = `eslint ${src}/**.js test/**.js`;
const browsersync = `browser-sync start --server --files "${dest}/${project}.js, index.html"`;
const mocha = 'mocha-phantomjs test.html --setting webSecurityEnabled=false localToRemoteUrlAccessEnabled=true';

shelter({
	dist: {
		dsc: 'generate dist files',
		cmd: dist
	},
	build: {
		dsc: `Lint code, generate ${project}-core.js and test it`,
		cmd: `{ ${jscs} & ${eslint}; } && ${dist} && ${mocha}`
	},
	serve: {
		dsc: 'Opens index.html and live-reload on changes',
		cmd: `${watch} & ${browsersync}`
	},
	test: {
		dsc: `Build ${project}.js + map and test it`,
		cmd: `${webpack} && ${mocha}`
	},
	debug: {
		dsc: `Debug ${project}.js using node-inspector`,
		cmd: `node-inspector --no-preload --web-port=8081
				& mocha --debug-brk -w test/*.js`
	}
});

// var path = require('path'),
// 	gulp = require('gulp'),
// 	shelter = require('gulp-shelter');
//
// shelter = shelter( gulp );
//
// shelter({
// 	/* Variables */
// 	project: 'prototypo',
// 	browserifyArgs: [
// 		'--standalone ${project}',
// 		// don't parse big js -> faster build, no need to derequire
// 		'-x',
// 			/*require.resolve(
// 				'./node_modules/plumin.js/node_modules/paper/dist/paper-core.js'
// 			)*/
// 			'paper'
// 		// no need to detect globals -> faster build
// 		//'--dg false' -> actually lodash.clone uses global
// 	],
//
// 	/* Fragments */
// 	_browserify: [
// 		'browserify src/${project}.js',
// 			'${browserifyArgs}',
// 			// we want a source map
// 			'--debug'
// 	],
// 	_uglify: [
// 		'uglifyjs dist/${project}.js',
// 			'-o dist/${project}.min.js',
// 			'--in-source-map dist/${project}.js.map',
// 			'--source-map dist/${project}.min.js.map'
// 	],
// 	// extract the source-map in its own file
// 	_exorcist: 'exorcist dist/${project}.js.map > dist/${project}.js',
// 	_dist: '${_browserify} | ${_exorcist} && ${_uglify}',
// 	_mocha: 'mocha test/*.js test/**.js --colors',
// 	_jscs: 'jscs src/**.js test/**.js',
// 	_eslint: 'eslint src/**.js test/**.js',
// 	_browsersync: 'browser-sync start --server --files "dist/*.js, index.html"',
//
// 	/* Tasks */
// 	watchify: {
// 		dsc: 'Update dist/plumin.js on source change',
// 		cmd: [ 'watchify src/${project}.js',
// 				'${browserifyArgs}',
// 				'-o dist/${project}.js',
// 				'--debug',
// 				'--verbose'
// 		]
// 	},
// 	build: {
// 		dsc: 'Lint code, generate dist files and test them',
// 		cmd: '${_dist}'
// 	},
// 	serve: {
// 		dsc: 'Opens index.html and live-reload on changes',
// 		cmd: '${watchify} & ${_browsersync}'
// 	},
// 	test: {
// 		dsc: 'Build ${project}.js + map and test it',
// 		cmd: '${_browserify} | ${_exorcist} && ${_mocha}'
// 	},
// 	debug: {
// 		dsc: 'Debug ${project}.js using node-inspector ' +
// 				'(required as global module)',
// 		cmd: [ 'node-inspector --no-preload --web-port=8081',
// 				'& mocha --debug-brk -w test/*.js'
// 		]
// 	}
// });
