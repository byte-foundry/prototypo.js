/*jshint -W030 */

import Node from './Node.js';

describe('Node structure', function() {

	it('can be instanciated', function() {
		var n = new Node({
			x: 12,
			y: 34,
			rCtrl: [45, 56],
			lCtrl: {x: 67, y: 78}
		});

		expect(n.constructor).to.be.equal(Node);
		expect(n.x).to.be.equal(12);
		expect(n.y).to.be.equal(34);
		expect(n.rCtrl.x).to.be.equal(45);
		expect(n.rCtrl.y).to.be.equal(56);
		expect(n.lCtrl.x).to.be.equal(67);
		expect(n.lCtrl.y).to.be.equal(78);
	});

	it('can update itself using parameters only', function() {
		var n = new Node({
			src: {
				x: {
					updater: function( contours, anchors, nodes, thickness, contrast ) {
						return thickness * contrast;
					},
					parameters: ['thickness', 'contrast']
				}
			}
		});

		n.update({
			thickness: 2,
			contrast: 3
		});

		expect(n.x).to.be.equal(6);
	});

	it('can update itself using parameters and other predefined nodes', function() {
		var n = new Node({
			src: {
				x: {
					updater: function( contours, anchors, nodes, thickness ) {
						return thickness + nodes[0].x;
					},
					parameters: ['thickness', 'contrast']
				}
			}
		});

		n.update({
			thickness: 2
		}, [], [], [
			{ x: 6 }
		]);

		expect(n.x).to.be.equal(8);
	});

	it('can update itself using the onLine param', function() {
		var n = new Node({
			x: 15,
			src: {
				x: {},
				onLine: [
					{operation: 'nodes[0]'},
					{operation: 'nodes[1]'}
				]
			}
		});

		n.update({
			thickness: 2
		}, [], [], [
			{ x: 10, y: 10 },
			{ x: 20, y: 20 }
		]);

		expect(n.y).to.be.equal(15);
	});
});