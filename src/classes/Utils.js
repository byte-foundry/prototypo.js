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

Utils.matrixProduct = function( m1, m2, tmp ) {
	if ( !tmp ) {
		tmp = new Float32Array(6);
	}

	// Matrix product (array in column-major order)
	tmp[0] = m1[0] * m2[0] + m1[2] * m2[1];
	tmp[1] = m1[1] * m2[0] + m1[3] * m2[1];
	tmp[2] = m1[0] * m2[2] + m1[2] * m2[3];
	tmp[3] = m1[1] * m2[2] + m1[3] * m2[3];
	tmp[4] = m1[0] * m2[4] + m1[2] * m2[5] + m1[4];
	tmp[5] = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];

	return tmp;
};

export default Utils;