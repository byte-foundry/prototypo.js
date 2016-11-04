const gulp = require('gulp');
const shelter = require('gulp-shelter')(gulp);

const src = 'src';
const dest = 'dist';
const project = 'prototypo';
const webpack = 'webpack --devtool source-map';
const dist = `${webpack}`;
const watch = `${webpack} --watch`;
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
		cmd: `${eslint} && ${dist} && ${mocha}`
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
