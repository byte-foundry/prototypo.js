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
});