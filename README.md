prototypo.js
============

Font and type-design library with built-in canvas rendering and OTF export.
Based on [paper.js](https://github.com/paperjs/paper.js)'s API and [opentype.js](https://github.com/nodebox/opentype.js) capabilities.

Install
-------

bower install prototypo

Getting started
---------------

	// prototypo fonts are stored in a json formats that follows UFO3 spec (docs pending)
	var fontSrc = require('font.ufo.json'),
		prototypo = require('prototypo');

	font = prototypo( fontSrc );

	// ... and in your code
	typeface.update('string of characters to update');