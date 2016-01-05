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

		it('calculates local parameters from global params and parent params',
			function() {
				var glyph = font.glyphMap.R,
					contour = glyph.components[0].contours[0];

				font.update({ xHeight: 1 }, [ glyph ]);

				expect(contour.nodes[0].point.x).to.equal(0);
				expect(contour.nodes[0].point.y).to.equal(30);
				expect(contour.nodes[0].angle).to.equal( 1 * 2 + 1 + 'deg');
				expect(contour.nodes[1].point.x).to.equal( 1 + 1 + 3 );
				expect(contour.nodes[1].point.y).to.equal( 1 + 1 + 4 );
				expect(contour.nodes[2].point.x).to.equal( 1 * 2 * 2 );
				expect(contour.nodes[2].point.y).to.equal( 1 + 1 );
			});

		// CANNOT TEST TRANSFORMS, they happen at render time as we use
		// applyMatrix = false to prevent transforms to add-up at each update

		// it('can transform a component, using the default origin', function(){
		// 	var glyph = font.glyphMap.Q;
		// 	glyph.update({});
		// 	var component = glyph.components[0];
		//
		// 	expect(component.contours[0].nodes[0].point.x)
		// 		.to.be.closeTo(0, 0.1);
		// 	expect(component.contours[0].nodes[0].point.y)
		// 		.to.be.closeTo(0, 0.1);
		// 	expect(component.contours[0].nodes[1].point.x)
		// 		.to.be.closeTo(-50, 0.1);
		// 	expect(component.contours[0].nodes[1].point.y)
		// 		.to.be.closeTo(50, 0.1);
		// });
		//
		// it('can transform a component, using a transformOrigin', function() {
		// 	var glyph = font.glyphMap.Q;
		// 	glyph.update({});
		// 	var component = glyph.components[1];
		//
		// 	expect(component.contours[0].nodes[0].point.x)
		// 		.to.be.closeTo(100, 0.1);
		// 	expect(component.contours[0].nodes[0].point.y)
		// 		.to.be.closeTo(0, 0.1);
		// 	expect(component.contours[0].nodes[1].point.x)
		// 		.to.be.closeTo(50, 0.1);
		// 	expect(component.contours[0].nodes[1].point.y)
		// 		.to.be.closeTo(50, 0.1);
		// });
	});
});
