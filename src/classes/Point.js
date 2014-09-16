import Classify from './Classify.js';

function Point( x, y ) {
	Classify.prototype.constructor.call( this );

	if ( x === undefined || x === null ) {
		this.coords = new Float32Array([x, y]);

	} else if ( x.constructor === Array || x.constructor === Float32Array ) {
		this.coords = new Float32Array(x);

	} else if ( typeof x === 'object' && ( 'x' in x || 'y' in x ) ) {
		this.coords = new Float32Array([x.x, x.y]);

	} else {
		this.coords = new Float32Array([x, y]);

	}
}

Point.prototype = Object.create(Classify.prototype);
Point.prototype.constructor = Point;

Object.mixin(Point.prototype, {

	// .x and .y are more convenient than .coords[0] and .coords[1]
	get x() {
		return this.coords[0];
	},
	set x( x ) {
		this.coords[0] = x;
	},
	get y() {
		return this.coords[1];
	},
	set y( y ) {
		this.coords[1] = y;
	},

	transform( m ) {
		var coords0 = this.coords[0];
		this.coords[0] = m[0] * coords0 + m[2] * this.coords[1] + m[4];
		this.coords[1] = m[1] * coords0 + m[3] * this.coords[1] + m[5];

		return this;
	},

	toString() {
		return ( isNaN( this.coords[0] ) ? 'NaN' : Math.round( this.coords[0] ) ) +
			' ' +
			( isNaN( this.coords[1] ) ? 'NaN' : Math.round( this.coords[1] ) );
	},

	toJSON() {
		return this.toString();
	},



	// The following methods are deprecated

	// a setter for x/y coordinates that behaves exactly like the constructor
	_(x, y) {
		if ( x === undefined || x === null ) {
			this.coords[0] = x;
			this.coords[1] = y;

		} else if ( x.constructor === Array || x.constructor === Float32Array ) {
			this.coords[0] = x[0];
			this.coords[1] = x[1];

		} else if ( typeof x === 'object' && ( 'x' in x || 'y' in x ) ) {
			this.coords[0] = x.x;
			this.coords[1] = x.y;

		} else {
			this.coords[0] = x;
			this.coords[1] = y;

		}

		return this;
	},

	translate( x, y ) {
		var p = x instanceof Point ?
				x:
				new Point( x, y );

		if ( !isNaN( p.coords[0] ) ) {
			this.coords[0] += p.coords[0];
		}
		if ( !isNaN( p.coords[1] ) ) {
			this.coords[1] += p.coords[1];
		}

		return this;
	},

	translateX( x ) {
		this.coords[0] += x;
		return this;
	},

	translateY( y ) {
		this.coords[1] += y;
		return this;
	}
});

export default Point;

	// 	return Point;
	// });

	// some functions need to be added to the prototype at runtime to avoid circular dependency
	/*.run(function(Point, pointOn) {
		Point.prototype.on = pointOn;
	})

	.factory('pointOn', function( Point, lineLineIntersection ) {
		// this regexp is duplicated in Segment.js
		var rstraight = /[LVMH]/;

		return function( args ) {
			var origin,
				vector;

			// handle cases where args refers to undefined data
			if ( args === undefined || ( args.constructor === Array && ( args[0] === undefined || args[1] === undefined ) ) ) {
				return this;
			}

			// point on a segment
			if ( !isNaN( this.coords[0] ) || !isNaN( this.coords[1] ) ) {

				// point on a straight line
				if ( ( args.command !== undefined && rstraight.test(args.command) ) ||
					args.constructor === Array ) {
					// segment from two points
					if ( args.constructor === Array ) {
						origin = args[0];
						vector = [
							args[1].x - args[0].x,
							args[1].y - args[0].y
						];

					// Segment instance
					} else {
						origin = args.start;
						vector = [
							args.end.x - args.start.x,
							args.end.y - args.start.y
						];
					}

					if ( this.coords[0] ) {
						this.coords[1] = ( this.coords[0] - origin.x ) / vector[0] * vector[1] + origin.y;
					} else {
						this.coords[0] = ( this.coords[1] - origin.y ) / vector[1] * vector[0] + origin.x;
					}

					return this;

				// point on a curve
				} else {

				}

			// intersection
			} else if ( args.constructor === Array && args.length === 2 ) {

				// line-line intersection
				if (	( args[0].constructor === Array || rstraight.test(args[0].command) ) &&
						( args[1].constructor === Array || rstraight.test(args[1].command) ) ) {

					var p1 = args[0].constructor === Array ?
							( args[0][0] instanceof Point ?
								args[0][0]:
								new Point( args[0][0] ) ):
							args[0].start,
						p2 = args[0].constructor === Array ?
							( args[0][1] instanceof Point ?
								args[0][1]:
								new Point( args[0][1] ) ):
							args[0].end,
						p3 = args[1].constructor === Array ?
							( args[1][0] instanceof Point ?
								args[1][0]:
								new Point( args[1][0] ) ):
							args[1].start,
						p4 = args[1].constructor === Array ?
							( args[1][1] instanceof Point ?
								args[1][1]:
								new Point( args[1][1] ) ):
							args[1].end;

					return this._( lineLineIntersection( p1, p2, p3, p4 ) );

				// curve-curve intersection
				} else if ( args[0].command === 'C' && args[1].command === 'C' ) {

				// line-curve or curve-line intersection
				} else {

				}

			}
		};
	})*/