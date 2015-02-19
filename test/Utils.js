var expect = require('../node_modules/chai').expect,
	prototypo = require('../src/prototypo'),
	Utils = require('../src/Utils.js');

describe('Utils', function() {
	before(function() {
		prototypo.setup({
			width: 1024,
			height: 1024
		});
	});

	describe('#solveDependencyTree', function() {

		it('should solve a simple dependency tree', function() {
			var solved = Utils.solveDependencyTree({
				a: {
					_dependencies: ['b', 'c.0']
				},
				b: 2,
				c: [3],
				d: {
					_dependencies: ['a']
				}
			});

			expect(solved).to.deep.equal(['a', 'd']);
		});

	});

	describe('#expandDependencies', function() {

		it('should expand point and nodes into their properties', function() {
			var expanded = Utils.expandDependencies([
				'contours.0.nodes.1.point',
				'contours.1.nodes.23'
			], []);

			expect(expanded).to.deep.equal([
				'contours.0.nodes.1.x',
				'contours.0.nodes.1.y',
				'contours.1.nodes.23.x',
				'contours.1.nodes.23.y',
				'contours.1.nodes.23.expand',
			]);
		});

	});

	describe('#rayRayIntersection', function() {
		it('should return an array with the coordinates of the intersection', function() {
			var rri;

			// first quadrant
			rri = Utils.rayRayIntersection(
					{x: 110, y: 10},
					Math.PI / 2,
					{x: 10, y: 110},
					0
				);

			expect(Math.round(rri[0])).to.equal(110);
			expect(rri[1]).to.equal(110);

			// second quadrant
			rri = Utils.rayRayIntersection(
					{x: 110, y: 110},
					-Math.PI,
					{x: 10, y: 10},
					Math.PI / 2
				);

			expect(Math.round(rri[0])).to.equal(10);
			expect(rri[1]).to.equal(110);

			// third quadrant
			rri = Utils.rayRayIntersection(
					{x: 10, y: 110},
					-Math.PI / 2,
					{x: 110, y: 10},
					-Math.PI
				);

			expect(Math.round(rri[0])).to.equal(10);
			expect(Math.round(rri[1])).to.equal(10);

			// fourth quadrant
			rri = Utils.rayRayIntersection(
					{x: 10, y: 10},
					0,
					{x: 110, y: 110},
					-Math.PI / 2
				);

			expect(Math.round(rri[0])).to.equal(110);
			expect(rri[1]).to.equal(10);
		});

		it('should return null when rays don\'t intersect', function() {
			var rri = Utils.rayRayIntersection(
					{x: 0, y: 0},
					0,
					{x: 0, y: 100},
					Math.PI
				);

			expect(rri).to.equal(null);
		});
	});

});