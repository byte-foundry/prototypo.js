var DepTree = require('../node_modules/deptree/index.js');

var Utils = {};

Utils.propFromPath = function( _path, glyph, contour ) {
	var context,
		path = _path.split('.');

	path.forEach(function(name) {
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

Utils.createUpdaters = function( branch ) {
	if ( branch.constructor === Object && typeof branch._operation === 'string' ) {
		var args = ['contours', 'anchors', 'parentAnchors', 'Utils']
				.concat( branch._parameters )
				.concat( 'return ' + branch._operation );

		return ( branch._updater = Function.apply( null, args ) );
	}

	if ( branch.constructor === Object ) {
		for ( var i in branch ) {
			Utils.createUpdaters( branch[i] );
		}
	}

	if ( branch.constructor === Array ) {
		branch.forEach(function(subBranch) {
			Utils.createUpdaters( subBranch );
		});
	}
};

// convert the glyph source from the ufo object model to the paper object model
// this is the inverse operation done by jsufonify
Utils.ufoToPaper = function( src ) {
	src.anchors = src.anchor;
	delete src.anchor;

	src.contours = src.outline.contour;
	delete src.outline.contour;

	src.contours.forEach(function(contour) {
		contour.nodes = contour.point;
		delete contour.point;
	});

	src.components = src.outline.component;
	delete src.outline.contour;

	src.transformList = src.lib.transformList;
	delete src.lib.transformList;
};

Utils.updateAttr = function( attr, params, glyph ) {
	var args = [ glyph.contours, glyph.anchors, glyph.parentAnchors, Utils ];
	attr._parameters.forEach(function(name) {
		args.push( params[name] );
	});
	return attr._updater.apply( {}, args );
};

// Utils.updateSelf = function( item, excludeList, params, glyph ) {
// 	var iattr;

// 	for ( i in item.src ) {
// 		attr = item.src[i];

// 		if ( typeof attr === 'object' && attr.updater ) {

// 		}
// 	}

// 	for ( i in toUpdate ) {
// 		item[i] = toUpdate[i];
// 	}
// };

Utils.expandSkeleton = function() {};

Utils.solveDependencyTree = function( leafSrc, path, excludeList ) {
	if ( !excludeList ) {
		excludeList = [];
	}

	var depTree = new DepTree();

	Utils.excludeList( leafSrc, null, excludeList );

	Utils.dependencyTree( leafSrc, null, excludeList, depTree );

	return depTree.resolve();
};

Utils.excludeList = function( leafSrc, path, excludeList ) {
	for ( var i in leafSrc ) {
		var attr = leafSrc[i],
			currPath = path ? path + '.' + i : i;

		if ( typeof attr !== 'object' ) {
			// static props are immediatly available, exclude them from the tree
			excludeList.push( currPath );

		// recurse
		} else if ( !attr._dependencies ) {
			Utils.excludeList( attr, currPath, excludeList );
		}
	}
};

Utils.dependencyTree = function( leafSrc, path, excludeList, depTree ) {
	for ( var i in leafSrc ) {
		var attr = leafSrc[i],
			currPath = path ? path + '.' + i : i;

		if ( typeof attr === 'object' ) {
			// objects with updater functions have dependencies
			if ( attr._dependencies ) {
				var deps = attr._dependencies.filter(function(dep) {
					return excludeList.indexOf( dep ) === -1;
				});
				deps = Utils.expandDependencies( deps );
				depTree.add(currPath, deps);

			// recurse
			} else {
				Utils.dependencyTree( attr, currPath, excludeList, depTree );
			}
		}
	}

	return depTree;
};

var rPoint = /\.point$/,
	rNode = /\.nodes\.\d+$/;
Utils.expandDependencies = function( deps ) {
	deps = deps.map(function(dep) {
		if ( rPoint.test(dep) ) {
			return [
				dep.replace(rPoint, '.x'),
				dep.replace(rPoint, '.y')
			];
		}

		if ( rNode.test(dep) ) {
			return [
				dep + '.x',
				dep + '.y',
				dep + '.expand'
			];
		}

		return dep;
	});

	// flatten deps array
	return [].concat.apply([], deps);
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