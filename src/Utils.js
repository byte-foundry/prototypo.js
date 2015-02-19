var plumin = require('../node_modules/plumin.js/dist/plumin.js'),
	paper = plumin.paper,
	DepTree = require('../node_modules/deptree/index.js');

var Utils = {};

// create Glyph instance and all its child items: anchors, contours and components
Utils.glyphFromSrc = function( glyphSrc ) {
	var glyph = new paper.Glyph({
		name: glyphSrc.name,
		unicode: glyphSrc.unicode
	});
	glyph.src = glyphSrc;
	Utils.mergeStatic( glyph, glyphSrc );

	if ( glyphSrc.anchors ) {
		glyphSrc.anchors.forEach(function(anchorSrc) {
			var anchor = new paper.Node();
			anchor.src = anchorSrc;
			Utils.mergeStatic( anchor, anchorSrc );

			glyph.addAnchor( anchor );
		});
	}

	if ( glyphSrc.contours ) {
		glyphSrc.contours.forEach(function(contourSrc) {
			var contour = new paper.Path();
			contour.src = contourSrc;
			Utils.mergeStatic( contour, contourSrc );

			glyph.addContour( contour );

			// TODO: handle oncurve/offcurve points
			contourSrc.nodes.forEach(function(nodeSrc) {
				var node = new paper.Node();
				node.src = nodeSrc;
				Utils.mergeStatic( node, nodeSrc );

				contour.add( node );
			});
		});
	}

	return glyph;
};

Utils.propFromPath = function( path, length, context ) {
	for ( var i = -1; ++i < length; ) {
		context = context[ path[i] ];
	}

	return context;
};

Utils.mergeStatic = function( obj, src ) {
	for ( var i in src ) {
		if ( typeof src[i] !== 'object' ) {
			obj[i] = src[i];
		}
	}
};

Utils.createUpdaters = function( leaf ) {
	if ( leaf.constructor === Object &&
			( typeof leaf._operation === 'string' || typeof leaf._operation === 'function' ) ) {

		var args = ['propName', 'contours', 'anchors', 'parentAnchors', 'Utils']
				.concat( leaf._parameters || [] )
				.concat( typeof leaf._operation === 'string' ?
					'return ' + leaf._operation:
					leaf._operation.toString()
						.replace(/function\s*()\s*\{(.*?)\}$/, '$1').trim()
				);

		return ( leaf._updater = Function.apply( null, args ) );
	}

	if ( leaf.constructor === Object ) {
		for ( var i in leaf ) {
			Utils.createUpdaters( leaf[i] );
		}
	}

	if ( leaf.constructor === Array ) {
		leaf.forEach(function(child) {
			Utils.createUpdaters( child );
		});
	}
};

// convert the glyph source from the ufo object model to the paper object model
// this is the inverse operation done by jsufonify
Utils.ufoToPaper = function( src ) {
	if ( src.anchor ) {
		src.anchors = src.anchor;
		delete src.anchor;
	}

	if ( src.outline && src.outline.contour ) {
		src.contours = src.outline.contour;
		delete src.outline.contour;
	}

	src.contours.forEach(function(contour) {
		if ( contour.point ) {
			contour.nodes = contour.point;
			delete contour.point;
		}
	});

	if ( src.outline && src.outline.component ) {
		src.components = src.outline.component;
		delete src.outline.contour;
	}

	if ( src.lib && src.lib.transformList ) {
		src.transformList = src.lib.transformList;
		delete src.lib.transformList;
	}
};

// Useless right now, we do it in Glyph.prototype.update in prototypo.js
Utils.updateAttr = function( attr, params, glyph ) {
	var args = [ glyph.contours, glyph.anchors, glyph.parentAnchors, Utils ];
	( attr._parameters || [] ).forEach(function(name) {
		args.push( params[name] );
	});
	return attr._updater.apply( {}, args );
};

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
		} else if ( !attr._dependencies && !attr._operation ) {
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
				deps = Utils.expandDependencies( deps, excludeList );
				depTree.add(currPath, deps);
			}

			if ( !attr._dependencies && !attr._operation ) {
				Utils.dependencyTree( attr, currPath, excludeList, depTree );
			}
		}
	}

	return depTree;
};

