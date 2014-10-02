/*jshint -W030 */

import Classify from './Classify.js';

describe('CLassify structure', function() {

	it('can be instanciated', function() {
		var c = new Classify({
			tags: ['foo', 'bar'],
			type: 'baz'
		});

		expect(c._tags).to.be.deep.equal(['foo', 'bar']);
		expect(c.type).to.be.equal('baz');
	});

	it('is possible to check if it has a particular tag', function() {
		var c = new Classify({
			tags: ['foo', 'bar'],
			type: 'baz'
		});

		expect(c.tags.has('foo')).to.be.true;
		expect(c.tags.has('bar')).to.be.true;
		expect(c.tags.has('baz')).to.be.false;
	});

	it('is possible to add one or more tags', function() {
		var c = new Classify();

		c.tags.add('foo');

		expect(c.tags.has('foo')).to.be.true;

		c.tags.add('bar', 'baz');

		expect(c.tags.has('foo')).to.be.true;
		expect(c.tags.has('bar')).to.be.true;
		expect(c.tags.has('baz')).to.be.true;
	});

	it('is possible to assign tags directly', function() {
		var c = new Classify();

		c.tags = 'foo bar';

		expect(c.tags.has('foo')).to.be.true;
		expect(c.tags.has('bar')).to.be.true;

		c.tags = ['foo', 'bar'];

		expect(c.tags.has('foo')).to.be.true;
		expect(c.tags.has('bar')).to.be.true;
	});
});