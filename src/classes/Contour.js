import Classify from './Classify.js';
import Node from './Node.js';
import Segment from './Segment.js';
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
	var node = args.constructor === Node ?
			args:
			new Node( args );

	this.nodes.push( node );

	return node;
};

Contour.prototype.transform = function( m, withControls ) {
	this.nodes.forEach(node => node.transform(m, withControls));

	return this;
};

Contour.prototype.toSVG = function() {
	var path = [],
		nodes = this.nodes,
		firstNode = this.nodes[0],
		lastNode = this.nodes[this.nodes.length - 1];

	nodes.forEach(function( node, i ) {
		// add letter
		if ( i === 0 ) {
			path.push('M');
		} else {
			path.push('C');
		}

		// add controls
		if ( i !== 0 ) {
			path.push(nodes[i-1].lCtrl);

			path.push(node.rCtrl);
		}

		// add node coordinates
		path.push(node);

	});

	// cycle
	if ( this.type !== 'open' ) {
		path.push(
			'C',
			lastNode.lCtrl,
			firstNode.rCtrl,
			firstNode,
			'Z'
		);
	}

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

	if ( this.src && this.src.transform ) {
		this.transform( this.src.transform, true );
	}

	this.toSVG();
};

// For now we're just going to rebuild the segments array on each use
Object.defineProperty(Contour.prototype, 'segments', {
	get: function() {
		var segments = [],
			length = this.nodes.length,
			i = -1;

		while ( ++i < length - 1 ) {
			segments.push( new Segment(this.nodes[i], this.nodes[i+1]) );
		}

		if ( this.type === 'closed' ) {
			segments.push( new Segment(this.nodes[length -1], this.nodes[0]) );
		}

		return segments;
	}
});

export default Contour;