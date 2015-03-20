/*jshint -W098 */
var plumin = require('../node_modules/plumin.js/dist/plumin.js'),
	Utils = require('./Utils.js'),
	naive = require('./naive.js');

var paper = plumin.paper;

function ParametricFont( src ) {
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

		Utils.createUpdaters( glyphSrc, 'glyphs/glyph_' + name );

		glyph = Utils.glyphFromSrc( glyphSrc, src );

		font.addGlyph( glyph );

		naive.expandSkeletons( glyph );

		glyph.solvingOrder = Utils.solveDependencyTree( glyphSrc )
			.map(function(path) {
				return path.split('.');
			});
	}

	// all glyphs are ready, embed components now
	font.glyphs.forEach(function( _glyph ) {
		if ( _glyph.embedComponents ) {
			_glyph.embedComponents();
		}
	});

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

/* Update the shape of the glyph, according to formula and parameters
 * 0. before running, nodes have already been created by ParametricFont
 *   (including expanded ones thanks to naive.expandSkeletons). And static
 *   properties have been copied over to those nodes
 * 1. We use the solving order to calculate all node properties except
 *    handle positions.
 * 2. We make sure 'line' types are set on both node of bezier curve,
 *    when present.
 *    And we make smooth nodes... smooth.
 * 3. Calculate the position of handles.
 * 4. transform contours
 * 5. Update components and transform them
 */
paper.PaperScope.prototype.Glyph.prototype.update =
	function( params, font, solvingOrder ) {
		// 1. calculate node properties
		( solvingOrder || this.solvingOrder || [] ).forEach(function(path) {
			var propName = path[path.length - 1],
				src = Utils.propFromPath( path, path.length, this.src ),
				obj = Utils.propFromPath( path, path.length - 1, this ),
				result = src && src._updater.apply( obj,
					[
						propName, this.contours, this.anchors,
						this.parentAnchors, Utils
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

		this.contours.forEach(function(contour) {
			// prepare and update outlines and expanded contours, but not
			// skeletons
			if ( contour.skeleton !== true ) {
				// Previously prepareContour was only executed on outlines and
				// skeletons but not on expanded contours.
				// I have no idea why but I might rediscover it later.
				// TODO: it might be possible to do 2. and 3. at the same time

				// 2. check 'line' curves and smooth nodes
				naive.prepareContour( contour );
				// 3. calculate the position of handles
				naive.updateContour( contour, params );
			}
		});

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
