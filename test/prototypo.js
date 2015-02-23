/*jshint camelcase: false */
var expect = require('../node_modules/chai').expect,
	prototypo = require('../src/prototypo'),
	Utils = require('../src/Utils.js');
	// naive = require('../src/naive.js'),

describe('prototypo.js', function() {
	before(function() {
		prototypo.setup({
			width: 1024,
			height: 1024
		});
	});

	describe('Glyph.prototype.update()', function() {
		it('can update a contour that uses Utils#onLine', function() {
			var glyphSrc = {
					name: 'A',
					contours: [{
						closed: false,
						nodes: [{
							x: 0,
							y: 0
						}, {
							x: 100,
							y: 50
						}]
					}, {
						closed: false,
						nodes: [{
							x: 20,
							y: {
								_operation: 'Utils.onLine({x: contours[1].nodes[0].x, on: [contours[0].nodes[0].point, contours[0].nodes[1].point]});',
								_parameters: [],
								_dependencies: ['contours.1.nodes.0.x', 'contours.0.nodes.0.point', 'contours.1.nodes.1.point']
							}
						}, {
							x: 0,
							y: 100
						}]
					}]
				},
				glyph;

			Utils.createUpdaters( glyphSrc );
			glyph = Utils.glyphFromSrc( glyphSrc );
			glyph.solvingOrder = Utils.solveDependencyTree( glyphSrc ).map(function(path) {
				return path.split('.');
			});
			glyph.update({});

			expect(glyph.contours[1].nodes[0].point.y).to.equal(10);
		});
	});
});