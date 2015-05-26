/*jshint -W098 */
var plumin = require('../node_modules/plumin.js/dist/plumin.js'),
	Utils = require('./Utils.js'),
	naive = require('./naive.js'),
	merge = require('lodash.merge');

var paper = plumin.paper,
	_ = { merge: merge };

function parametricFont( src ) {
	// TODO: this, block is only here for backward compat
	// and should be removed at some point in the future
	if ( !src.fontinfo ) {
		src.fontinfo = src.info;
	}

	var font = new paper.Font( src.fontinfo );

	font.src = src;

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

		glyph.solvingOrder =
			Utils.solveDependencyTree( glyph ).map(function( cursor ) {
				return cursor.split('.');
			});
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
	return this.getGlyphSubset( set ).map(function( glyph ) {
		return glyph.update( params );
	}, this);
};

/* Update the shape of the glyph, according to formula and parameters
 * 0. before running, nodes have already been created by ParametricFont
 *   (including expanded ones thanks to naive.expandSkeletons). And static
 *   properties have been copied over to those nodes
 * 1. We use the solving order to calculate all node properties
 * 2. transform contours
 * 3. Update components and transform them
 */
paper.PaperScope.prototype.Glyph.prototype.update =
	function( _params, solvingOrder ) {
		var glyph = this,
			font = glyph.parent,
			matrix,
			params;

		// 0. calculate local parameters
		params = _.merge( {}, _params, glyph.parentParameters );

		Object.keys( ( glyph.src && glyph.src.parameters ) || [] )
			.forEach(function( name ) {
				var src = glyph.src.parameters[name];

				if ( src._updaters ) {
					params[name] = src._updaters[0].apply( null, [
						name, [], [], glyph.parentAnchors, Utils
					].concat(
						( src._parameters || [] ).map(function(_name) {
							return params[_name];
						})
					));
				}
			});

		// 1. calculate node properties
		( solvingOrder || glyph.solvingOrder || [] ).forEach(function(cursor) {
			var propName = cursor[ cursor.length - 1 ],
				src = Utils.propFromCursor( cursor, glyph.src ),
				obj = Utils.propFromCursor( cursor, glyph, cursor.length - 1 ),
				// TODO: one day we could allow multiple _updaters
				result = src && src._updaters && src._updaters[0].apply( obj, [
						propName, glyph.contours, glyph.anchors,
						glyph.parentAnchors, Utils
					].concat(
						( src._parameters || [] ).map(function(_name) {
							return params[_name];
						})
					)
				);

			// Assume that updaters returning undefined have their own
			// assignment logic
			if ( result !== undefined ) {
				obj[propName] = result;
			}
		}, this);

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
				component.update(
					params, font.glyphMap[component.name].solvingOrder
				);

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
	};

module.exports = plumin;
