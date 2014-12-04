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

Utils.mergeStatic = function( obj, src ) {
	for ( var i in src ) {
		if ( typeof src[i] !== 'object' ) {
			obj[i] = src[i];
		}
	}
};

// Object.mixin polyfill for IE9+
if ( !global.Object.mixin ) {
	global.Object.mixin = function( target, source ) {
		var props = Object.getOwnPropertyNames(source),
			p,
			descriptor,
			length = props.length;

		for (p = 0; p < length; p++) {
			descriptor = Object.getOwnPropertyDescriptor(source, props[p]);
			Object.defineProperty(target, props[p], descriptor);
		}

		return target;
	};
}

module.exports = Utils;