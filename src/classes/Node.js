import Point from './Point.js';

function Node( args ) {
	var coords;
	if ( args && ( args.x !== undefined || args.y !== undefined ) ) {
		coords = {
			x: args.x,
			y: args.y
		};
	}

	Point.prototype.constructor.apply( this, [ coords ] );

	this.lCtrl = new Point( args && args.lCtrl );
	this.lCtrl.tags.add('control');

	this.rCtrl = new Point( args && args.rCtrl );
	this.rCtrl.tags.add('control');

	this.src = args && args.src;
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
};

function propFromPath( _path, glyph, contour ) {
	var context,
		path = _path.replace( /\[\s*(\d+)\s*\]/g, '.$1' ).split('.');

	path.forEach(name => {
		// init context on first iteration
		if ( !context ) {
			context = name === 'nodes' ? contour : glyph;
		}

		context = context[ name ];
	});

	return context;
}

Node.prototype.update = function( params, glyph, contour ) {
	for ( var i in this.src ) {
		var attr = this.src[i];

		if ( typeof attr === 'object' && attr.updater ) {
			var args = [ glyph.contours, glyph.anchors, contour.nodes ];
			attr.parameters.forEach(name => args.push( params[name] ) );
			this[i] = attr.updater.apply( {}, args );
		}

		if ( i === 'onLine' ) {
			var knownCoord = this.src.x === undefined ? 'y' : 'x',
				p0 = propFromPath( this.src.onLine[0].operation, glyph, contour ),
				p1 = propFromPath( this.src.onLine[1].operation, glyph, contour );

			this.onLine( knownCoord, p0, p1 );
		}
	}
};

export default Node;