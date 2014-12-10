/*jshint -W098 */
var plumin = require('../node_modules/plumin.js/dist/plumin.js'),
	Utils = require('./Utils.js');

function prototypo( src ) {
	var font = new plumin.Font( src.fontinfo || src.info ), // TODO: src.info is only used for backward compat
		name,
		glyphSrc,
		glyph;

	font.src = src;

	for ( name in src.glyphs ) {
		glyphSrc = src.glyphs[name];
		Utils.ufoToPaper( glyphSrc );
		Utils.createUpdaters( glyphSrc );

		glyph = new plumin.Glyph( glyphSrc );
		glyph.src = glyphSrc;
		Utils.mergeStatic( glyph, glyphSrc );

		font.addGlyph( glyph );

		glyphSrc.anchors.forEach(function(anchorSrc) {
			var anchor = new plumin.Node();
			anchor.src = anchorSrc;
			Utils.mergeStatic( anchor, anchorSrc );

			glyph.addAnchor( anchor );
		});

		glyphSrc.contours.forEach(function(contourSrc) {
			var contour = new plumin.Contour();
			contour.src = contourSrc;
			Utils.mergeStatic( contour, contourSrc );

			glyph.addContour( contour );

			// TODO: handle oncurve/offcurve points
			contourSrc.nodes.forEach(function(nodeSrc) {
				var node = new plumin.Node();
				node.src = nodeSrc;
				Utils.mergeStatic( node, nodeSrc );

				contour.addNode( node );
			});
		});

		Utils.expandSkeletons( glyph );
		Utils.solveDependencyTree( glyph );
	}
}

plumin.Font.prototype.update = function( params, set ) {
	return this.getGlyphSubset( set ).map(function( glyph ) {
		return glyph.update( params, this );
	}, this);
};

plumin.Glyph.prototype.update = function( params /*, font */ ) {
	this.anchors.forEach(function(anchor) {
		anchor.update( params, this );
	}, this);

	this.contours.forEach(function(contour) {
		contour.update( params, this );
	}, this);

	this.components.forEach(function(component) {
		component.update( params, this );
	}, this);

	Utils.updateSelf( this, ['anchors', 'contours', 'components'] );
};

plumin.Contour.prototype.update = function( params, glyph ) {
	this.nodes.forEach(function(node) {
		node.update( params, glyph, this );
	}, this);

	Utils.updateSelf( this, ['nodes'] );
};

Object.mixin( prototypo, plumin );

module.exports = prototypo;