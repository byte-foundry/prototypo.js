var xhr = new XMLHttpRequest(),
	fontSrc;
xhr.open('GET', 'base/mock_font/font.json', false);
xhr.send();
fontSrc = JSON.parse( xhr.responseText );

import fp from './font-builder.js';
var build = fp.build,
	updater = fp.updater;

describe('font parser', function() {

	var font = build( fontSrc );

	it('sets appropriate type to objects', function() {
		expect(font.glyphs.test0.type).to.be.equal('test');
		expect(font.glyphs.test0.contours[0].type).to.be.equal('open');
		expect(font.glyphs.test0.contours[0].nodes[0].type).to.be.equal('smooth');
	});

	it('can create an updater from an operation object', function() {
		var up = updater({
			operation: 'thickness * contrast',
			parameters: ['thickness', 'contrast'],
			dependencies: []
		});

		expect(up).to.be.instanceof(Function);
		expect(up( {}, {}, {}, 2, 3 )).to.be.equal(6);
	});
});
