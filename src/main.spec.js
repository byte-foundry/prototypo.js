import fp from './font-builder.js';

var build = fp.build,
	xhr = new XMLHttpRequest(),
	fontSrc;
xhr.open('GET', 'base/mock_font/font.json', false);
xhr.send();

fontSrc = JSON.parse( xhr.responseText );

describe('main', function() {

	var font = build( fontSrc );
	console.log(font);
});