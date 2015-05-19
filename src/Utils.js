var plumin = require('../node_modules/plumin.js/dist/plumin.js'),
	DepTree = require('../node_modules/deptree/index.js'),
	updateUtils = require('./updateUtils.js'),
	merge = require('lodash.merge');

var paper = plumin.paper,
	Utils = updateUtils,
	_ = { merge: merge };

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
				component.parentAnchors = component.anchor;
				delete component.anchor;
			}
		});

		delete src.outline.component;
	}

	delete src.outline;

	if ( src.lib && src.lib.transformList ) {
		src.transformList = src.lib.transformList;
		delete src.lib.transformList;
	}

	return src;
};

// create Glyph instance and all its child items: anchors, contours
// and components
Utils.glyphFromSrc = function( src, fontSrc, naive, embed ) {
	var glyph = new paper.Glyph({
		name: src.name,
		unicode: src.unicode
	});
	// Clone glyph src to allow altering it without impacnting components srcs.
	glyph.src = _.merge( {}, src );
	Utils.mergeStatic( glyph, glyph.src );

	(glyph.src.anchors || []).forEach(function(anchorSrc) {
		var anchor = new paper.Node();
		anchor.src = anchorSrc;
		Utils.mergeStatic( anchor, anchorSrc );

		glyph.addAnchor( anchor );
	});

	(glyph.src.contours || []).forEach(function(contourSrc) {
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

	if ( !glyph.src.components ) {
		return glyph;
	}

	// components can only be embedded once all glyphs have been generated
	// from source
	glyph.embedComponents = function() {
		glyph.src.components.forEach(function(componentSrc) {
			// components are glyphs, quite simply
			var component = Utils.glyphFromSrc(
					fontSrc.glyphs[componentSrc.base],
					fontSrc,
					naive,
					// components' subcomponents can be embedded immediatly
					true
				);
			naive.annotator( component );
			glyph.addComponent( component );

			(componentSrc.parentAnchors || []).forEach(function(anchorSrc) {
				var anchor = new paper.Node();
				anchor.src = anchorSrc;
				Utils.mergeStatic( anchor, anchorSrc );

				component.addParentAnchor( anchor );
			});
		});

		delete glyph.embedComponents;
	};

	if ( embed ) {
		glyph.embedComponents();
	}

	return glyph;
};

// build a full cursor from arguments
// adds 'contours' and 'nodes' automagically when arguments start with a number
Utils.cursor = function() {
	var cursor = [];

	for ( var i = -1; ++i < arguments.length; ) {
		if ( i === 0 && typeof arguments[0] === 'number' ) {
			cursor.push( 'contours' );
		}
		if ( i === 1 && typeof arguments[0] === 'number' ) {
			cursor.push( 'nodes' );
		}
		cursor.push( arguments[i] );
	}

	return cursor.join('.');
};

Utils.propFromCursor = function( cursor, context, length ) {
	if ( length === undefined ) {
		length = cursor.length;
	}

	for ( var i = -1; ++i < length; ) {
		context = context[ cursor[i] ];
	}

	return context;
};

Utils.mergeStatic = function( obj, src ) {
	for ( var i in src ) {
		if ( typeof src[i] !== 'object' ) {
			obj[i] = src[i];

		// props that have empty dependencies and params are static
		} else if ( src[i]._dependencies && src[i]._dependencies.length === 0 &&
				src[i]._parameters.length === 0 ) {

			obj[i] = src[i]._updaters[0].apply(
				obj,
				[ null, null, null, null, Utils ]
			);

			delete src[i];
		}
	}
};

Utils.createUpdaters = function( leaf, path ) {
	if ( leaf.constructor === Object &&
			( typeof leaf._operation === 'string' ||
			typeof leaf._operation === 'function' ) ) {

		var args = [
					'propName', 'contours', 'anchors', 'parentAnchors', 'Utils'
				]
				.concat( leaf._parameters || [] )
				.concat(
					( typeof leaf._operation === 'string' &&
							leaf._operation.indexOf('return ') === -1 ?
						'return ' : ''
					) +
					// The operation might be wrapped in a function (e.g. multi-
					// line code for debugging purpose). In this case, return
					// must be explicit
					leaf._operation.toString()
						// [\s\S] need to be used instead of . because
						// javascript doesn't have a dotall flag (s)
						.replace(/function\s*\(\)\s*\{([\s\S]*?)\}$/, '$1')
						.trim() +
					// add sourceURL pragma to help debugging
					'\n\n//# sourceURL=' + path
				);

		leaf._updaters = [ Function.apply( null, args ) ];
		return leaf._updaters;
	}

	if ( leaf.constructor === Object ) {
		for ( var i in leaf ) {
			Utils.createUpdaters( leaf[i], path + '.' + i );
		}
	}

	if ( leaf.constructor === Array ) {
		leaf.forEach(function(child, j) {
			Utils.createUpdaters( child, path + '.' + j );
		});
	}
};

Utils.solveDependencyTree = function( glyph ) {
	var depTree = Utils.dependencyTree( glyph.src, null ),
		order = depTree.resolve(),
		simplified = Utils.simplifyResolutionOrder( order );

	return simplified;
};

Utils.dependencyTree = function( parentSrc, cursor, depTree ) {
	if ( !depTree ) {
		depTree = new DepTree();
	}

	Object.keys( parentSrc ).forEach(function( i ) {
		// don't inspect private properties or non-object
		if ( i.indexOf('_') === 0 || typeof parentSrc[i] !== 'object' ) {
			return;
		}

		var leafSrc = parentSrc[i],
			currCursor = cursor ? cursor + '.' + i : i;

		if ( ( leafSrc._updaters && leafSrc._updaters.length ) ||
				( leafSrc._dependencies && leafSrc._dependencies.length ) ) {

			depTree.add( currCursor,
				leafSrc._dependencies.filter(function(dep) {
					// parentAnchors are always here when you need them
					return !/^parentAnchors/.test(dep);
				})
			);
		}

		if ( !leafSrc._operation ) {
			Utils.dependencyTree( leafSrc, currCursor, depTree );
		}
	});

	return depTree;
};

// Simplify resolution order by removing cursors that don't point to objects
// with updater functions
Utils.simplifyResolutionOrder = function( depTree ) {
	// TODO: test + implement this optimization
	return depTree;
};

var rdeg = /deg$/;
Utils.transformsToMatrix = function( transforms, origin ) {
	var prev = new Float32Array(6),
		curr = new Float32Array(6),
		rslt = new Float32Array([ 1, 0, 0, 1, 0, 0 ]);

	if ( origin && Array.isArray( origin ) ) {
		transforms.unshift([ 'translate', origin[0], origin[1] ]);
		transforms.push([ 'translate', -origin[0], -origin[1] ]);

	} else if ( origin ) {
		transforms.unshift([ 'translate', origin.x, origin.y ]);
		transforms.push([ 'translate', -origin.x, -origin.y ]);
	}

	transforms.forEach(function( transform ) {
		curr[0] = curr[3] = 1;
		curr[1] = curr[2] = curr[4] = curr[5] = 0;

		// convert degrees to radian
		for ( var i = 1; i < transform.length; i++ ) {
			if ( transform[i] && typeof transform[i] === 'string' &&
					rdeg.test(transform[i]) ) {
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
			if ( transform[1] === Math.PI / 2 ||
					transform[1] === -Math.PI / 2 ) {
				return rslt;
			}
			curr[2] = Math.tan( transform[1] );
			break;

		case 'skewY':
			transform[1] = transform[1] % ( 2 * Math.PI );
			if ( transform[1] === Math.PI / 2 ||
					transform[1] === -Math.PI / 2 ) {
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
		rslt[1],
		rslt[2],
		rslt[3],
		rslt[4],
		rslt[5]
	);
};

// Utils.normalizeAngle = function( angle ) {
// 	return angle % ( 2 * Math.PI ) + ( angle < 0 ? 2 * Math.PI : 0 );
// };

// Utils.findUpdater = function( glyph, cursor ) {
// 	var steps = [ 'glyph' ].concat( cursor.split('.') ),
// 		context = { glyph: glyph };
//
// 	for ( var i = -1; ++i < steps.length; ) {
// 		context = context[ steps[i] ];
//
// 		if ()
// 	}
// };

// patterns that should be searched for in dependencies and expanded
// This list is expandable by plugins, 'naive' uses this possibility
// hashtag #expandableception
// Utils.expandables = [
// 	[ /\.nodes\.\d+\.point$/, function( dep ) {
// 		dep = dep.replace(/\.point$/, '');
//
// 		return [
// 			dep + '.x',
// 			dep + '.y'
// 		];
// 	} ],
// 	[ /\.nodes\.\d+$/, function( dep ) {
// 		return [
// 			dep + '.x',
// 			dep + '.y',
// 			dep + '.handleIn.point',
// 			dep + '.handleOut.point'
// 		];
// 	} ]
// ];
// Utils.expandDependencies = function( glyphSrc, deps, excludeList ) {
// 	deps = deps.map(function(dep) {
// 		// search for an expandable pattern and... expand the dependency
// 		for ( var i = -1, l = Utils.expandables.length; ++i < l; ) {
// 			if ( Utils.expandables[i][0].test( dep ) ) {
// 				return Utils.expandables[i][1]( dep, glyphSrc );
// 			}
// 		}
//
// 		return dep;
// 	});
//
// 	// flatten deps array and remove items from excludeList
// 	return [].concat.apply([], deps).filter(function(dep) {
// 		return excludeList.indexOf( dep ) === -1;
// 	});
// };

module.exports = Utils;
