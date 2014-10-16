import Classify from './Classify.js';
import Node from './Node.js';
import Utils from './Utils.js';

function Contour( args ) {
	Classify.prototype.constructor.apply( this );

	this.nodes = [];

	if ( args && args.src ) {
		this.src = args.src;
		this.fromSrc( args.src );
		Utils.mergeStatic( this, args.src );
	}
}

Contour.prototype = Object.create(Classify.prototype);
Contour.prototype.constructor = Contour;

Contour.prototype.fromSrc = function( contourSrc ) {
	contourSrc.point.forEach(pointSrc => {
		Utils.createUpdaters( pointSrc );

		this.addNode({ src: pointSrc });
	});
};

Contour.prototype.addNode = function( args ) {
	var node = new Node( args );
	this.nodes.push( node );
	return node;
};

Contour.prototype.transform = function( m ) {
	this.nodes.forEach(node => node.transform(m));

	return this;
};

Contour.prototype.toSVG = function() {
	var path = [],
		nodes = this.nodes,
		firstNode = this.nodes[0],
		lastNode = this.nodes[this.nodes.length - 1];

	do {
		nodes.forEach(function( node, i ) {
			// add letter
			if ( i === 0 ) {
				path.push('M');
			} else {
				path.push('C');
			}

			// add controls
			if ( i !== 0 ) {
				path.push(nodes[i-1].rCtrl.toString());

				path.push(node.lCtrl.toString());
			}

			// add node coordinates
			path.push(node.toString());

		});

		// cycle
		if ( this.type !== 'open' ) {
			path.push([
				'C',
				lastNode.rCtrl.toString(),
				firstNode.lCtrl.toString(),
				firstNode.toString(),
				'Z'
			].join(' '));
		}

	} while ( ( nodes = nodes.next ) );

	this.pathData = path.join(' ');

	return this.pathData;
};

/*Contour.prototype.link = function() {
	var i = this.nodes.length;

	if ( i > 1 ) {
		this.nodes[0].prev = this.nodes[i - 1];
		this.nodes[i - 1].next = this.nodes[0];
	}

	while ( i-- ) {
		if ( this.nodes[i + 1] ) {
			this.nodes[i].next = this.nodes[i + 1];
		}
		if ( this.nodes[i - 1] ) {
			this.nodes[i].prev = this.nodes[i - 1];
		}
	}
};*/

Contour.prototype.update = function( params, glyph ) {
	this.nodes.forEach(node => node.update( params, glyph, this ));

	this.toSVG();
};

export default Contour;