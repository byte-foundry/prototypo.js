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

	describe('#annotator', function() {
		it('should annotate point dependencies in contours', function() {
			var glyph = Utils.glyphFromSrc({
					name: 'A',
					contours: [ {
						nodes: [ {
							x: 10,
							y: 10
						} ]
					} ]
				});

			naive.annotator( glyph );

			expect(glyph.src.contours[0].nodes[0].point._dependencies)
				.to.deep.equal([
					'contours.0.nodes.0.x',
					'contours.0.nodes.0.y'
				]);
		});

		it('should annotate node dependencies in contours', function() {
			var glyph = Utils.glyphFromSrc({
					name: 'A',
					contours: [ {
						nodes: [ {
							x: 10,
							y: 10
						} ]
					} ]
				});

			naive.annotator( glyph );

			expect(glyph.src.contours[0].nodes[0]._dependencies)
				.to.deep.equal([
					'contours.0.all'
				]);
		});

		it('should annotate point dependencies in skeletons', function() {
			var glyph = Utils.glyphFromSrc({
					name: 'A',
					contours: [ {
						skeleton: true,
						closed: false,
						nodes: [ {
							x: 10,
							y: 10
						} ]
					} ]
				});

			naive.annotator( glyph );

			expect(
				glyph.src.contours[0].nodes[0].expandedTo[0].point._dependencies
			).to.deep.equal([
				'contours.0.nodes.0.x',
				'contours.0.nodes.0.y',
				'contours.0.nodes.0.expand'
			]);

			expect(
				glyph.src.contours[0].nodes[0].expandedTo[1].point._dependencies
			).to.deep.equal([
				'contours.0.nodes.0.x',
				'contours.0.nodes.0.y',
				'contours.0.nodes.0.expand'
			]);
		});

		it('should annotate node dependencies in open skeletons', function() {
			var glyph = Utils.glyphFromSrc({
					name: 'A',
					contours: [ {
						skeleton: true,
						closed: false,
						nodes: [ {
							x: 10,
							y: 10
						} ]
					} ]
				});

			naive.annotator( glyph );

			expect(
				glyph.src.contours[0].nodes[0].expandedTo[0]._dependencies
			).to.deep.equal([
				'contours.0.expandedTo.0.all'
			]);

			expect(
				glyph.src.contours[0].nodes[0].expandedTo[1]._dependencies
			).to.deep.equal([
				'contours.0.expandedTo.0.all'
			]);
		});

		it('should annotate node dependencies in closed skeletons', function() {
			var glyph = Utils.glyphFromSrc({
					name: 'A',
					contours: [ {
						skeleton: true,
						closed: true,
						nodes: [ {
							x: 10,
							y: 10
						} ]
					} ]
				});

			naive.annotator( glyph );

			expect(
				glyph.src.contours[0].nodes[0].expandedTo[0]._dependencies
			).to.deep.equal([
				'contours.0.expandedTo.0.all'
			]);

			expect(
				glyph.src.contours[0].nodes[0].expandedTo[1]._dependencies
			).to.deep.equal([
				'contours.0.expandedTo.1.all'
			]);
		});

		it('should annotate point dependencies of explicitely expanded nodes' +
			'in skeletons', function() {

			var glyph = Utils.glyphFromSrc({
					name: 'A',
					contours: [ {
						skeleton: true,
						closed: false,
						nodes: [ {
							expandedTo: [ {
								x: 0,
								y: 0
							}, {
								x: 20,
								y: 20
							} ]
						} ]
					} ]
				});

			naive.annotator( glyph );

			expect( glyph.src.contours[0].nodes[0].expandedTo[0]
						.point._dependencies
			).to.deep.equal([
				'contours.0.nodes.0.expandedTo.0.x',
				'contours.0.nodes.0.expandedTo.0.y'
			]);

			expect( glyph.src.contours[0].nodes[0].expandedTo[1]
						.point._dependencies
			).to.deep.equal([
				'contours.0.nodes.0.expandedTo.1.x',
				'contours.0.nodes.0.expandedTo.1.y'
			]);
		});

		it('should annotate contour dependencies', function() {
			var glyph = Utils.glyphFromSrc({
					name: 'A',
					contours: [ {
						nodes: [ {
							x: 10,
							y: 10
						}, {
							x: 200,
							y: 400
						} ]
					} ]
				});

			naive.annotator( glyph );

			expect(glyph.src.contours[0].all._dependencies)
				.to.deep.equal([
					'contours.0.nodes.0.all',
					'contours.0.nodes.1.all'
				]);

			expect(glyph.src.contours[0]._dependencies)
				.to.deep.equal([
					'contours.0.nodes.0',
					'contours.0.nodes.1'
				]);
		});

		it('should annotate open skeleton dependencies', function() {
			var glyph = Utils.glyphFromSrc({
					name: 'A',
					contours: [ {
						skeleton: true,
						closed: false,
						nodes: [ {
							x: 10,
							y: 10
						}, {
							x: 200,
							y: 400
						} ]
					} ]
				});

			naive.annotator( glyph );

			expect(glyph.src.contours[0].expandedTo[0].all._dependencies)
				.to.deep.equal([
					'contours.0.nodes.0.expandedTo.0.all',
					'contours.0.nodes.1.expandedTo.0.all',
					'contours.0.nodes.0.expandedTo.1.all',
					'contours.0.nodes.1.expandedTo.1.all'
				]);

			expect(glyph.src.contours[0].expandedTo[0]._dependencies)
				.to.deep.equal([
					'contours.0.expandedTo.0.all'
				]);
		});

		it('should annotate closed skeleton dependencies', function() {
			var glyph = Utils.glyphFromSrc({
					name: 'A',
					contours: [ {
						skeleton: true,
						closed: true,
						nodes: [ {
							x: 10,
							y: 10
						}, {
							x: 200,
							y: 400
						} ]
					} ]
				});

			naive.annotator( glyph );

			expect(glyph.src.contours[0].expandedTo[0].all._dependencies)
				.to.deep.equal([
					'contours.0.nodes.0.expandedTo.0.all',
					'contours.0.nodes.1.expandedTo.0.all'
				]);

			expect(glyph.src.contours[0].expandedTo[1].all._dependencies)
				.to.deep.equal([
					'contours.0.nodes.0.expandedTo.1.all',
					'contours.0.nodes.1.expandedTo.1.all'
				]);

			expect(glyph.src.contours[0].expandedTo[0]._dependencies)
				.to.deep.equal([
					'contours.0.expandedTo.0.all'
				]);

			expect(glyph.src.contours[0].expandedTo[1]._dependencies)
				.to.deep.equal([
					'contours.0.expandedTo.1.all'
				]);
		});

		it('should expand an open skeleton into a contour', function() {
			var glyph = Utils.glyphFromSrc({
					name: 'A',
					contours: [ {
						skeleton: true,
						closed: false,
						nodes: [ {
							x: 10,
							y: 10
						}, {
							x: 200,
							y: 400
						} ]
					} ]
				});

			naive.annotator( glyph );

			expect(glyph.contours.length)
				.to.equal(2);
			expect(glyph.contours[0].expandedTo[0])
				.to.equal(glyph.contours[1]);
			expect(glyph.contours[0].nodes[0].expandedTo[0])
				.to.equal(glyph.contours[1].nodes[0]);
			expect(glyph.contours[0].nodes[0].expandedTo[1])
				.to.equal(glyph.contours[1].nodes[3]);
		});

		it('should turn first and last nodes of an open skeleton into corners',
			function() {
				var glyph = Utils.glyphFromSrc({
						name: 'A',
						contours: [ {
							skeleton: true,
							closed: false,
							nodes: [ {
								type: 'smooth',
								x: 10,
								y: 10
							}, {
								type: 'smooth',
								x: 200,
								y: 400
							} ]
						} ]
					});

				naive.annotator( glyph );

				expect(glyph.contours[0].nodes[0].type).to.equal('corner');
				expect(glyph.contours[0].nodes[1].type).to.equal('corner');
		});

		it('should make a straight line at each tip of an open skeleton',
			function() {
				var glyph = Utils.glyphFromSrc({
						name: 'A',
						contours: [ {
							skeleton: true,
							closed: false,
							nodes: [ {
								type: 'smooth',
								x: 10,
								y: 10
							}, {
								type: 'smooth',
								x: 200,
								y: 400
							} ]
						} ]
					});

				naive.annotator( glyph );

				expect(glyph.contours[0].nodes[0].expandedTo[0].typeIn)
					.to.equal('line');
				expect(glyph.contours[0].nodes[0].expandedTo[1].typeOut)
					.to.equal('line');
				expect(glyph.contours[0].nodes[1].expandedTo[0].typeOut)
					.to.equal('line');
				expect(glyph.contours[0].nodes[1].expandedTo[1].typeIn)
					.to.equal('line');
		});

		it('should expand a closed skeleton into two additional contours',
			function() {
				var glyph = Utils.glyphFromSrc({
						name: 'A',
						contours: [ {
							skeleton: true,
							closed: true,
							nodes: [ {
								x: 10,
								y: 10
							}, {
								x: 200,
								y: 400
							} ]
						} ]
					});

				naive.annotator( glyph );

				expect(glyph.contours.length)
					.to.equal(3);
				expect(glyph.contours[0].expandedTo[0])
					.to.equal(glyph.contours[1]);
				expect(glyph.contours[0].expandedTo[1])
					.to.equal(glyph.contours[2]);
				expect(glyph.contours[0].nodes[0].expandedTo[0])
					.to.equal(glyph.contours[1].nodes[0]);
				expect(glyph.contours[0].nodes[0].expandedTo[1])
					.to.equal(glyph.contours[2].nodes[1]);
		});
	});

	describe('#skeletonCopier', function() {
		it('should copy node type from skeleton to contours', function() {
			var glyphSrc = {
					name: 'A',
					contours: [ {
						skeleton: true,
						closed: true,
						nodes: [ {
							x: 10,
							y: 10,
							type: 'a',
							typeOut: 'line'
						}, {
							x: 200,
							y: 400,
							typeOut: 'line'
						} ]
					} ]
				},
				glyph;

			Utils.createUpdaters( glyphSrc );
			glyph = Utils.glyphFromSrc( glyphSrc );
			naive.annotator( glyph );

			glyph.solvingOrder = Utils.solveDependencyTree( glyph );

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
					contours: [ {
						skeleton: true,
						closed: true,
						nodes: [ {
							x: 10,
							y: 10,
							dirOut: 0,
							type: 'smooth',
							typeIn: 'a'
						}, {
							x: 200,
							y: 400,
							dirIn: Math.PI,
							type: 'smooth',
							typeOut: 'b'
						} ]
					} ]
				},
				glyph;

			Utils.createUpdaters( glyphSrc );
			glyph = Utils.glyphFromSrc( glyphSrc );
			naive.annotator( glyph );

			glyph.solvingOrder = Utils.solveDependencyTree( glyph );

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
					contours: [ {
						skeleton: true,
						closed: true,
						nodes: [ {
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
						}, {
							x: 10,
							y: 10,
							dirIn: Math.PI / 6,
							dirOut: Math.PI / 7,
							type: 'smooth'
						}, {
							x: 10,
							y: 10,
							expand: {
								_operation: '{ angle: -Math.PI / 8 }',
								_parameters: [],
								_dependencies: []
							}
						} ]
					} ]
				},
				glyph;

			Utils.createUpdaters( glyphSrc );
			glyph = Utils.glyphFromSrc( glyphSrc );
			naive.annotator( glyph );

			glyph.solvingOrder = Utils.solveDependencyTree( glyph );

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
			// the + 2 * Math.PI is here for angle normalization
			expect(glyph.contours[0].nodes[4].expandedTo[1].dirIn + 2 * Math.PI)
				.to.be.closeTo(-Math.PI / 8 + Math.PI / 2 + Math.PI, 0.00001);
			expect(glyph.contours[0].nodes[4].expandedTo[1].dirOut)
				.to.equal(-Math.PI / 8 - Math.PI / 2 + Math.PI);
		});

		it('should copy tensions from skeleton to contours', function() {
			var glyphSrc = {
					name: 'A',
					contours: [ {
						skeleton: true,
						closed: true,
						nodes: [ {
							x: 10,
							y: 10,
							typeOut: 'line',
							tensionIn: 2,
							tension: 3
						}, {
							x: 200,
							y: 400,
							typeOut: 'line',
							tensionOut: 4,
							tension: 5
						} ]
					} ]
				},
				glyph;

			Utils.createUpdaters( glyphSrc );
			glyph = Utils.glyphFromSrc( glyphSrc );
			naive.annotator( glyph );

			glyph.solvingOrder = Utils.solveDependencyTree( glyph );

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
		it('should calculate the position of handles according directions',
			function() {
				var glyph = Utils.glyphFromSrc({
						name: 'A',
						contours: [ {
							closed: false,
							nodes: [ {
								x: 10,
								y: 10,
								dirOut: Math.PI / 2
							}, {
								x: 110,
								y: 110,
								dirIn: Math.PI
							} ]
						} ]
					});

				naive.updateContour( glyph.contours[0], 1 );

				expect(glyph.contours[0].nodes[0].handleOut.x).to.equal(0);
				expect(glyph.contours[0].nodes[0].handleOut.y).to.equal(100);
				expect(glyph.contours[0].nodes[1].handleIn.x).to.equal(-100);
				expect(glyph.contours[0].nodes[1].handleIn.y).to.equal(0);
		});

		it('should have a default curviness of 2/3', function() {
			var glyph = Utils.glyphFromSrc({
					name: 'A',
					contours: [ {
						closed: false,
						nodes: [ {
							x: 0,
							y: 0,
							dirOut: Math.PI / 2
						}, {
							x: 30,
							y: 30,
							dirIn: Math.PI
						} ]
					} ]
				});

			naive.updateContour( glyph.contours[0] );

			expect(glyph.contours[0].nodes[0].handleOut.x).to.equal(0);
			expect(glyph.contours[0].nodes[0].handleOut.y).to.equal(20);
			expect(glyph.contours[0].nodes[1].handleIn.x).to.equal(-20);
			expect(glyph.contours[0].nodes[1].handleIn.y).to.equal(0);
		});

		it('should be possible to draw a circle', function() {
			var glyph = Utils.glyphFromSrc({
					name: 'A',
					contours: [ {
						closed: true,
						nodes: [ {
							x: 0,
							y: 50,
							dirIn: -Math.PI / 2,
							dirOut: Math.PI / 2
						}, {
							x: 50,
							y: 100,
							dirIn: Math.PI,
							dirOut: 0
						}, {
							x: 100,
							y: 50,
							dirIn: Math.PI / 2,
							dirOut: -Math.PI / 2
						}, {
							x: 50,
							y: 0,
							dirIn: 0,
							dirOut: -Math.PI
						} ]
					} ]
				});

			naive.updateContour( glyph.contours[0], 1 );

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
