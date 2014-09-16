import Point from './Point.js';

function Node( args ) {
	var coords;
	if ( args.x !== undefined || args.y !== undefined ) {
		coords = {
			x: args.x,
			y: args.y
		};
	}

	Point.prototype.constructor.apply( this, [ coords ] );

	this.lCtrl = new Point( args.lCtrl );
	this.lCtrl.tags.add('control');

	this.rCtrl = new Point( args.rCtrl );
	this.rCtrl.tags.add('control');

	this.onLine = args.onLine,
	this.onSegment = args.onSegment;
	this.src = args.src;
}

Node.prototype = Object.create(Point.prototype);
Node.prototype.constructor = Node;

Node.prototype.transform = function( m, withCtrls ) {
	var coords0 = this.coords[0];
	this.coords[0] = m[0] * coords0 + m[2] * this.coords[1] + m[4];
	this.coords[1] = m[1] * coords0 + m[3] * this.coords[1] + m[5];

	if ( withCtrls ) {
		coords0 = this.lCtrl.coords[0];
		this.lCtrl.coords[0] = m[0] * coords0 + m[2] * this.lCtrl.coords[1] + m[4];
		this.lCtrl.coords[1] = m[1] * coords0 + m[3] * this.lCtrl.coords[1] + m[5];

		coords0 = this.rCtrl.coords[0];
		this.rCtrl.coords[0] = m[0] * coords0 + m[2] * this.rCtrl.coords[1] + m[4];
		this.rCtrl.coords[1] = m[1] * coords0 + m[3] * this.rCtrl.coords[1] + m[5];
	}

	return this;
}

export default Node;