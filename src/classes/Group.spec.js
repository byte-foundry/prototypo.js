/*jshint -W030 */

import Group from './Group.js';

describe('Group structure', function() {

	it('can be instanciated', function() {
		var l = new Group( 'foo bar' );

		expect(l.classes).to.be.deep.equal(['foo', 'bar']);
		expect(l._children).to.be.instanceof(Array);
		expect(l._children).to.be.empty;
	});

	it('is possible to check if it has a particular className', function() {
		var l = new Group( ['foo', 'bar'] );

		expect(l.is('.foo')).to.be.true;
		expect(l.is('.bar')).to.be.true;
		expect(l.is('.baz')).to.be.false;
	});

	it('is possible to retrieve all children and filter them by className', function() {
		var l = new Group(),
			c0 = new Group('foo bar'),
			c1 = new Group('foo baz'),
			c2 = new Group('bar biz');

		l.append(c0, c1, c2);

		expect(l.children().length).to.be.equal(3);
		expect(l.children('foo').length).to.be.equal(2);
		expect(l.children('bar').length).to.be.equal(2);
		expect(l.children('baz').length).to.be.equal(1);
		expect(l.children('buz').length).to.be.equal(0);
	});
});