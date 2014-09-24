(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		//Allow using this built library as an AMD module
		//in another project. That other project will only
		//see this AMD call, not the internal modules in
		//the closure below.
		define([], factory);
	} else {
		//Browser globals case. Just assign the
		//result to a property on the global.
		root.prototypo = factory();
	}
}(this, function () {

// Object.mixin polyfill for IE9+
if ( !Object.mixin ) {
	Object.mixin = function( target, source ) {
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