var rpoint = /\.point$/,
	rnode = /\.nodes\.\d+$/;
Utils.expandDependencies = function( deps, excludeList ) {
	deps = deps.map(function(dep) {
		var deps;

		if ( rpoint.test(dep) ) {
			dep = dep.replace(rpoint, '');

			deps = [
				dep + '.x',
				dep + '.y'
			];

		} else if ( rnode.test(dep) ) {
			deps = [
				dep + '.x',
				dep + '.y',
				dep + '.expand'
			];

		} else {
			return dep;
		}

		return deps.filter(function(dep) {
			return excludeList.indexOf( dep ) === -1;
		});
	});

	// flatten deps array
	return [].concat.apply([], deps);
};

// The following function should be useless, thanks to paper
Utils.lineLineIntersection = function( p1, p2, p3, p4 ) {
	var x1 = p1.x,
		y1 = p1.y,
		x2 = p2.x,
		y2 = p2.y,
		x3 = p3.x,
		y3 = p3.y,
		x4 = p4.x,
		y4 = p4.y,
		d = (x1-x2) * (y3-y4) - (y1-y2) * (x3-x4);

	if ( d === 0 ) {
		return null;
	}

	return new Float32Array([
		( (x1*y2 - y1*x2) * (x3-x4) - (x1-x2) * (x3*y4 - y3*x4) ) / d,
		( (x1*y2 - y1*x2) * (y3-y4) - (y1-y2) * (x3*y4 - y3*x4) ) / d
	]);
};

// Find the intersection of two rays.
// A ray is defined by a point and an angle.
Utils.rayRayIntersection = function( p1, a1, p2, a2 ) {
	// line equations
	var a = Math.tan(a1),
		b = Math.tan(a2),
		c = p1.y - a * p1.x,
		d = p2.y - b * p2.x,
		x,
		y;

	// When searching for lines intersection,
	// angles can be normalized to 0 < a < PI
	// This will be helpful in detecting special cases below.
	a1 = a1 % Math.PI;
	if ( a1 < 0 ) {
		a1 += Math.PI;
	}
	a2 = a2 % Math.PI;
	if ( a2 < 0 ) {
		a2 += Math.PI;
	}

	// no intersection
	if ( a1 === a2 ) {
		return null;
	}

	// Optimize frequent and easy special cases.
	// Without optimization, results would be incorrect when cos(a) === 0
	if ( a1 === 0 ) {
		y = p1.y;
	} else if ( a1 === Math.PI / 2 ) {
		x = p1.x;
	}
	if ( a2 === 0 ) {
		y = p2.y;
	} else if ( a2 === Math.PI / 2 ) {
		x = p2.x;
	}

	// easiest case
	if ( x !== undefined && y !== undefined ) {
		return new Float32Array([ x, y ]);
	}

	// other cases that can be optimized
	if ( a1 === 0 ) {
		return new Float32Array([ ( y - d ) / b, y ]);
	}
	if ( a1 === Math.PI / 2 ) {
		return new Float32Array([ x, b * x + d ]);
	}
	if ( a2 === 0 ) {
		return new Float32Array([ ( y - c ) / a, y ]);
	}
	if ( a2 === Math.PI / 2 ) {
		return new Float32Array([ x, a * x + c ]);
	}

	// intersection from two line equations
	// algo: http://en.wikipedia.org/wiki/Line–line_intersection#Given_the_equations_of_the_lines
	return new Float32Array([
		x = (d - c) / (a - b),
		// this should work equally well with ax+c or bx+d
		y = a * x + c
	]);
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
			try {
				Object.defineProperty(target, props[p], descriptor);
			} catch (e) {
				// in node, some properties cannot be redefiend and we're ok with it
			}
		}

		return target;
	};
}

module.exports = Utils;