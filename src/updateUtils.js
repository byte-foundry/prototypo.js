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

// return the angle between two points
Utils.lineAngle = function( p0, p1 ) {
	return Math.atan2( p1.y - p0.y, p1.x - p0.x );
};

Utils.onLine = function( params ) {
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
		var point = Utils.deCasteljau(points,
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

    return Utils.deCasteljau(points, t);
};

Utils.deCasteljau = function(points, t) {
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

	if (newPoints.length === 1) {
		var p0 = { x: 0, y: 0 },
			p1 = {
			x: points[1].x - points[0].x,
			y: points[1].y - points[0].y
		};

		return {
			x: newPoints[0].x,
			y: newPoints[0].y,
			normal: Utils.lineAngle(p0, p1)
		};
	} else {
		return Utils.deCasteljau(newPoints, t);
	}
};

Utils.distance = function(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y1 - y2, 2));
};

Utils.log = function() {
	console.log.apply( console, arguments );
	return arguments[0];
};

module.exports = Utils;
