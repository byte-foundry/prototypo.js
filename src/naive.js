var plumin = require('../node_modules/plumin.js/dist/plumin.js'),
	Utils = require('./Utils.js'),
	merge = require('lodash.merge');

var paper = plumin.paper,
	naive = {},
	_ = { merge: merge };

function autoExpandedNodeSrc( node, i, j, side, isClosed ) {
	return {
		point: {
			_dependencies: [
				Utils.cursor( i, j, 'x' ),
				Utils.cursor( i, j, 'y' ),
				Utils.cursor( i, j, 'expand' )
			],
			_parameters: [ 'width' ],
			_updaters: [ function() {
				var width = arguments[
						arguments.length - 1
					];

				naive.expandedNodeUpdater(
					node.expandedTo[side], side === 0, width
				);

				naive.skeletonCopier( node );
			} ]
		},
		_dependencies: [
			Utils.cursor( 'contours', i, 'expandedTo',
				( isClosed ? side : 0 ), 'points' )
		]
	};
}

function explicitExpandedNodeSrc( i, j, side, isClosed ) {
	return {
		point: {
			_dependencies: [
				Utils.cursor( i, j, 'expandedTo', side, 'x' ),
				Utils.cursor( i, j, 'expandedTo', side, 'y' )
			]
		},
		_dependencies: [
			Utils.cursor( 'contours', i, 'expandedTo',
				( isClosed ? side : 0 ), 'points' )
		]
	};
}

function expandedContourSrc( contour, i, side, nodesSrc ) {
	return {
		points: {
			_dependencies: contour.nodes.map(function(node, j) {
				return Utils.cursor(
					'contours', i, 'expandedTo', side, 'nodes', j, 'point'
				);
			}),
			_parameters: [ 'curviness' ],
			_updaters: [ function() {
				var curviness = arguments[ arguments.length - 1 ];

				naive.prepareContour( contour );
				naive.updateContour( contour, curviness );
			} ]
		},
		nodes: nodesSrc,
		_dependencies: [
			Utils.cursor( 'contours', i, 'expandedTo', side, 'points' )
		]
	};
}

function nodeSrc( i, j ) {
	return {
		point: {
			_dependencies: [
				Utils.cursor( i, j, 'x' ),
				Utils.cursor( i, j, 'y' )
			]
		},
		_dependencies: [
			Utils.cursor( 'contours', i, 'points' )
		]
	};
}

function contourSrc( contour, i ) {
	return {
		points: {
			_dependencies: contour.nodes.map(function( node, j ) {
				return Utils.cursor( i, j, 'point' );
			}),
			_parameters: [ 'curviness' ],
			_updaters: [ function() {
				var curviness = arguments[ arguments.length - 1 ];

				naive.prepareContour( contour );
				naive.updateContour( contour, curviness );
			} ]
		},
		_dependencies: contour.nodes.map(function( node, j ) {
			return Utils.cursor( i, j );
		})
	};
}

