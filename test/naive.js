var expect = require('../node_modules/chai').expect,
	prototypo = require('../src/prototypo'),
	Utils = require('../src/Utils.js'),
	naive = require('../src/naive.js');

describe('naive', function() {
	before(function() {
		prototypo.setup({
			width: 1024,
			height: 1024
		});
	});

	describe('#expandSkeletons', function() {
		it('should expand an open skeleton into an additional contour', function() {
			var glyph = Utils.glyphFromSrc({
				name: 'A',
				contours: [{
					skeleton: true,
					closed: false,
					nodes: [{
						x: 10,
						y: 10
					}, {
						x: 200,
						y: 400
					}]
				}]
			});

			naive.expandSkeletons( glyph );

			expect(glyph.contours.length).to.equal(2);
			expect(glyph.contours[0].expanded[0]).to.equal(glyph.contours[1]);
			expect(glyph.contours[0].nodes[0].expanded[0]).to.equal(glyph.contours[1].nodes[0]);
			expect(glyph.contours[0].nodes[0].expanded[1]).to.equal(glyph.contours[1].nodes[3]);
			expect(glyph.contours[1].nodes[0].src._dependencies[0]).to.equal('contours.0.nodes.0');
			expect(glyph.contours[1].nodes[1].src._dependencies[0]).to.equal('contours.0.nodes.1');
			expect(glyph.contours[1].nodes[2].src._dependencies[0]).to.equal('contours.0.nodes.1');
			expect(glyph.contours[1].nodes[3].src._dependencies[0]).to.equal('contours.0.nodes.0');
		});

		it('should expand a closed skeleton into two additional contours', function() {
			var glyph = Utils.glyphFromSrc({
				name: 'A',
				contours: [{
					skeleton: true,
					closed: true,
					nodes: [{
						x: 10,
						y: 10
					}, {
						x: 200,
						y: 400
					}]
				}]
			});

			naive.expandSkeletons( glyph );

			expect(glyph.contours.length).to.equal(3);
			expect(glyph.contours[0].expanded[0]).to.equal(glyph.contours[1]);
			expect(glyph.contours[0].expanded[1]).to.equal(glyph.contours[2]);
			expect(glyph.contours[0].nodes[0].expanded[0]).to.equal(glyph.contours[1].nodes[0]);
			expect(glyph.contours[0].nodes[0].expanded[1]).to.equal(glyph.contours[2].nodes[1]);

			expect(glyph.contours[1].nodes[0].src._dependencies[0]).to.equal('contours.0.nodes.0');
			expect(glyph.contours[1].nodes[1].src._dependencies[0]).to.equal('contours.0.nodes.1');

			expect(glyph.contours[2].nodes[0].src._dependencies[0]).to.equal('contours.0.nodes.1');
			expect(glyph.contours[2].nodes[1].src._dependencies[0]).to.equal('contours.0.nodes.0');
		});
	});
});