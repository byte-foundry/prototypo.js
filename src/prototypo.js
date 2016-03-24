/*jshint -W098 */
var plumin = require('plumin.js'),
	assign = require('es6-object-assign').assign,
	Utils = require('./Utils.js'),
	naive = require('./naive.js');

var paper = plumin.paper,
	psProto = paper.PaperScope.prototype,
	_ = { assign: assign };

function parametricFont( src ) {
	var font = Utils.fontFromSrc( src );

	Object.keys( src.glyphs ).forEach(function( name ) {
		var glyphSrc = src.glyphs[name];

		Utils.ufoToPaper( glyphSrc );

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

psProto.Font.prototype.update = function( params, set ) {
	var font = this;

	Utils.updateParameters( font, params );

	// Additionally, we must update the params of indiv group
	Utils.updateIndividualParameters( font, params );

	Utils.updateProperties( font, params );

	Utils.updateXscenderProperties( font, params );

	this.getGlyphSubset( set ).map(function( glyph ) {
		return glyph.update( params );
	}, this);

	// We no longer support font transforms. Transforms should happen at the
	// glyph level, where they can be individualized.

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
psProto.Glyph.prototype.update = function( _params ) {
	var glyph = this,
		font = glyph.parent,
		matrix,
		params;

	// 0. calculate local parameters
	if ( _params['indiv_glyphs'] &&
			Object.keys( _params['indiv_glyphs'] )
				.indexOf( '' + glyph.ot.unicode ) !== -1 ) {

		var indivParam = {};

		Object.keys( _params ).forEach(function( param ) {
			if ( typeof _params[param] === 'number' ) {
				var groups = _params['indiv_group_param'][
						_params['indiv_glyphs'][glyph.ot.unicode]
					],
					multiplier = groups[param + '_rel'] || {
						state: 'relative',
						value: 1
					};

				indivParam[param] = groups[param] ||
					( multiplier.state === 'relative' ?
						(multiplier.value * _params[param]) :
						(multiplier.value + _params[param])
					);
			}
		});

		params = _.assign( {}, _params, indivParam, glyph.parentParameters );
	} else {
		params = _.assign( {}, _params, glyph.parentParameters );
	}

	Utils.updateParameters( glyph, params );

	// parentParameters always overwrite glyph parameters. Use aliases
	// (e.g. _width) to let glyph have the final word
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
					node.transform(matrix);

				// when dealing with a skeleton, modify only the matrix of
				// expanded items
				} else {
					node.expandedTo.forEach(function( _node ) {
						_node.transform(matrix);
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
				// We don't want to apply the transforms immediatly on contours,
				// otherwise the transformation will add-up on each update.
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
// this method needs to be called only after the first update, otherwise the
// directions won't be known
psProto.Outline.prototype.prepareDataUpdate = function() {
	if ( this.isPrepared ) {
		return;
	}

	this.children.forEach(function(contour) {
		// expanded contours are handled from their skeleton
		if ( contour.expandedFrom ) {
			return;
		}

		if ( contour.skeleton !== true ) {
			contour.exportReversed = !contour.isClockwise();

		} else if ( !contour.expandedTo[1] ) {
			contour.expandedTo[0].exportReversed =
				!contour.expandedTo[0].isClockwise();

		} else {
			var isClockwise = contour.isClockwise();

			contour.expandedTo[0].exportReversed = !isClockwise;
			contour.expandedTo[1].exportReversed = !isClockwise;
		}
	});

	this.isPrepared = true;
};

// for the following plumin methods, the outline must be prepared beforehand
// to be usable in prototypo.js
[ 'updateSVGData', 'updateOTCommands', 'combineTo' ].forEach(function(name) {
	var method = paper.PaperScope.prototype.Outline.prototype[ name ];

	psProto.Outline.prototype[ name ] = function() {
		if ( !this.isPrepared ) {
			this.prepareDataUpdate();
			this.isPrepared = true;
		}

		return method.apply( this, arguments );
	};
});

module.exports = plumin;
