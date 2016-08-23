var plumin = require('plumin.js'),
	paper = plumin.paper;

var Utils = {};

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

Utils.split = function(points, t) {
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

	return Utils.split(points, result[0]);
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

module.exports = Utils;
