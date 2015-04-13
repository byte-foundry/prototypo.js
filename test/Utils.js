var expect = require('../node_modules/chai').expect,
	prototypo = require('../src/prototypo'),
	Utils = require('../src/Utils.js'),
	fixture = require('test.ptf');

describe('Utils', function() {
	before(function() {
		prototypo.setup({
			width: 1024,
			height: 1024
		});
	});

	describe('#dependencyTree', function() {

		it('should solve a simple dependency tree', function() {
			var glyph = { src: {
					a: {
						_dependencies: [ 'b', 'c.0' ],
						_updaters: [ function() {} ]
					},
					b: 2,
					c: [ 3 ],
					d: {
						_dependencies: [ 'a' ],
						_updaters: [ function() {} ]
					}
				} },
				depTree = Utils.dependencyTree( glyph.src, null ),
				order = depTree.resolve();

			expect(order).to.deep.equal([ 'b', 'c.0', 'a', 'd' ]);
		});

	});

	describe('#transformsToMatrix', function() {
		it('should compute a list of transforms correctly', function() {
			var matrix = Utils.transformsToMatrix([
					[ 'translateX', 10 ],
					[ 'translateY', 20 ],
					[ 'rotate', '3deg' ],
					[ 'translate', 4, 5 ],
					[ 'scaleX', 1.3 ],
					[ 'scaleY', 0.9 ],
					[ 'translate', 9 ],
					[ 'scale', 0.7 ],
					[ 'translate', 10, 11 ],
					[ 'scale', 0.6, 1.1 ],
					[ 'skewX', '2deg' ],
					[ 'skewY', '3deg' ]
				]),
				precision = 0.0001;

			// this is the resulting matrix computed by Firefox.
			// let's trust they got the implementation right.
			expect(matrix._a).to.be.closeTo(0.544349, precision);
			expect(matrix._b).to.be.closeTo(0.0648965, precision);
			expect(matrix._c).to.be.closeTo(-0.0172282, precision);
			expect(matrix._d).to.be.closeTo(0.693048, precision);
			expect(matrix._tx).to.be.closeTo(34.1416, precision);
			expect(matrix._ty).to.be.closeTo(33.2116, precision);
		});
	});

	describe('#glyphFromSrc', function() {
		it('should embed components recursively', function() {
			var font = prototypo.parametricFont( fixture );

			expect( font.glyphMap.N.components.length )
				.to.equal(1);
			expect( font.glyphMap.N.components[0].name )
				.to.equal('O');
			expect( font.glyphMap.N.components[0].components.length )
				.to.equal(1);
			expect( font.glyphMap.N.components[0].components[0].name )
				.to.equal('P');
		});
	});

	// describe('#normalizeAngle', function() {
	// 	it('should normalize angles, ffs', function() {
	// 		expect(Utils.normalizeAngle( -Math.PI * 3 / 2 ))
	// 			.to.equal( Math.PI / 2 );
	// 	});
	// });
});
