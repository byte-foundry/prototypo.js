var plumin = require('../node_modules/plumin.js/dist/plumin.js'),
	paper = plumin.paper,
	Utils = require('./Utils.js');

var naive = {};

// default method to expand skeletons:
// derives two additional node from every node with an .expand object
naive.expandSkeletons = function( glyph ) {
	glyph.contours.forEach(function( contour, i ) {
		if ( contour.skeleton !== true ) {
			return;
		}

		var leftContour,
			rightContour,
			leftNodes = [],
			rightNodes = [],
			firstNode,
			lastNode;

		contour.nodes.forEach(function( node, j ) {
			// TODO: a node should be able to specify two arbitrary expanded nodes
			var left = new paper.Node(),
				right = new paper.Node();

			leftNodes.push(left);
			rightNodes.unshift(right);
			node.expandedTo = [left, right];
			left.expandedFrom = right.expandedFrom = node;

			left.src = {
				_dependencies: ['contours.' + i + '.nodes.' + j],
				_parameters: ['width'],
				_updater: naive.expandedNodeUpdater('left')
			};
			right.src = {
				_dependencies: ['contours.' + i + '.nodes.' + j],
				_parameters: ['width'],
				_updater: naive.expandedNodeUpdater('right')
			};
			node.src.expandedTo = [left.src, right.src];

		});

		// TODO: handle closed skeleton
		if ( !contour.expandedTo && !contour.closed ) {
			leftContour = new paper.Path({
				closed: true,
				segments: leftNodes.concat(rightNodes)
			});
			contour.expandedTo = [leftContour];
			leftContour.expandedFrom = contour;
			glyph.addContour(leftContour);

			firstNode = contour.firstNode;
			lastNode = contour.lastNode;

			firstNode.expandedTo[0].type = 'corner';
			firstNode.expandedTo[1].type = 'corner';
			lastNode.expandedTo[0].type = 'corner';
			lastNode.expandedTo[1].type = 'corner';

			firstNode.expandedTo[0].typeOut = 'line';
			firstNode.expandedTo[1].typeIn = 'line';
			lastNode.expandedTo[0].typeOut = 'line';
			lastNode.expandedTo[1].typeIn = 'line';

		} else if ( !contour.expandedTo && contour.closed ) {
			leftContour = new paper.Path({
				closed: true,
				segments: leftNodes
			});
			rightContour = new paper.Path({
				closed: true,
				segments: rightNodes
			});
			contour.expandedTo = [
				leftContour,
				rightContour
			];
			leftContour.expandedFrom = rightContour.expandedFrom = contour;
			glyph.addContours([
				leftContour,
				rightContour
			]);
		}
	});
};

naive.expandedNodeUpdater = function( side ) {
	return function( propName, contours, anchors, parentAnchors, Utils, _width ) {
		var origin = this[propName].expandedFrom,
			expand = this[propName].expandedFrom.expand,
			width = expand.width !== undefined ? expand.width : _width,
			coef = expand.distr !== undefined ?
				( side === 'left' ? expand.distr : 1 - expand.distr ):
				0.5,
			angle = ( side === 'left' ? Math.PI : 0 ) + ( expand.angle !== undefined ?
				expand.angle:
				( origin._dirOut !== undefined ?
					origin._dirOut - Math.PI / 2:
					origin._dirIn + Math.PI / 2
				)
			);

		this[propName].point.x = origin.point.x + ( width * coef * Math.cos( angle ) );
		this[propName].point.y = origin.point.y + ( width * coef * Math.sin( angle ) );
	};
};

// make sure lines are set on both endpoints of a segment
// make sure types of endpoints are correctly set
naive.prepareContour = function( path ) {
	path.nodes.forEach(function(node) {
		if ( node.typeIn === 'line' && node.previous ) {
			node.previous.typeOut = 'line';

			if ( node.type === 'smooth' ) {
				node._dirIn = node.point.getAngleInRadians( node.previous.point );
				node._dirOut = node._dirIn + Math.PI;
			}
		}

		if ( node.typeOut === 'line' && node.previous ) {
			node.next.typeIn = 'line';

			if ( node.type === 'smooth' ) {
				node._dirOut = node.point.getAngleInRadians( node.next.point );
				node._dirIn = node._dirOut + Math.PI;
			}
		}
	});
};

naive.updateContour = function( path, params ) {
	var curviness = params.curviness || 2/3;

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
			lli;

		if ( !node.next ) {
			return;

		} else {
			end = node.next;
			startCtrl = start.handleOut;
			endCtrl = end.handleIn;

			startType = start.typeOut || ( start.expandedFrom && start.expandedFrom.typeOut );
			endType = end.typeIn || ( end.expandedFrom && end.expandedFrom.typeIn );
		}

		if ( startType === 'line' || endType === 'line' ) {
			startCtrl.x = 0;
			startCtrl.y = 0;
			endCtrl.x = 0;
			endCtrl.y = 0;

			return;
		}

		startTension = start.tensionOut !== undefined ?
			start.tensionOut:
			( start.expandedFrom && start.expandedFrom.tensionOut !== undefined ?
				start.expandedFrom.tensionOut :
				1
			);
		endTension = end.tensionIn !== undefined ?
			end.tensionIn:
			( end.expandedFrom && end.expandedFrom.tensionIn !== undefined ?
				end.expandedFrom.tensionIn :
				1
			);

		startDir = start._dirOut !== undefined ?
			start._dirOut:
			( start.expandedFrom && start.expandedFrom._dirOut !== undefined ?
				start.expandedFrom._dirOut :
				1
			);
		endDir = end._dirIn !== undefined ?
			end._dirIn:
			( end.expandedFrom && end.expandedFrom._dirIn !== undefined ?
				end.expandedFrom._dirIn :
				1
			);

		if ( start.point.x === 0 ) {
			lli = [ 0, end.point.y - Math.tan( endDir ) * end.point.x ];

		} else if ( end.point.x === 0 ) {
			lli = [ 0, start.point.y - Math.tan( startDir ) * start.point.x ];

		} else {
			lli = Utils.lineLineIntersection(
				start.point,
				{ x: 0, y: start.point.y - Math.tan( startDir ) * start.point.x },
				end.point,
				{ x: 0, y: end.point.y - Math.tan( endDir ) * end.point.x }
			);
		}

		startCtrl.x = start.point.x + ( lli[0] - start.point.x ) * curviness * startTension;
		startCtrl.y = start.point.y + ( lli[1] - start.point.y ) * curviness * startTension;
		endCtrl.x = end.point.x + ( lli[0] - end.point.x ) * curviness * endTension;
		endCtrl.y = end.point.y + ( lli[1] - end.point.y ) * curviness * endTension;
	});
};

var rdeg = /deg$/;
Object.defineProperties(paper.PaperScope.prototype.Segment.prototype, {
	expand: {
		get: function() {
			return this._expand;
		},
		set: function( expand ) {
			if ( typeof expand.angle === 'string' && rdeg.test( expand.angle ) ) {
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