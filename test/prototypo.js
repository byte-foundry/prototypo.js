/*jshint camelcase: false */
var //expect = require('../node_modules/chai').expect,
	prototypo = require('../src/prototypo');
	// Utils = require('../src/Utils.js'),
	// naive = require('../src/naive.js'),

describe('prototypo.js', function() {
	before(function() {
		prototypo.setup({
			width: 1024,
			height: 1024
		});
	});

	describe('Glyph.prototype.update()', function() {
		var font,
			params;

		before(function() {
			font = prototypo.ParametricFont( fontSrc );
			params = {
				thickness: 2,
				contrast: 3,
				xHeight: 465
			};
		});
	});
});