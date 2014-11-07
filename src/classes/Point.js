import Classify from './Classify.js';

function Point( x, y ) {
	Classify.prototype.constructor.call( this );

	if ( !x && x !== 0 ) {
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

// .x and .y are more convenient than .coords[0] and .coords[1]
Object.defineProperties(Point.prototype, {
	x: {
		get: function() { return this.coords[0]; },
		set: function( x ) { this.coords[0] = x; }
	},
	y: {
		get: function() { return this.coords[1]; },
		set: function( y ) { this.coords[1] = y; }
	}
});

Object.mixin(Point.prototype, {

	set(x, y) {
		this.coords[0] = x;
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

Point.prototype.onLine = function( knownCoord, p1, p2 ) {
	var origin = p1,
		vector = [
			p2.x - p1.x,
			p2.y - p1.y
		];

	if ( knownCoord === 'x' ) {
		this.coords[1] = ( this.coords[0] - origin.x ) / vector[0] * vector[1] + origin.y;
	} else {
		this.coords[0] = ( this.coords[1] - origin.y ) / vector[1] * vector[0] + origin.x;
	}
};

export default Point;