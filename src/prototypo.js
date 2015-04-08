/*jshint -W098 */
var plumin = require('../node_modules/plumin.js/dist/plumin.js'),
	Utils = require('./Utils.js'),
	naive = require('./naive.js');

var paper = plumin.paper;

function splitCursor( cursor ) {
	return cursor.split('.');
}

function parametricFont( src ) {
	var font,
		name,
		glyphSrc,
		glyph;

	// TODO: this, block is only here for backward compat
	// and should be removed at some point in the future
	if ( !src.fontinfo ) {
		src.fontinfo = src.info;
	}

	font = new paper.Font( src.fontinfo );

	font.src = src;

	for ( name in src.glyphs ) {
		glyphSrc = src.glyphs[name];

		Utils.ufoToPaper( glyphSrc );

		// turn ._operation strings to ._updaters functions
		Utils.createUpdaters( glyphSrc, 'glyphs/glyph_' + name );

		glyph = Utils.glyphFromSrc( glyphSrc, src, naive );

		font.addGlyph( glyph );

		// Create additional paths for skeletons and set ._dependencies
		// appropriately
		naive.annotator( glyph );

		glyph.solvingOrder =
			Utils.solveDependencyTree( glyph ).map( splitCursor );
	}

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
		return glyph.update( params, this );
	}, this);
};

/* Update the shape of the glyph, according to formula and parameters
 * 0. before running, nodes have already been created by ParametricFont
 *   (including expanded ones thanks to naive.expandSkeletons). And static
 *   properties have been copied over to those nodes
 * 1. We use the solving order to calculate all node properties
 * // 2. and 3. are now done during 1.
 * // 2. We make sure 'line' types are set on both node of bezier curve,
 * //    when present.
 * //    And we make smooth nodes... smooth.
 * // 3. Calculate the position of handles.
 * 4. transform contours
 * 5. Update components and transform them
 */
paper.PaperScope.prototype.Glyph.prototype.update =
	function( params, font, solvingOrder ) {
		var glyph = this;

		// 1. calculate node properties
		( solvingOrder || glyph.solvingOrder || [] ).forEach(function(cursor) {
			var propName = cursor[ cursor.length - 1 ],
				src = Utils.propFromCursor( cursor, glyph.src ),
				obj = Utils.propFromCursor( cursor, glyph, cursor.length - 1 ),
				// TODO: one day we could allow multiple _updaters
				result = src && src._updaters && src._updaters[0].apply( obj,
					[
						propName, glyph.contours, glyph.anchors,
						glyph.parentAnchors, Utils
					].concat(
						src._parameters.map(function(name) {
							return params[name];
						})
					)
				);

			// Assume that updaters returning undefined have their own
			// assignment logic
			if ( result !== undefined ) {
				obj[propName] = result;
			}
		}, this);

		// 4. transform contours
		this.contours.forEach(function(contour) {
			// a. transform the contour
			// prepare and update outlines and expanded contours, but not
			// skeletons
			if ( contour.transforms ) {
				var matrix = Utils.transformsToMatrix(
							contour.transforms, contour.transformOrigin
						);

				if ( contour.skeleton !== true ) {
					contour.transform( matrix );

				// when dealing with a skeleton, apply transforms only to
				// expanded items
				} else {
					contour.expandedTo.forEach(function( _contour ) {
						_contour.transform( matrix );
					});
				}
			}

			// b. transform the nodes
			contour.nodes.forEach(function(node) {
				if ( node.transforms ) {
					matrix = Utils.transformsToMatrix(
						node.transforms, node.transformOrigin
					);

					if ( contour.skeleton !== true ) {
						node.transform( matrix );

					// when dealing with a skeleton, apply transforms only to
					// expanded items
					} else {
						node.expandedTo.forEach(function( _node ) {
							_node.transform( matrix );
						});
					}
				}
			});
		});

		// 5. TODO: update components and transform components
		this.components.forEach(function(component) {
			component.update(
				params, font, font.glyphMap[component.name].solvingOrder
			);
		});
	};

module.exports = plumin;
