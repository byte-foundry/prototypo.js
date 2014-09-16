import Classify from './Classify.js';
import Node from './Node.js';

function Contour( args ) {
	Classify.prototype.constructor.apply( this );

	this.nodes = [];
	if ( args.nodes ) {
		args.nodes.forEach(node => {
			this.nodes.push( new Node( node ) )
		});
	}
}

Contour.prototype = Object.create(Classify.prototype);
Contour.prototype.constructor = Contour;

Contour.prototype.addNode = function( args ) {
	return this.nodes.push( new Node( args ) );
};

Contour.prototype.transform = function( m ) {
	this.nodes.forEach(node => node.transform(m));

	return this;
};

Contour.prototype.link = function() {
	var i = this.nodes.length;

	if ( i > 1 ) {
		this.nodes[0].prev = this.nodes[i - 1];
		this.nodes[i - 1].next = this.nodes[0];
	}

	while ( i-- ) {
		if ( this.nodes[i + 1] ) {
			this.nodes[i].next  this.nodes[i + 1];
		}
		if ( this.nodes[i - 1] ) {
			this.nodes[i].prev  this.nodes[i - 1];
		}
	}
}

export default Contour;