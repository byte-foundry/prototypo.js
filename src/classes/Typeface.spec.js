/*jshint -W030 */

import Typeface from './Typeface.js';

describe('Typeface structure', function() {

	it('has a working constructor', function() {
		var t = new Typeface({foo: true, bar: false, baz: 'hello'});

		expect(t.foo).to.be.true;
		expect(t.bar).to.be.false;
		expect(t.baz).to.equal('hello');

		expect(t.glyphs).to.be.an('object');
		expect(t.glyphs).to.be.empty;
		expect(t.info).to.be.an('object');
		expect(t.info).to.be.empty;
		expect(t.kerning).to.be.an('object');
		expect(t.kerning).to.be.empty;
	});

});