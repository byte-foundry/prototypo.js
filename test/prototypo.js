var expect = require('../node_modules/chai').expect,
	prototypo = require('../src/prototypo'),
	// initUtils = require('../src/Utils.js'),
	// if this fails then make sure you have read the README ;)
	fixture = require('test.ptf');

describe('prototypo.js', function() {
	var font;

	before(function() {
		prototypo.setup({
			width: 1024,
			height: 1024
		});

		font = prototypo.parametricFont(fixture);
	});

	describe('Glyph#update', function() {
		it('can update a contour that uses Utils#onLine', function() {
			var glyph = font.glyphMap.M;
			glyph.update({});

			expect(glyph.contours[1].nodes[0].point.y).to.equal(10);
		});
	});
});
