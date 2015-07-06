/*jshint -W098 */
var plumin = require('plumin.js'),
	assign = require('es6-object-assign').assign,
	Utils = require('./Utils.js'),
	naive = require('./naive.js');

var paper = plumin.paper,
	_ = { assign: assign };

function parametricFont( src ) {
	var font = Utils.fontFromSrc( src );

	Object.keys( src.glyphs ).forEach(function( name ) {
		var glyphSrc = src.glyphs[name];

		Utils.ufoToPaper( glyphSrc );

		// turn ._operation strings to ._updaters functions
		Utils.createUpdaters( glyphSrc, 'glyphs/glyph_' + name );

		var glyph = Utils.glyphFromSrc( glyphSrc, src, naive );

		font.addGlyph( glyph );

		// Create additional paths for skeletons and set ._dependencies
		// appropriately
		naive.annotator( glyph );

		// solvingOrder might be already available (if this is a subcomponent,
		// or precomputed in a worker)
		if ( !glyph.solvingOrder ) {
			glyph.solvingOrder = glyphSrc.solvingOrder =
				Utils.solveDependencyTree( glyph );
		}
	});

	// all glyphs are ready, embed components now
	font.glyphs.forEach(function( _glyph ) {
		if ( _glyph.embedComponents ) {
			_glyph.embedComponents();
		}
	});

	return font;
}

plumin.parametricFont = parametricFont;
plumin.Utils = Utils;
plumin.Utils.naive = naive;

paper.PaperScope.prototype.Font.prototype.update = function( params, set ) {
	var font = this,
		matrix;

	Utils.updateParameters( font, params );

	Utils.updateProperties( font, params );

	this.getGlyphSubset( set ).map(function( glyph ) {
		return glyph.update( params );
	}, this);

	if ( font.transforms ) {
		matrix = Utils.transformsToMatrix(
			font.transforms.slice(0), font.transformOrigin
		);

		font.applyMatrix = false;
		font.matrix = matrix;
	}

	return this;
};

/* Update the shape of the glyph, according to formula and parameters
 * 0. before running, nodes have already been created by ParametricFont
 *   (including expanded ones thanks to naive.expandSkeletons). And static
 *   properties have been copied over to those nodes
 * 1. We use the solving order to calculate all node properties
 * 2. transform contours
 * 3. Update components and transform them
 */
paper.PaperScope.prototype.Glyph.prototype.update = function( _params ) {
	var glyph = this,
		font = glyph.parent,
		matrix,
		params;

	// 0. calculate local parameters
	params = _.assign( {}, _params, glyph.parameters, glyph.parentParameters );

	Utils.updateParameters( glyph, params );

	// parentParameters always overwrite glyph parameters. Use aliases
	// (e.g. _width) to let glyph hav the final word
	_.assign( params, glyph.parentParameters );

	// 1. calculate node properties
	Utils.updateProperties( glyph, params );

	// 2. transform contours
	this.contours.forEach(function(contour) {
		// a. transform the nodes
		contour.nodes.forEach(function(node) {
			if ( node.transforms ) {
				matrix = Utils.transformsToMatrix(
					node.transforms.slice(0), node.transformOrigin
				);

				if ( contour.skeleton !== true ) {
					// We don't want to apply the transforms immediatly,
					// otherwise the transformation will add-up on each
					// update.
					node.applyMatrix = false;
					node.matrix = matrix;

				// when dealing with a skeleton, modify only the matrix of
				// expanded items
				} else {
					node.expandedTo.forEach(function( _node ) {
						_node.applyMatrix = false;
						_node.matrix = matrix;
					});
				}
			}
		});

		// b. transform the contour
		// prepare and update outlines and expanded contours, but not
		// skeletons
		if ( contour.transforms ) {
			matrix = Utils.transformsToMatrix(
				contour.transforms.slice(0), contour.transformOrigin
			);

			if ( contour.skeleton !== true ) {
				contour.applyMatrix = false;
				contour.matrix = matrix;

			// when dealing with a skeleton, modify only the matrix of
			// expanded items
			} else {
				contour.expandedTo.forEach(function( _contour ) {
					_contour.applyMatrix = false;
					_contour.matrix = matrix;
				});
			}
		}
	}, this);

	// 3. update components and transform components
	if ( this.components.length && font ) {
		// subcomponents have the parent component as their parent
		// so search for the font
		while ( !('glyphs' in font) ) {
			font = font.parent;
		}

		this.components.forEach(function(component) {
			component.update( params );

			if ( component.transforms ) {
				matrix = Utils.transformsToMatrix(
					component.transforms.slice(0), component.transformOrigin
				);

				component.applyMatrix = false;
				component.matrix = matrix;
			}
		}, this);
	}

	// 4. transform whole glyph
	if ( glyph.transforms ) {
		matrix = Utils.transformsToMatrix(
			glyph.transforms.slice(0), glyph.transformOrigin
		);

		glyph.applyMatrix = false;
		glyph.matrix = matrix;
	}

	return this;
};

// Before updating SVG or OpenType data, we must determine paths exports
// directions. Basically, everything needs to be clockwise.
// this method needs to be called only after the first update
paper.PaperScope.prototype.Outline.prototype.prepareDataUpdate = function() {
	this.children.forEach(function(contour) {
		// expanded contours are handled from their skeleton
		if ( contour.expandedFrom ) {
			return;
		}

		if ( contour.skeleton !== true ) {
			contour.export = 'clockwise';

		} else {
			contour.expandedTo[0].export = 'clockwise';

			if ( contour.expandedTo[1] ) {
				contour.expandedTo[0].export = contour.clockwise ?
					'clockwise' :
					'anticlockwise';

				contour.expandedTo[1].export = contour.clockwise ?
					'anticlockwise' :
					'clockwise';
			}
		}
	});
};

var updateSVGData =
		paper.PaperScope.prototype.Outline.prototype.updateSVGData,
	updateOTCommands =
		paper.PaperScope.prototype.Outline.prototype.updateOTCommands;

paper.PaperScope.prototype.Outline.prototype.updateSVGData = function() {
	if ( !this.isPrepared ) {
		this.prepareDataUpdate();
		this.isPrepared = true;
	}

	updateSVGData.apply( this, arguments );
};

paper.PaperScope.prototype.Outline.prototype.updateOTCommands = function() {
	if ( !this.isPrepared ) {
		this.prepareDataUpdate();
		this.isPrepared = true;
	}

	updateOTCommands.apply( this, arguments );
};

module.exports = plumin;
