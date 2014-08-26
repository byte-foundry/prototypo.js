/*jshint -W030 */

import Typeface from './Typeface.js';

describe('Typeface structure', function() {

	it('has a working constructor', function() {
		var t = new Typeface({foo: true, bar: false, baz: 'hello'});

		expect(t.foo).to.be.true;
		expect(t.bar).to.be.false;
		expect(t.baz).to.equal('hello');

		expect(t.components).to.be.an('object');
		expect(t.components).to.be.empty;
		expect(t.characters).to.be.an('object');
		expect(t.characters).to.be.empty;
	});

});