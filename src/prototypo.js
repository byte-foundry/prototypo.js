/*jshint -W098 */
var plumin = require('../node_modules/plumin/dist/plumin.js'),
	Utils = require('./Utils.js');

function prototypo( src ) {
	var font = new plumin.Font( src.fontinfo ),
		name,
		glyphSrc,
		glyph;

	font.src = src;

	for ( name in src.glyphs ) {
		glyphSrc = src.glyphs[name];

		glyph = new plumin.Glyph( glyphSrc );
		glyph.src = glyphSrc;
		Utils.mergeStatic( glyph, glyphSrc );

		font.addGlyph( glyph );

		glyphSrc.anchor.forEach(function(anchorSrc) {
			var anchor = new plumin.Node();
			anchor.src = anchorSrc;
			Utils.mergeStatic( anchor, anchorSrc );
		});

		glyphSrc.outline.contour.forEach(function(contourSrc) {
			var contour = new plumin.Contour();
			contour.src = contourSrc;
			Utils.mergeStatic( contour, contourSrc );

			// TODO: handle oncurve/offcurve points
			contourSrc.point.forEach(function(nodeSrc) {
				var node = new plumin.Node();
				node.src = nodeSrc;
				Utils.mergeStatic( node, nodeSrc );
			});
		});
	}
}

Object.mixin( prototypo, plumin );

module.exports = prototypo;