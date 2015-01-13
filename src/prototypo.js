/*jshint -W098 */
var plumin = require('../node_modules/plumin.js/dist/plumin.js'),
	paper = plumin.paper,
	Utils = require('./Utils.js'),
	naive = require('./naive.js');

function ParametricFont( src ) {
	var fontinfo,
		font,
		name,
		glyphSrc,
		glyph;

	// TODO: this block is only here for backward compat
	// and should be removed at some point in the future
	if ( !src.fontinfo ) {
		src.fontinfo = src.info;
	}

	font = new paper.Font( src.fontinfo );

	font.src = src;

	for ( name in src.glyphs ) {
		glyphSrc = src.glyphs[name];

		Utils.ufoToPaper( glyphSrc );

		Utils.createUpdaters( glyphSrc );

		glyph = Utils.glyphFromSrc( glyphSrc );

		font.addGlyph( glyph );

		naive.expandSkeletons( glyph );

		glyph.solvingOrder = Utils.solveDependencyTree( glyphSrc );
	}

	return font;
}

plumin.ParametricFont = ParametricFont;
plumin.Utils = Utils;
plumin.Utils.naive = naive;

paper.PaperScope.prototype.Font.prototype.update = function( params, set ) {
	return this.getGlyphSubset( set ).map(function( glyph ) {
		return glyph.update( params, this );
	}, this);
};

paper.PaperScope.prototype.Glyph.prototype.update = function( params ) {
	this.solvingOrder.forEach(function(path) {
		Utils.propFromPath( path, this )
			._updater.apply( path,
				[ this.contours, this.anchors, this.parentAnchors, Utils ].concat(
					this._parameters.map(function(name) {
						return params[name];
					})
				)
			);
	}, this);

	this.contours.forEach(function(contour) {
		if ( contour.skeleton !== true ) {
			naive.updateContour( contour, params );
		}
	});
};

module.exports = plumin;