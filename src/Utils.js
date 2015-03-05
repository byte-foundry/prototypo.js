var plumin = require('../node_modules/plumin.js/dist/plumin.js'),
	paper = plumin.paper,
	DepTree = require('../node_modules/deptree/index.js');

var Utils = {};

// create Glyph instance and all its child items: anchors, contours and components
Utils.glyphFromSrc = function( glyphSrc, fontSrc ) {
	var glyph = new paper.Glyph({
		name: glyphSrc.name,
		unicode: glyphSrc.unicode
	});
	glyph.src = glyphSrc;
	Utils.mergeStatic( glyph, glyphSrc );

	(glyphSrc.anchors || []).forEach(function(anchorSrc) {
		var anchor = new paper.Node();
		anchor.src = anchorSrc;
		Utils.mergeStatic( anchor, anchorSrc );

		glyph.addAnchor( anchor );
	});

	(glyphSrc.contours || []).forEach(function(contourSrc) {
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

	(glyphSrc.components || []).forEach(function(componentSrc) {
		// components are glyphs, quite simply
		var component = Utils.glyphFromSrc( fontSrc.glyphs[componentSrc.base] );
		Utils.naive.expandSkeletons( component );
		glyph.addComponent( component );

		(componentSrc.anchors || []).forEach(function(anchorSrc) {
			var anchor = new paper.Node();
			anchor.src = anchorSrc;
			Utils.mergeStatic( anchor, anchorSrc );

			component.addParentAnchor( anchor );
		});
	});

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

Utils.createUpdaters = function( leaf, path ) {
	if ( leaf.constructor === Object &&
			( typeof leaf._operation === 'string' || typeof leaf._operation === 'function' ) ) {

		var args = ['propName', 'contours', 'anchors', 'parentAnchors', 'Utils']
				.concat( leaf._parameters || [] )
				.concat(
					( typeof leaf._operation === 'string' ?
						'return ' + leaf._operation:
						// In which case is the operation a function?
						// I can't remember, maybe I thought it could be useful someday...
						leaf._operation.toString()
							.replace(/function\s*()\s*\{(.*?)\}$/, '$1').trim()
					) +
					// add sourceURL pragma to help debugging
					'\n\n//# sourceURL=' + path
				);

		return ( leaf._updater = Function.apply( null, args ) );
	}

	if ( leaf.constructor === Object ) {
		for ( var i in leaf ) {
			Utils.createUpdaters( leaf[i], path + '.' + i );
		}
	}

	if ( leaf.constructor === Array ) {
		leaf.forEach(function(child, i) {
			Utils.createUpdaters( child, path + '.' + i );
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

		src.components.forEach(function(component) {
			if ( component.anchor ) {
				component.anchors = component.anchor;
				delete component.anchor;
			}
		});

		delete src.outline.component;
	}

	if ( src.lib && src.lib.transformList ) {
		src.transformList = src.lib.transformList;
		delete src.lib.transformList;
	}
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

		} else if ( attr._dependencies ) {
			// parentAnchors are always here when you need them, #parentingWin
			attr._dependencies.forEach(function(dep) {
				if ( /^parentAnchors/.test(dep) ) {
					excludeList.push( dep );
				}
			});

		// recurse
		} else {
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
				// TODO: do we really need to filter the excluded list here and
				// in expandDependencies? Also, we don't remove duplicates, is
				// that a problem?
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

var rpoint = /\.point$/;
// patterns that should be searched for in dependencies and expanded
// This list is expandable by plugins, 'naive' uses this possibility
// hashtag #expandableception
Utils.expandables = [
	[/\.nodes\.\d+\.point$/, function( dep ) {
		dep = dep.replace(rpoint, '');

		return [
			dep + '.x',
			dep + '.y'
		];
	}],
	[/\.nodes\.\d+$/, function( dep ) {
		return [
			dep + '.x',
			dep + '.y',
			dep + '.expand'
		];
	}]
];
Utils.expandDependencies = function( deps, excludeList ) {
	deps = deps.map(function(dep) {
		// search for an expandable pattern and... expand the dependency
		for ( var i = -1, l = Utils.expandables.length; ++i < l; ) {
			if ( Utils.expandables[i][0].test( dep ) ) {
				return Utils.expandables[i][1]( dep );
			}
		}

		return dep;
	});

	// flatten deps array and remove items from excludeList
	return [].concat.apply([], deps).filter(function(dep) {
		return excludeList.indexOf( dep ) === -1;
	});
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
		a * x + c
	]);
};

Utils.onLine = function( params ) {
	var origin = params.on[0],
		vector = [
			params.on[1].x - params.on[0].x,
			params.on[1].y - params.on[0].y
		];

	return 'x' in params ?
		( params.x - origin.x ) / vector[0] * vector[1] + origin.y:
		( params.y - origin.y ) / vector[1] * vector[0] + origin.x;
};

var rdeg = /deg$/;
Utils.transformsToMatrix = function( transforms, origin ) {
	var prev = new Float32Array(6),
		curr = new Float32Array(6),
		rslt = new Float32Array([1, 0, 0, 1, 0, 0]);

	if ( origin ) {
		transforms.unshift(['translate', origin[0], origin[1]]);
		transforms.push(['translate', -origin[0], -origin[1]]);
	}

	transforms.forEach(function( transform ) {
		curr[0] = curr[3] = 1;
		curr[1] = curr[2] = curr[4] = curr[5] = 0;

		// convert degrees to radian
		for ( var i = 1; i < transform.length; i++ ) {
			if ( transform[i] && typeof transform[i] === 'string' && rdeg.test(transform[i]) ) {
				transform[i] = parseFloat(transform[i]) * ( Math.PI * 2 / 360 );
			}
		}

		switch ( transform[0] ) {
		case 'translateX':
			curr[4] = transform[1];
			break;

		case 'translateY':
			curr[5] = transform[1];
			break;

		case 'translate':
			curr[4] = transform[1];
			curr[5] = transform[2] || 0;
			break;

		case 'rotate':
			curr[0] = Math.cos( transform[1] );
			curr[1] = Math.sin( transform[1] );
			curr[2] = -curr[1];
			curr[3] = curr[0];
			break;

		case 'scaleX':
			curr[0] = transform[1];
			break;

		case 'scaleY':
			curr[3] = transform[1];
			break;

		case 'scale':
			curr[0] = transform[1];
			curr[3] = transform.length > 2 ? transform[2] : transform[1];
			break;

		case 'skewX':
			// stop parsing transform when encountering skewX(90)
			// see http://stackoverflow.com/questions/21094958/how-to-deal-with-infinity-in-a-2d-matrix
			transform[1] = transform[1] % ( 2 * Math.PI );
			if ( transform[1] === Math.PI / 2 || transform[1] === -Math.PI /2 ) {
				return rslt;
			}
			curr[2] = Math.tan( transform[1] );
			break;

		case 'skewY':
			transform[1] = transform[1] % ( 2 * Math.PI );
			if ( transform[1] === Math.PI / 2 || transform[1] === -Math.PI /2 ) {
				return rslt;
			}
			curr[1] = Math.tan( transform[1] );
			break;

		case 'matrix':
			curr[0] = transform[1];
			curr[1] = transform[2];
			curr[2] = transform[3];
			curr[3] = transform[4];
			curr[4] = transform[5];
			curr[5] = transform[6];
			break;
		}

		prev[0] = rslt[0];
		prev[1] = rslt[1];
		prev[2] = rslt[2];
		prev[3] = rslt[3];
		prev[4] = rslt[4];
		prev[5] = rslt[5];

		rslt[0] = prev[0] * curr[0] + prev[2] * curr[1];
		rslt[1] = prev[1] * curr[0] + prev[3] * curr[1];
		rslt[2] = ( prev[0] * curr[2] || 0 ) + prev[2] * curr[3];
		rslt[3] = ( prev[1] * curr[2] || 0 ) + prev[3] * curr[3];
		rslt[4] = prev[0] * curr[4] + prev[2] * curr[5] + prev[4];
		rslt[5] = prev[1] * curr[4] + prev[3] * curr[5] + prev[5];
	});

	return new paper.Matrix(
		rslt[0],
		rslt[2],
		rslt[1],
		rslt[3],
		rslt[4],
		rslt[5]
	);
};

Utils.normalizeAngle = function( angle ) {
	return angle % ( 2 * Math.PI ) + ( angle < 0 ? 2 * Math.PI : 0 );
};

module.exports = Utils;
