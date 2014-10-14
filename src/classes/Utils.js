var Utils = {};

Utils.propFromPath = function( _path, glyph, contour ) {
	var context,
		path = _path.split('.');

	path.forEach(name => {
		// init context on first iteration
		if ( !context ) {
			context = name === 'nodes' ? contour : glyph;
		}

		context = context[ name ];
	});

	return context;
};

Utils.lineAngle = function( p0, p1 ) {
	return Math.atan2( p1.y - p0.y, p1.x - p0.x );
};

Utils.createUpdaters = function( branch ) {
	if ( branch.constructor === Object && typeof branch.operation === 'string' ) {
		var args = ['contours', 'anchors', 'parentAnchors', 'nodes', 'Utils']
				.concat( branch.parameters )
				.concat( 'return ' + branch.operation );

		return ( branch.updater = Function.apply( null, args ) );
	}

	if ( branch.constructor === Object ) {
		for ( var i in branch ) {
			Utils.createUpdaters( branch[i] );
		}
	}

	if ( branch.constructor === Array ) {
		branch.forEach(subBranch => Utils.createUpdaters( subBranch ));
	}
};

Utils.mergeStatic = function( obj, src ) {
	for ( var i in src ) {
		if ( typeof src[i] !== 'object' ) {
			obj[i] = src[i];
		}
	}
};

export default Utils;