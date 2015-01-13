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
			node.expanded = [left, right];
			left.skeleton = right.skeleton = node;

			left.src = {
				_dependencies: ['contours.' + i + '.nodes.' + j],
				_parameters: ['width'],
				_updater: naive.expandedNodeUpdater('left')
			};
			// clone left.src
			right.src = {
				_dependencies: ['contours.' + i + '.nodes.' + j],
				_parameters: ['width'],
				_updater: naive.expandedNodeUpdater('right')
			};
		});

		// TODO: handle closed skeleton
		if ( !contour.expanded && !contour.closed ) {
			leftContour = new paper.Path({
				closed: true,
				segments: leftNodes.concat(rightNodes)
			});
			contour.expanded = [leftContour];
			leftContour.skeleton = contour;
			glyph.addContour(leftContour);

			firstNode = contour.firstNode;
			lastNode = contour.lastNode;

			firstNode.expanded[0].type = 'corner';
			firstNode.expanded[1].type = 'corner';
			lastNode.expanded[0].type = 'corner';
			lastNode.expanded[1].type = 'corner';

			firstNode.expanded[0].typeOut = 'line';
			firstNode.expanded[1].typeIn = 'line';
			lastNode.expanded[0].typeOut = 'line';
			lastNode.expanded[1].typeIn = 'line';

		} else if ( !contour.expanded && contour.closed ) {
			leftContour = new paper.Path({
				closed: true,
				segments: leftNodes
			});
			rightContour = new paper.Path({
				closed: true,
				segments: rightNodes
			});
			contour.expanded = [
				leftContour,
				rightContour
			];
			leftContour.skeleton = rightContour.skeleton = contour;
			glyph.addContours([
				leftContour,
				rightContour
			]);
		}
	});
};

naive.expandedNodeUpdater = function( side ) {
	return function( contours, anchors, parentAnchors, Utils, _width ) {
		var skeleton = this.skeleton,
			expand = this.skeleton.expand,
			width = expand.width !== undefined ? expand.width : _width,
			coef = expand.distr !== undefined ?
				( side === 'left' ? expand.distr : 1 - expand.distr ):
				0.5,
			angle = ( side === 'left' ? Math.PI : 0 ) + ( expand.angle !== undefined ?
				expand.angle:
				( skeleton._dirOut !== undefined ?
					skeleton._dirOut - Math.PI / 2:
					skeleton._dirIn + Math.PI / 2
				)
			);

		this.point.x = skeleton.point.x + ( width * coef * Math.cos( angle ) );
		this.point.y = skeleton.point.y + ( width * coef * Math.sin( angle ) );
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
			startTension,
			endTension,
			lli;

		if ( !node.next ) {
			return;

		} else {
			end = node.next;
			startCtrl = start.handleOut;
			endCtrl = end.handleIn;
		}

		if ( start.typeOut === 'line' || end.typeIn === 'line' ) {
			startCtrl.x = 0;
			startCtrl.y = 0;
			endCtrl.x = 0;
			endCtrl.y = 0;

			return;
		}

		startTension = start.tensionOut !== undefined ? start.tensionOut : 1;
		endTension = end.tensionIn !== undefined ? end.tensionIn : 1;

		if ( start.point.x === 0 ) {
			lli = [ 0, end.point.y - Math.tan( end.dirIn ) * end.point.x ];

		} else if ( end.point.x === 0 ) {
			lli = [ 0, start.point.y - Math.tan( start.dirOut ) * start.point.x ];

		} else {
			lli = Utils.lineLineIntersection(
				start.point,
				{ x: 0, y: start.point.y - Math.tan( start.dirOut ) * start.point.x },
				end.point,
				{ x: 0, y: end.point.y - Math.tan( end.dirIn ) * end.point.x }
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