/*jshint -W030 */

import Leaf from './Leaf.js';

describe('Leaf structure', function() {

	it('can be instanciated', function() {
		var l = new Leaf( 'foo bar' );

		expect(l.className).to.be.equal('foo bar');
		expect(l._children).to.be.instanceof(Array);
		expect(l._children).to.be.empty;
	});

	it('is possible to check if it has a particular className', function() {
		var l = new Leaf( 'foo bar' );

		expect(l.is('foo')).to.be.true;
		expect(l.is('bar')).to.be.true;
		expect(l.is('baz')).to.be.false;
	});

	it('is possible to check if it has a particular className', function() {
		var l = new Leaf( 'foo bar' );

		expect(l.is('foo')).to.be.true;
		expect(l.is('bar')).to.be.true;
		expect(l.is('baz')).to.be.false;
	});

	it('is possible to retrieve all children and filter them by className', function() {
		var l = new Leaf(),
			c0 = new Leaf('foo bar'),
			c1 = new Leaf('foo baz'),
			c2 = new Leaf('bar biz');

		l.append(c0, c1, c2);

		expect(l.children().length).to.be.equal(3);
		expect(l.children('foo').length).to.be.equal(2);
		expect(l.children('bar').length).to.be.equal(2);
		expect(l.children('baz').length).to.be.equal(1);
		expect(l.children('buz').length).to.be.equal(0);
	});
});