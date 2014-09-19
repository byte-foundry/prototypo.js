import Font from './classes/Font.js';
import Glyph from './classes/Glyph.js';

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
			createUpdaters( pointSrc );

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

function createUpdaters( branch ) {
	if ( branch.constructor === Object && typeof branch.operation === 'string' ) {
		var args = ['coutours', 'anchors', 'nodes']
				.concat( branch.parameters )
				.concat( 'return ' + branch.operation );

		return branch.updater = Function.apply( null, args );
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

export default {
	build: builder,
	updater: createUpdaters
};