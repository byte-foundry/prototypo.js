var plumin = require('plumin.js'),
	paper = plumin.paper;

var Utils = {};

/* eslint-disable */
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
		d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

	if ( d === 0 ) {
		return null;
	}

	return new Float32Array([
		( (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4) ) /
		d,
		( (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4) ) /
		d
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

	//We want to round a1, a2 and PI to avoid problems with approximation
	a1 = a1.toFixed(6);
	a2 = a2.toFixed(6);
	var piOver2 = (Math.PI / 2).toFixed(6);

	// Optimize frequent and easy special cases.
	// Without optimization, results would be incorrect when cos(a) === 0
	if ( a1 === 0 ) {
		y = p1.y;
	} else if ( a1 === piOver2 ) {
		x = p1.x;
	}
	if ( a2 === 0 ) {
		y = p2.y;
	} else if ( a2 === piOver2 ) {
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
	if ( a1 === piOver2 ) {
		return new Float32Array([ x, b * x + d ]);
	}
	if ( a2 === 0 ) {
		return new Float32Array([ ( y - c ) / a, y ]);
	}
	if ( a2 === piOver2 ) {
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

// return the angle between two points
Utils.lineAngle = function( p0, p1 ) {
	return Math.atan2( p1.y - p0.y, p1.x - p0.x );
};

Utils.onLine = function( params ) {
	if ( params.on[0].x === params.on[1].x &&
		params.on[0].y === params.on[1].y ) {
		return 'x' in params ?
			params.on[0].y :
			params.on[0].x;
	}

	var origin = params.on[0],
		vector = [
			params.on[1].x - params.on[0].x,
			params.on[1].y - params.on[0].y
		];

	return 'x' in params ?
		( params.x - origin.x ) / vector[0] * vector[1] + origin.y :
		( params.y - origin.y ) / vector[1] * vector[0] + origin.x;
};

Utils.pointOnCurve = function(pointHandleOut,
	pointHandleIn,
	distanceFromOut,
	inverseOrientation,
	linePrecision) {
	linePrecision = linePrecision || 3;
	var length = 0;
	var previousPoint;

	var points;
	if (!inverseOrientation) {
		points = [
			pointHandleOut.point,
			pointHandleOut.point.add(pointHandleOut.handleOut),
			pointHandleIn.point.add(pointHandleIn.handleIn),
			pointHandleIn.point
		];
	} else {
		points = [
			pointHandleIn.point,
			pointHandleIn.point.add(pointHandleIn.handleIn),
			pointHandleOut.point.add(pointHandleOut.handleOut),
			pointHandleOut.point
		];
	}

	for (var i = 0; i < linePrecision; i++) {
		var point = Utils.getPointOnCurve(points,
			( i / ( linePrecision - 1 ) ) );

		if (previousPoint) {
			length += Utils.distance(previousPoint.x,
				previousPoint.y,
				point.x,
				point.y);

		}

		previousPoint = point;
	}

	var t = length === 0 ? 0 : distanceFromOut / length;

	t = Math.max(0.001, Math.min(1, t));

    return Utils.getPointOnCurve(points, t);
};

Utils.getPointOnCurve = function(points, t) {
	var inverseT = 1 - t;
	var a = inverseT * inverseT * inverseT;
	var b = inverseT * inverseT * t * 3;
	var c = inverseT * t * t * 3;
	var d = t * t * t;

	return {
		x: a * points[0].x + b * points[1].x + c * points[2].x + d * points[3].x,
		y: a * points[0].y + b * points[1].y + c * points[2].y + d * points[3].y,
		normal: Utils.lineAngle(
			{
				x: 0,
				y: 0
			},
			{
				x: (points[1].x - points[0].x) * inverseT * inverseT + 2 * ( points[2].x - points[1].x ) * t * inverseT + (points[3].x - points[2].x) * t * t,
				y: (points[1].y - points[0].y) * inverseT * inverseT + 2 * ( points[2].y - points[1].y ) * t * inverseT + (points[3].y - points[2].y) * t * t,
			}
		)
	}
}

Utils.split = function(points, t, base) {
	t = t || 1;
	var result = points;
	while (points.length > 1) {
		var newPoints = [];
		for (var i = 1; i < points.length; i++) {
			newPoints.push(
				points[i - 1]
					.multiply(1 - t)
					.add(
						points[i]
							.multiply(t)
					)
				);
		}

		result = result.concat(newPoints);
		points = newPoints;
	}

	if (t === 1) {
		return {
			left: [
				base[1],
				base[0]
			],
			right: [
				base[1],
				base[1]
			]
		}
	}

	var splitBezier = {
		left: [
			{
				x: result[0].x,
				y: result[0].y,
				point: new paper.Point(
					result[0].x,
					result[0].y
				),
				handleOut:new paper.Point(
					result[4].x - result[0].x,
					result[4].y - result[0].y
				),
			},
			{
				x: result[9].x,
				y: result[9].y,
				point: new paper.Point(
					result[9].x,
					result[9].y
				),
				handleIn:new paper.Point(
					result[7].x - result[9].x,
					result[7].y - result[9].y
				),
				handleOut:new paper.Point(
					result[8].x - result[9].x,
					result[8].y - result[9].y
				),
			}
		],
		right: [
			{
				x: result[9].x,
				y: result[9].y,
				point: new paper.Point(
					result[9].x,
					result[9].y
				),
				handleIn:new paper.Point(
					result[7].x - result[9].x,
					result[7].y - result[9].y
				),
				handleOut:new paper.Point(
					result[8].x - result[9].x,
					result[8].y - result[9].y
				),
			},
			{
				x: result[3].x,
				y: result[3].y,
				point: new paper.Point(
					result[3].x,
					result[3].y
				),
				handleIn:new paper.Point(
					result[6].x - result[3].x,
					result[6].y - result[3].y
				),
			}
		]
	};
	return splitBezier;
};

Utils.distance = function(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y1 - y2, 2));
};

Utils.align = function(points, lineStart, lineEnd) {
	var tx = lineStart.x,
	ty = lineStart.y,
	a = -Math.atan2(lineEnd.y - ty, lineEnd.x - tx),
	d = function(v) {
		return {
			x: (v.x - tx) * Math.cos(a) - (v.y - ty) * Math.sin(a),
			y: (v.x - tx) * Math.sin(a) + (v.y - ty) * Math.cos(a)
		};
	};
	return points.map(d);
}

function crt(v) {
	return v < 0 ?
		-Math.pow( -v, 1/3) :
		Math.pow( v, 1/3);
}

// see https://github.com/Pomax/bezierjs/blob/gh-pages/lib/utils.js line 313
Utils.lineCurveIntersection = function(pointHandleOut, pointHandleIn, lineStart, lineEnd) {
	lineStart = lineStart || {x:0,y:0};
	lineEnd = lineEnd || {x:1,y:0};
	var points = [
		pointHandleOut.point,
		pointHandleOut.point.add(pointHandleOut.handleOut),
		pointHandleIn.point.add(pointHandleIn.handleIn),
		pointHandleIn.point
	];
	var p = Utils.align(points, lineStart, lineEnd);
	var reduce = function(t) { return 0<=t && t <=1; };

	// see http://www.trans4mind.com/personal_development/mathematics/polynomials/cubicAlgebra.htm
	var pa = p[0].y;
	var pb = p[1].y;
	var pc = p[2].y;
	var pd = p[3].y;
	var d = (-pa + 3 * pb - 3 * pc + pd);
	var a = (3 * pa - 6 * pb + 3 * pc) / d;
	var b = (-3 * pa + 3 * pb) / d;
	var c = pa / d;
	var p3 = ((3 * b - a * a) / 3 ) / 3;
	var q = (2 * a * a * a - 9 * a * b + 27 * c) / 27;
	var q2 = q/2;
	var discriminant = q2 * q2 + p3 * p3 * p3;
	var u1;
	var v1;
	var x1;
	var x2;
	var x3;

	var result;

	if (discriminant < 0) {
		var mp3 = -p3,
		mp33 = mp3 * mp3 * mp3,
		r = Math.sqrt( mp33 ),
		t = -q / ( 2 * r ),
		cosphi = t < -1 ? -1 : t > 1 ? 1 : t,
		phi = Math.acos( cosphi ),
		crtr = crt( r ),
		t1 = 2 * crtr;
		x1 = t1 * Math.cos( phi / 3) - a / 3;
		x2 = t1 * Math.cos((phi+ Math.PI * 2)/3) - a / 3;
		x3 = t1 * Math.cos((phi+ 4 * Math.PI)/3) - a / 3;
		result = [x1, x2, x3].filter(reduce);
	} else if(discriminant === 0) {
		u1 = q2 < 0 ? crt(-q2) : -crt(q2);
		x1 = 2 * u1 -a / 3;
		x2 = -u1 - a / 3;
		result = [x1,x2].filter(reduce);
	} else {
		var sd = Math.sqrt(discriminant);
		u1 = crt(-q2 + sd);
		v1 = crt(q2 + sd);
		result = [u1 - v1 - a / 3].filter(reduce);
	}

	return Utils.split(points, result[0], [pointHandleIn, pointHandleOut]);
}

Utils.log = function() {
	/*eslint-disable no-console */
	console.log.apply( console, arguments );
	/*eslint-enable no-console */
	return arguments[0];
};

Utils.normalize = function(vector) {
	var x = vector.x;
	var y = vector.y;

	var norm = Utils.distance(0, 0, x, y);

	if (norm === 0) {
		return {
			x: 0,
			y: 0
		};
	}

	return {
		x: x / norm,
		y: y / norm
	};
}

Utils.vectorFromPoints = function(a, b) {
	return {
		x:b.x - a.x,
		y:b.y - a.y
	}
}

Utils.parseInt = function(int) {
	return parseInt(int);
}

Utils.makeCurveInsideSerif = function(
	pAnchors,
	serifHeight,
	serifWidth,
	serifMedian,
	serifCurve,
	serifTerminal,
	thickness,
	midWidth,
	serifRotate
) {
	var yDir = pAnchors.down ? -1 : 1;
	var xDir = pAnchors.left ? -1 : 1;
	var midStumpOrient = pAnchors.inverseMidStump ? -1: 1;
	var realThickness = pAnchors.thickness || thickness;

	var rotateRad = (serifRotate * pAnchors.rotationAngle || 0) * Math.PI/180;
	var baseWidth = pAnchors.baseWidth;
	var baseHeight = pAnchors.baseHeight;
	var stumpOpposite = pAnchors.opposite;
	var stumpVector = {
		x: stumpOpposite.x - baseHeight.x,
		y: stumpOpposite.y - baseHeight.y,
	};
	var stumpNorm = Utils.distance(0, 0, stumpVector.x, stumpVector.y);
	stumpVector = Utils.normalize(stumpVector);
	var stumpAngle = Utils.lineAngle(baseHeight, stumpOpposite);

	var rotationCenter = pAnchors.rotationCenter;
	var topLeft = {
		x: rotationCenter.x + (baseHeight.x - rotationCenter.x - serifHeight * xDir) * Math.cos(rotateRad) - (baseWidth.y - rotationCenter.y + serifWidth * yDir) * Math.sin(rotateRad),
		y: rotationCenter.y + (baseWidth.y - rotationCenter.y + serifWidth * yDir) * Math.cos(rotateRad) + (baseHeight.x - rotationCenter.x - serifHeight * xDir) * Math.sin(rotateRad),
	};
	var bottomLeft = {
		x: rotationCenter.x + (baseHeight.x - rotationCenter.x - serifHeight * xDir) * Math.cos(rotateRad) - (baseHeight.y - rotationCenter.y) * Math.sin(rotateRad),
		y: rotationCenter.y + (baseHeight.y - rotationCenter.y) * Math.cos(rotateRad) + (baseHeight.x - rotationCenter.x - serifHeight * xDir) * Math.sin(rotateRad),
	}

	//We get the intersection with the left edge of the serif and the curve support
	//this operation is direction dependent
	var splitBase;
	if (pAnchors.inverseOrder) {
		splitBase = Utils.lineCurveIntersection(
			pAnchors.curveEnd,
			pAnchors.baseWidth,
			{x: topLeft.x, y: topLeft.y},
			{x: bottomLeft.x, y: bottomLeft.y}
		);
	}
	else {
		splitBase = Utils.lineCurveIntersection(
			pAnchors.baseWidth,
			pAnchors.curveEnd,
			{x: topLeft.x, y: topLeft.y},
			{x: bottomLeft.x, y: bottomLeft.y}
		);
	}


	// We chose a serifCenter depending on if the left edge intersect or not with
	// the curve support
	var serifCenter;
	var splitCurveEnd;

	if (!pAnchors.inverseOrder) {
		if (splitBase.right[0].x !== splitBase.right[1].x || splitBase.right[0].y !== splitBase.right[1].y) {
			serifCenter = splitBase.right[0];
			splitCurveEnd = splitBase.right[1];
		}
		else {
			serifCenter = splitBase.left[0];
			splitCurveEnd = splitBase.left[1];
		}
	}
	else {
		if (splitBase.left[0].x !== splitBase.left[1].x || splitBase.left[0].y !== splitBase.left[1].y) {
			serifCenter = splitBase.left[1];
			splitCurveEnd = splitBase.left[0];
		}
		else {
			serifCenter = splitBase.right[1];
			splitCurveEnd = splitBase.right[0];
		}
	}

	// The serif direction is the line from the serif center
	// to the serif left edge
	var serifDirection = Utils.vectorFromPoints(
		serifCenter,
		{
			x: rotationCenter.x + (baseHeight.x - rotationCenter.x - serifHeight * xDir) * serifMedian * Math.cos(rotateRad) - (baseWidth.y - rotationCenter.y + serifWidth * yDir) * Math.sin(rotateRad),
			y: rotationCenter.y + (baseWidth.y - rotationCenter.y + serifWidth * yDir) * Math.cos(rotateRad) + (baseHeight.x - rotationCenter.x - serifHeight * xDir) * serifMedian * Math.sin(rotateRad),
		}
	);

	var serifBasis = Utils.normalize(serifDirection);
	var serifRadDirection = Math.atan2(serifBasis.y, serifBasis.x);

	var pointOnCurve;
	var pointOnSerif;
	var pointWithCurve = {};
	var normalToCurve;

	if (pAnchors.inverseOrder) {
		pointWithCurve = Utils.pointOnCurve(splitCurveEnd, serifCenter, serifCurve, true, 200)
	}
	else {
		pointWithCurve = Utils.pointOnCurve(serifCenter, splitCurveEnd, serifCurve, false, 200)
	}

	if (serifCurve > 0) {
		normalToCurve = pointWithCurve.normal;
		pointOnCurve = {
			x: pointWithCurve.x,
			y: pointWithCurve.y,
			dirOut: pointWithCurve.normal,
			type:'corner'
		};
		var curveRatio = Math.min(serifCurve / Utils.distance(0, 0, serifDirection.x, serifDirection.y), 0.75);
		pointOnSerif = {
			x: serifCenter.x + serifDirection.x * curveRatio,
			y: serifCenter.y + serifDirection.y * curveRatio,
			dirIn: serifRadDirection,
			dirOut: serifRadDirection,
			type:'corner'
		};
	}
	else {
		if (pAnchors.inverseOrder) {
			normalToCurve = serifCenter.handleIn.angleInRadians;
		}
		else {
			normalToCurve = serifCenter.handleOut.angleInRadians;
		}
		pointOnCurve = {
			x: serifCenter.x,
			y: serifCenter.y,
			type:'corner',
		};
		pointOnSerif = {
			x: serifCenter.x,
			y: serifCenter.y,
			type:'corner'
		};
	}
	var leftEdge = {
		x: serifCenter.x + serifDirection.x,
		y: serifCenter.y + serifDirection.y,
		dirIn: serifRadDirection,
		dirOut: rotateRad,
	};
	var rightEdge = {
		x: rotationCenter.x - (baseWidth.y - rotationCenter.y + serifWidth * midWidth * yDir) * Math.sin(rotateRad),
		y: rotationCenter.y + (baseWidth.y - rotationCenter.y + serifWidth * midWidth * yDir) * Math.cos(rotateRad),
		dirIn: rotateRad,
		typeOut: 'line'
	};
	var serifRoot = {
		x: baseHeight.x,
		y: baseHeight.y,
	};

	var rootVector = Utils.normalize(Utils.vectorFromPoints(serifRoot, rightEdge));
	var medianVector = Utils.normalize(Utils.vectorFromPoints(pointOnSerif, leftEdge));

	var terminalVector = Utils.normalize({
		x: rootVector.x + medianVector.x,
		y: rootVector.y + medianVector.y,
	});

	var midPoint = {
		x: (leftEdge.x + rightEdge.x) / 2 + serifTerminal * serifHeight * terminalVector.x * xDir,
		y: (leftEdge.y + rightEdge.y) / 2 + serifTerminal * serifHeight * terminalVector.y * xDir,
		dirIn: rotateRad,
		dirOut: rotateRad,
	};

	if (serifTerminal !== 0) {
		leftEdge.dirOut = Math.atan2(medianVector.y, medianVector.x);
		rightEdge.dirIn = Math.atan2(rootVector.y, rootVector.x);
	}
	else if (midWidth !== 1) {
		var dirOut = Math.atan2(leftEdge.y - rightEdge.y, leftEdge.x - rightEdge.x);
		leftEdge.dirOut = dirOut;
		rightEdge.dirIn = dirOut;
		midPoint.dirIn = dirOut
		midPoint.dirOut = dirOut
	}

	var midStump = {
		x: serifRoot.x + stumpNorm / 2 * stumpVector.x,
		y: serifRoot.y + stumpNorm / 2 * stumpVector.y,
		dirOut: baseWidth.dirIn,
		typeIn: 'line',
		type: 'corner',
	}

	var lastPoint = {
		x: pointOnCurve.x - stumpNorm / 2 * Math.sin(normalToCurve) * yDir * xDir,
		y: pointOnCurve.y + stumpNorm / 2 * Math.cos(normalToCurve) * yDir * xDir,
		dirIn: normalToCurve,
		typeOut: 'line',
		type: 'corner',
	}

	if (serifCurve + serifHeight < 70) {
		midStump.tensionOut = 0;
		lastPoint.tensionIn = 0;
	}
	else {
		midStump.tensionOut = 1;
		lastPoint.tensionIn = 1;
	}

	return [
		pointOnCurve,
		pointOnSerif,
		leftEdge,
		midPoint,
		rightEdge,
		rotationCenter,
		serifRoot,
		midStump,
		lastPoint
	]
}
/* eslint-enable */

module.exports = Utils;
