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

function builder( src ) {
	var font = new Font(),
		name,
		glyphSrc,
		glyph;

	for ( name in src.glyphs ) {
		glyphSrc = src.glyphs[name];

		glyph = font.addGlyph( name, glyphSrc );

		glyphSrc.anchor &&
		glyphSrc.anchor.forEach(anchorSrc => {
			createUpdaters( anchorSrc );

			glyph.addAnchor({ src: anchorSrc });
		});

		glyphSrc.outline &&
		glyphSrc.outline.contour &&
		glyphSrc.outline.contour.forEach(contourSrc => {
			var contour = glyph.addContour( contourSrc );

			contourSrc.point.forEach(pointSrc => {
				createUpdaters( pointSrc );

				contour.addNode( pointSrc );
			});

			// TODO: check if countour is open or closed
		});
	}

	return font;
}

export default {
	build: builder,
	updater: createUpdaters
};