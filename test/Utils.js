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

});