// default method to expand skeletons:
// derives two additional node from every node with an .expand object
naive.annotator = function( glyph ) {
	var additionalContours = [];

	glyph.contours.forEach(function( contour, i ) {
		if ( contour.skeleton !== true ) {
			// annotate nodes+points that aren't in a skeleton
			contour.nodes.forEach(function( node, j ) {
				_.merge( node.src, nodeSrc( i, j ) );
			});

			_.merge( contour.src, contourSrc( contour, i ) );

			return;
		}

		var leftContour,
			rightContour,
			leftNodes = [],
			rightNodes = [],
			leftNodesSrc = [],
			rightNodesSrc = [],
			firstNode,
			lastNode;

		// skeletons should be hidden
		contour.visible = false;

		contour.nodes.forEach(function( node, j ) {
			var left = new paper.Node(),
				right = new paper.Node();

			leftNodes.push(left);
			rightNodes.unshift(right);
			node.expandedTo = [ left, right ];
			left.expandedFrom = right.expandedFrom = node;

			if ( !node.src.expandedTo ) {
				// annotate nodes+points that are automatically expanded
				leftNodesSrc.push(
					autoExpandedNodeSrc( node, i, j, 0, contour.closed )
				);
				rightNodesSrc.push(
					autoExpandedNodeSrc( node, i, j, 1, contour.closed )
				);
				// node.src.expandedTo = [
				// 	autoExpandedNodeSrc( node, i, j, 0, contour.closed ),
				// 	autoExpandedNodeSrc( node, i, j, 1, contour.closed )
				// ];

			// the expanded node might have been defined explicitely
			} else if ( node.src.expandedTo[0] &&
					!node.src.expandedTo[0]._updaters ) {
				node.src.expandedTo.forEach(function( src, k ) {
					Utils.mergeStatic( node.expandedTo[k], src );
				});

				// annotate nodes+points that are explicitely expanded
				_.merge( node.src.expandedTo[0],
					explicitExpandedNodeSrc( i, j, 0, contour.closed )
				);
				_.merge( node.src.expandedTo[1],
					explicitExpandedNodeSrc( i, j, 1, contour.closed )
				);

				// There should never be two ways to access a source leaf,
				// otherwise this might introduce redundant operations in the
				// solving order and all dependencies will be a lot harder to
				// represent mentally.
				// Move them to the appropriate *NodesSrc so that node sources
				// in the glyph source tree are only accessible from contours
				// and expanded contours, not from expanded nodes.
				leftNodesSrc.push( node.src.expandedTo[0] );
				rightNodesSrc.push( node.src.expandedTo[1] );
				delete node.src.expandedTo;
			}
		});

		if ( !contour.expandedTo && !contour.closed ) {
			leftContour = new paper.Path({
				closed: true,
				segments: leftNodes.concat(rightNodes)
			});
			contour.expandedTo = [ leftContour ];
			contour.src.expandedTo = [
				expandedContourSrc( leftContour, i, 0,
					leftNodesSrc.concat( rightNodesSrc )
				)
			];
			leftContour.expandedFrom = contour;
			additionalContours.push( leftContour );

			firstNode = contour.firstNode;
			lastNode = contour.lastNode;

			firstNode.type = 'corner';
			lastNode.type = 'corner';

			firstNode.expandedTo[0].type = 'corner';
			firstNode.expandedTo[1].type = 'corner';
			lastNode.expandedTo[0].type = 'corner';
			lastNode.expandedTo[1].type = 'corner';

			firstNode.expandedTo[0].typeIn = 'line';
			firstNode.expandedTo[1].typeOut = 'line';
			lastNode.expandedTo[0].typeOut = 'line';
			lastNode.expandedTo[1].typeIn = 'line';

		} else if ( !contour.expandedTo && contour.closed ) {
			leftContour = new paper.Path({
				closed: true,
				segments: leftNodes
			});
			additionalContours.push( leftContour );
			rightContour = new paper.Path({
				closed: true,
				segments: rightNodes
			});
			additionalContours.push( rightContour );

			contour.expandedTo = [
				leftContour,
				rightContour
			];
			contour.src.expandedTo = [
				expandedContourSrc( leftContour, i, 0, leftNodesSrc ),
				expandedContourSrc( rightContour, i, 1, rightNodesSrc )
			];
			leftContour.expandedFrom = rightContour.expandedFrom = contour;
		}
	});

	glyph.addContours( additionalContours );
};

// Calculate expanded node position
naive.expandedNodeUpdater = function( node, isLeft, _width ) {
	var origin = node.expandedFrom,
		expand = origin.expand,
		width = expand && expand.width !== undefined ?
			expand.width : _width,
		coef = expand && expand.distr !== undefined ?
			( isLeft ? expand.distr : 1 - expand.distr ) :
			0.5,
		angle = ( isLeft ? Math.PI : 0 ) +
			( expand && expand.angle !== undefined ?
				expand.angle :
				// We resort to using directions.
				// This is wrong, directions are not included in the
				// dependencies of the updater and might not be ready yet.
				// TODO: Fix this (always require angle to be specified?)
				( origin._dirOut !== undefined ?
					origin._dirOut - Math.PI / 2 :
					origin._dirIn + Math.PI / 2
				)
			);

	// position
	node.point.x = origin.point.x + ( width * coef * Math.cos( angle ) );
	node.point.y = origin.point.y + ( width * coef * Math.sin( angle ) );
};

// copy skeleton properties such as types, directions and tensions to expanded
// nodes
naive.skeletonCopier = function( node ) {
	var angle = node.expand && node.expand.angle || 0,
		left = node.expandedTo[0],
		right = node.expandedTo[1];

	// node type
	if ( node.type !== undefined ) {
		left.type = right.type = node.type;
	}

	// direction type
	if ( node.typeIn !== undefined ) {
		left.typeIn = right.typeOut = node.typeIn;
	}
	if ( node.typeOut !== undefined ) {
		left.typeOut = right.typeIn = node.typeOut;
	}

	// direction
	if ( node._dirIn !== undefined ) {
		left._dirIn = right._dirOut = node._dirIn;

		if ( node.type === 'smooth' && node._dirOut === undefined ) {
			left._dirOut = right._dirIn = node._dirIn + Math.PI;
		}
	}
	if ( node._dirOut !== undefined ) {
		left._dirOut = right._dirIn = node._dirOut;

		if ( node.type === 'smooth' && node._dirIn === undefined ) {
			left._dirIn = right._dirOut = node._dirOut + Math.PI;
		}
	}
	// use angle if direction isn't already defined
	if ( left._dirIn === undefined ) { // implies right._dirOut === undefined
		left._dirIn = angle - Math.PI / 2;
		right._dirOut = angle + Math.PI / 2;
	}
	if ( left._dirOut === undefined ) { // implies right._dirIn === undefined
		left._dirOut = angle + Math.PI / 2;
		right._dirIn = angle - Math.PI / 2;
	}

	// tension
	left.tensionIn = right.tensionOut = node.tensionIn !== undefined ?
		node.tensionIn :
		( node.tension !== undefined ? node.tension : 1 );
	left.tensionOut = right.tensionIn = node.tensionOut !== undefined ?
		node.tensionOut :
		( node.tension !== undefined ? node.tension : 1 );
};

