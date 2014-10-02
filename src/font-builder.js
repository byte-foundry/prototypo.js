// TODO: without this flag, it seems that jshint doesn't like arrow functions.
// Find out what the real problem is
/*jshint -W030 */

import Font from './classes/Font.js';
// import Glyph from './classes/Glyph.js';

function createUpdaters( branch ) {
	if ( branch.constructor === Object && typeof branch.operation === 'string' ) {
		var args = ['coutours', 'anchors', 'nodes']
				.concat( branch.parameters )
				.concat( 'return ' + branch.operation );

		return ( branch.updater = Function.apply( null, args ) );
	}

	if ( branch.constructor === Object ) {
		for ( var i in branch ) {
			createUpdaters( branch[i] );
		}
	}

	if ( branch.constructor === Array ) {
		branch.forEach(subBranch => createUpdaters( subBranch ));
	}
}

function init( obj, src ) {
	for ( var i in src ) {
		if ( typeof src[i] !== 'object' ) {
			obj[i] = src[i];
		}
	}
}

function builder( fontSrc ) {
	var font = new Font({ src: fontSrc }),
		name,
		glyphSrc,
		glyph;

	for ( name in fontSrc.glyphs ) {
		glyphSrc = fontSrc.glyphs[name];

		glyph = font.addGlyph( name, { src: glyphSrc });
		init( glyph, glyphSrc );

		glyphSrc.anchor &&
		glyphSrc.anchor.forEach(anchorSrc => {
			createUpdaters( anchorSrc );

			var anchor = glyph.addAnchor({ src: anchorSrc });
			init( anchor, anchorSrc );
		});

		glyphSrc.outline &&
		glyphSrc.outline.contour &&
		glyphSrc.outline.contour.forEach(contourSrc => {
			var contour = glyph.addContour({ src: contourSrc });
			init( contour, contourSrc );

			contourSrc.point.forEach(pointSrc => {
				createUpdaters( pointSrc );

				var node = contour.addNode({ src: pointSrc });
				init( node, pointSrc );
			});
		});
	}

	return font;
}

export default {
	init: init,
	build: builder,
	updater: createUpdaters
};
