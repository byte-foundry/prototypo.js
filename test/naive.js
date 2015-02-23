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
			expect(glyph.contours[0].expandedTo[0]).to.equal(glyph.contours[1]);
			expect(glyph.contours[0].nodes[0].expandedTo[0]).to.equal(glyph.contours[1].nodes[0]);
			expect(glyph.contours[0].nodes[0].expandedTo[1]).to.equal(glyph.contours[1].nodes[3]);
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
			expect(glyph.contours[0].expandedTo[0]).to.equal(glyph.contours[1]);
			expect(glyph.contours[0].expandedTo[1]).to.equal(glyph.contours[2]);
			expect(glyph.contours[0].nodes[0].expandedTo[0]).to.equal(glyph.contours[1].nodes[0]);
			expect(glyph.contours[0].nodes[0].expandedTo[1]).to.equal(glyph.contours[2].nodes[1]);

			expect(glyph.contours[1].nodes[0].src._dependencies[0]).to.equal('contours.0.nodes.0');
			expect(glyph.contours[1].nodes[1].src._dependencies[0]).to.equal('contours.0.nodes.1');

			expect(glyph.contours[2].nodes[0].src._dependencies[0]).to.equal('contours.0.nodes.1');
			expect(glyph.contours[2].nodes[1].src._dependencies[0]).to.equal('contours.0.nodes.0');
		});
	});

	describe('#skeletonCopier', function() {
		it('should copy node type from skeleton to contours', function() {
			var glyphSrc = {
					name: 'A',
					contours: [{
						skeleton: true,
						closed: true,
						nodes: [{
							x: 10,
							y: 10,
							type: 'a'
						}, {
							x: 200,
							y: 400
						}]
					}]
				},
				glyph,
				solvingOrder;

			Utils.createUpdaters( glyphSrc );
			glyph = Utils.glyphFromSrc( glyphSrc );
			naive.expandSkeletons( glyph );
			solvingOrder = Utils.solveDependencyTree( glyphSrc );
			glyph.solvingOrder = solvingOrder.map(function(path) {
				return path.split('.');
			});

			glyph.update({ width: 10 });

			expect(glyph.contours[0].nodes[0].expandedTo[0].type)
				.to.equal(glyph.contours[0].nodes[0].type);
			expect(glyph.contours[0].nodes[0].expandedTo[1].type)
				.to.equal(glyph.contours[0].nodes[0].type);
			expect(glyph.contours[0].nodes[1].expandedTo[0].type)
				.to.equal(glyph.contours[0].nodes[1].type);
			expect(glyph.contours[0].nodes[1].expandedTo[0].type)
				.to.equal(undefined);
			expect(glyph.contours[0].nodes[1].expandedTo[1].type)
				.to.equal(undefined);
		});

		it('should copy direction type from skeleton to contours', function() {
			var glyphSrc = {
					name: 'A',
					contours: [{
						skeleton: true,
						closed: true,
						nodes: [{
							x: 10,
							y: 10,
							typeIn: 'a'
						}, {
							x: 200,
							y: 400,
							typeOut: 'b'
						}]
					}]
				},
				glyph,
				solvingOrder;

			Utils.createUpdaters( glyphSrc );
			glyph = Utils.glyphFromSrc( glyphSrc );
			naive.expandSkeletons( glyph );
			solvingOrder = Utils.solveDependencyTree( glyphSrc );
			glyph.solvingOrder = solvingOrder.map(function(path) {
				return path.split('.');
			});

			glyph.update({ width: 10 });

			expect(glyph.contours[0].nodes[0].expandedTo[0].typeIn)
				.to.equal('a');
			expect(glyph.contours[0].nodes[0].expandedTo[0].typeOut)
				.to.equal(undefined);
			expect(glyph.contours[0].nodes[0].expandedTo[1].typeIn)
				.to.equal(undefined);
			expect(glyph.contours[0].nodes[0].expandedTo[1].typeOut)
				.to.equal('a');
			expect(glyph.contours[0].nodes[1].expandedTo[0].typeIn)
				.to.equal(undefined);
			expect(glyph.contours[0].nodes[1].expandedTo[0].typeOut)
				.to.equal('b');
			expect(glyph.contours[0].nodes[1].expandedTo[1].typeIn)
				.to.equal('b');
			expect(glyph.contours[0].nodes[1].expandedTo[1].typeOut)
				.to.equal(undefined);
		});

		it('should copy direction from skeleton to contours', function() {
			var glyphSrc = {
					name: 'A',
					contours: [{
						skeleton: true,
						closed: true,
						nodes: [{
							x: 10,
							y: 10,
							dirIn: Math.PI / 4,
							dirOut: Math.PI / 3
						}, {
							x: 200,
							y: 400,
							dirIn: Math.PI / 2,
							type: 'smooth'
						}, {
							x: 200,
							y: 400,
							dirOut: Math.PI / 5,
							type: 'smooth'
						},{
							x: 10,
							y: 10,
							dirIn: Math.PI / 6,
							dirOut: Math.PI / 7,
							type: 'smooth'
						},{
							x: 10,
							y: 10,
							expand: {
								_operation: '{ angle: -Math.PI / 8 }',
								_parameters: [],
								_dependencies: []
							}
						}]
					}]
				},
				glyph,
				solvingOrder;

			Utils.createUpdaters( glyphSrc );
			glyph = Utils.glyphFromSrc( glyphSrc );
			naive.expandSkeletons( glyph );
			solvingOrder = Utils.solveDependencyTree( glyphSrc );
			glyph.solvingOrder = solvingOrder.map(function(path) {
				return path.split('.');
			});

			glyph.update({ width: 10 });

			expect(glyph.contours[0].nodes[0].expandedTo[0].dirIn)
				.to.equal(Math.PI / 4);
			expect(glyph.contours[0].nodes[0].expandedTo[0].dirOut)
				.to.equal(Math.PI / 3);
			expect(glyph.contours[0].nodes[0].expandedTo[1].dirIn)
				.to.equal(Math.PI / 3);
			expect(glyph.contours[0].nodes[0].expandedTo[1].dirOut)
				.to.equal(Math.PI / 4);

			expect(glyph.contours[0].nodes[1].expandedTo[0].dirIn)
				.to.equal(Math.PI / 2);
			expect(glyph.contours[0].nodes[1].expandedTo[0].dirOut)
				.to.equal(Math.PI / 2 + Math.PI);
			expect(glyph.contours[0].nodes[1].expandedTo[1].dirIn)
				.to.equal(Math.PI / 2 + Math.PI);
			expect(glyph.contours[0].nodes[1].expandedTo[1].dirOut)
				.to.equal(Math.PI / 2);

			expect(glyph.contours[0].nodes[2].expandedTo[0].dirIn)
				.to.equal(Math.PI / 5 + Math.PI);
			expect(glyph.contours[0].nodes[2].expandedTo[0].dirOut)
				.to.equal(Math.PI / 5);
			expect(glyph.contours[0].nodes[2].expandedTo[1].dirIn)
				.to.equal(Math.PI / 5);
			expect(glyph.contours[0].nodes[2].expandedTo[1].dirOut)
				.to.equal(Math.PI / 5 + Math.PI);

			expect(glyph.contours[0].nodes[3].expandedTo[0].dirIn)
				.to.equal(Math.PI / 6);
			expect(glyph.contours[0].nodes[3].expandedTo[0].dirOut)
				.to.equal(Math.PI / 7);
			expect(glyph.contours[0].nodes[3].expandedTo[1].dirIn)
				.to.equal(Math.PI / 7);
			expect(glyph.contours[0].nodes[3].expandedTo[1].dirOut)
				.to.equal(Math.PI / 6);

			expect(glyph.contours[0].nodes[4].expandedTo[0].dirIn)
				.to.equal(-Math.PI / 8 - Math.PI / 2);
			expect(glyph.contours[0].nodes[4].expandedTo[0].dirOut)
				.to.equal(-Math.PI / 8 + Math.PI / 2);
			expect(Utils.normalizeAngle(glyph.contours[0].nodes[4].expandedTo[1].dirIn))
				.to.equal(-Math.PI / 8 + Math.PI / 2 + Math.PI);
			expect(glyph.contours[0].nodes[4].expandedTo[1].dirOut)
				.to.equal(-Math.PI / 8 - Math.PI / 2 + Math.PI);
		});

		it('should copy tensions from skeleton to contours', function() {
			var glyphSrc = {
					name: 'A',
					contours: [{
						skeleton: true,
						closed: true,
						nodes: [{
							x: 10,
							y: 10,
							tensionIn: 2,
							tension: 3
						}, {
							x: 200,
							y: 400,
							tensionOut: 4,
							tension: 5
						}]
					}]
				},
				glyph,
				solvingOrder;

			Utils.createUpdaters( glyphSrc );
			glyph = Utils.glyphFromSrc( glyphSrc );
			naive.expandSkeletons( glyph );
			solvingOrder = Utils.solveDependencyTree( glyphSrc );
			glyph.solvingOrder = solvingOrder.map(function(path) {
				return path.split('.');
			});

			glyph.update({ width: 10 });

			expect(glyph.contours[0].nodes[0].expandedTo[0].tensionIn)
				.to.equal(2);
			expect(glyph.contours[0].nodes[0].expandedTo[0].tensionOut)
				.to.equal(3);
			expect(glyph.contours[0].nodes[0].expandedTo[1].tensionIn)
				.to.equal(3);
			expect(glyph.contours[0].nodes[0].expandedTo[1].tensionOut)
				.to.equal(2);
			expect(glyph.contours[0].nodes[1].expandedTo[0].tensionIn)
				.to.equal(5);
			expect(glyph.contours[0].nodes[1].expandedTo[0].tensionOut)
				.to.equal(4);
			expect(glyph.contours[0].nodes[1].expandedTo[1].tensionIn)
				.to.equal(4);
			expect(glyph.contours[0].nodes[1].expandedTo[1].tensionOut)
				.to.equal(5);
		});
	});

	describe('#updateContour', function() {
		it('should calculate the position of control points according to node directions', function() {
			var glyph = Utils.glyphFromSrc({
					name: 'A',
					contours: [{
						closed: false,
						nodes: [{
							x: 10,
							y: 10,
							dirOut: Math.PI / 2
						}, {
							x: 110,
							y: 110,
							dirIn: Math.PI
						}]
					}]
				});

			naive.updateContour( glyph.contours[0], { curviness: 1 } );

			expect(glyph.contours[0].nodes[0].handleOut.x).to.equal(0);
			expect(glyph.contours[0].nodes[0].handleOut.y).to.equal(100);
			expect(glyph.contours[0].nodes[1].handleIn.x).to.equal(-100);
			expect(glyph.contours[0].nodes[1].handleIn.y).to.equal(0);
		});

		it('should have a default curviness of 2/3', function() {
			var glyph = Utils.glyphFromSrc({
					name: 'A',
					contours: [{
						closed: false,
						nodes: [{
							x: 0,
							y: 0,
							dirOut: Math.PI / 2
						}, {
							x: 30,
							y: 30,
							dirIn: Math.PI
						}]
					}]
				});

			naive.updateContour( glyph.contours[0], {} );

			expect(glyph.contours[0].nodes[0].handleOut.x).to.equal(0);
			expect(glyph.contours[0].nodes[0].handleOut.y).to.equal(20);
			expect(glyph.contours[0].nodes[1].handleIn.x).to.equal(-20);
			expect(glyph.contours[0].nodes[1].handleIn.y).to.equal(0);
		});

		it('should be possible to draw a circle', function() {
			var glyph = Utils.glyphFromSrc({
					name: 'A',
					contours: [{
						closed: true,
						nodes: [{
							x: 0,
							y: 50,
							dirIn: -Math.PI / 2,
							dirOut: Math.PI / 2
						}, {
							x: 50,
							y: 100,
							dirIn: Math.PI,
							dirOut: 0
						},{
							x: 100,
							y: 50,
							dirIn: Math.PI / 2,
							dirOut: -Math.PI / 2
						},{
							x: 50,
							y: 0,
							dirIn: 0,
							dirOut: -Math.PI
						}]
					}]
				});

			naive.updateContour( glyph.contours[0], {curviness: 1} );

			expect(glyph.contours[0].nodes[0].handleIn.x).to.equal(0);
			expect(glyph.contours[0].nodes[0].handleIn.y).to.equal(-50);
			expect(glyph.contours[0].nodes[0].handleOut.x).to.equal(0);
			expect(glyph.contours[0].nodes[0].handleOut.y).to.equal(50);
			expect(glyph.contours[0].nodes[1].handleIn.x).to.equal(-50);
			expect(glyph.contours[0].nodes[1].handleIn.y).to.equal(0);
			expect(glyph.contours[0].nodes[1].handleOut.x).to.equal(50);
			expect(glyph.contours[0].nodes[1].handleOut.y).to.equal(0);
			expect(glyph.contours[0].nodes[2].handleIn.x).to.equal(0);
			expect(glyph.contours[0].nodes[2].handleIn.y).to.equal(50);
			expect(glyph.contours[0].nodes[2].handleOut.x).to.equal(0);
			expect(glyph.contours[0].nodes[2].handleOut.y).to.equal(-50);
			expect(glyph.contours[0].nodes[3].handleIn.x).to.equal(50);
			expect(glyph.contours[0].nodes[3].handleIn.y).to.equal(0);
			expect(glyph.contours[0].nodes[3].handleOut.x).to.equal(-50);
			expect(glyph.contours[0].nodes[3].handleOut.y).to.equal(0);
		});
	});
});