// Make sure 'line' types are set on both side of segments
// and if a smooth node is used in a straight segment, update the directions
// appropriately this can only be done once the types, directions and position
// of all nodes have been updated can be renamed #prepareLines if no other
// operation is added
// TODO: try doing it at the same time as updateContour (once we have more
// complex glyphs)
naive.prepareContour = function( path ) {
	path.nodes.forEach(function(node) {
		if ( node.typeIn === 'line' && node.previous ) {
			node.previous.typeOut = 'line';

			if ( node.type === 'smooth' ) {
				node._dirIn = Utils.lineAngle(
					node.point, node.previous.point
				);
				node._dirOut = node._dirIn + Math.PI;
			}
		}

		if ( node.typeOut === 'line' && node.next ) {
			node.next.typeIn = 'line';

			if ( node.type === 'smooth' ) {
				node._dirOut = Utils.lineAngle(
					node.point, node.next.point
				);
				node._dirIn = node._dirOut + Math.PI;
			}
		}
	});
};

// sets the position of control points
// can be renamed #updateControls if no other operation is added
naive.updateContour = function( path, curviness ) {
	if ( curviness === undefined ) {
		curviness = 2 / 3;
	}

	path.nodes.forEach(function(node) {
		var start = node,
			end,
			startCtrl,
			endCtrl,
			startType,
			endType,
			startTension,
			endTension,
			startDir,
			endDir,
			rri;

		if ( !node.next ) {
			return;
		}

		end = node.next;
		startCtrl = start.handleOut;
		endCtrl = end.handleIn;

		startType = start.typeOut;
		endType = end.typeIn;

		if ( startType === 'line' || endType === 'line' ) {
			startCtrl.x = 0;
			startCtrl.y = 0;
			endCtrl.x = 0;
			endCtrl.y = 0;

			return;
		}

		startTension = start.tensionOut !== undefined ?
			start.tensionOut :
			( start.tension !== undefined ? start.tension : 1 );
		endTension = end.tensionIn !== undefined ?
			end.tensionIn :
			( end.tension !== undefined ? end.tension : 1 );

		startDir = start._dirOut !== undefined ?
			start._dirOut :
			start.type === 'smooth' ? start._dirIn + Math.PI : 0;
		endDir = end._dirIn !== undefined ?
			end._dirIn :
			end.type === 'smooth' ? end._dirOut - Math.PI : 0;

		rri = Utils.rayRayIntersection(
			start._point,
			startDir,
			end._point,
			endDir
		);

		// direction of handles is parallel
		if ( rri === null ) {
			var angle = Utils.lineAngle( start._point, end._point ),
				middle = {
					x: Math.abs( start._point.x - end._point.x ) / 2 +
						start._point.x,
					y: Math.abs( start._point.y - end._point.y ) / 2 +
						start._point.y
				},
				p0 = Utils.rayRayIntersection(
					start._point, startDir, middle, angle - Math.PI / 2
				),
				p1 = Utils.rayRayIntersection(
					middle, angle + Math.PI / 2, end._point, endDir
				);

			startCtrl.x = ( Math.round(p0[0]) - start._point.x ) *
				curviness * startTension;
			startCtrl.y = ( Math.round(p0[1]) - start._point.y ) *
				curviness * startTension;
			endCtrl.x = ( Math.round(p1[0]) - end._point.x ) *
				curviness * endTension;
			endCtrl.y = ( Math.round(p1[1]) - end._point.y ) *
				curviness * endTension;

			return;
		}

		startCtrl.x = ( Math.round(rri[0]) - start.point.x ) *
			curviness * startTension;
		startCtrl.y = ( Math.round(rri[1]) - start.point.y ) *
			curviness * startTension;
		endCtrl.x = ( Math.round(rri[0]) - end.point.x ) *
			curviness * endTension;
		endCtrl.y = ( Math.round(rri[1]) - end.point.y ) *
			curviness * endTension;
	});
};

var rdeg = /deg$/;
Object.defineProperties(paper.PaperScope.prototype.Segment.prototype, {
	expand: {
		get: function() {
			return this._expand;
		},
		set: function( expand ) {
			if ( typeof expand.angle === 'string' && rdeg.test(expand.angle) ) {
				expand.angle = parseFloat(expand.angle) * ( Math.PI * 2 / 360 );
			}

			this._expand = expand;
		}
	},
	dirIn: {
		get: function() {
			return this._dirIn;
		},
		set: function( dir ) {
			if ( typeof dir === 'string' && rdeg.test( dir ) ) {
				this._dirIn = parseFloat(dir) * ( Math.PI * 2 / 360 );
			} else {
				this._dirIn = dir;
			}
		}
	},
	dirOut: {
		get: function() {
			return this._dirOut;
		},
		set: function( dir ) {
			if ( typeof dir === 'string' && rdeg.test( dir ) ) {
				this._dirOut = parseFloat(dir) * ( Math.PI * 2 / 360 );
			} else {
				this._dirOut = dir;
			}
		}
	}
});

module.exports = naive;
