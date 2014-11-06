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
			path.push(
				'C',
				nodes[i-1].lCtrl,
				node.rCtrl
			);
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

Contour.prototype.toOT = function(path) {
	var nodes = this.nodes,
		firstNode = this.nodes[0],
		lastNode = this.nodes[this.nodes.length - 1];

	nodes.forEach(function( node, i ) {
		// add letter
		if ( i === 0 ) {
			path.moveTo(
				Math.round( node.x ), Math.round( node.y ) );
		} else {
			path.curveTo(
				Math.round( nodes[i-1].lCtrl.x ), Math.round( nodes[i-1].lCtrl.y ),
				Math.round( node.rCtrl.x ), Math.round( node.rCtrl.y ),
				Math.round( node.x ), Math.round( node.y )
			);
		}
	});

	// cycle
	if ( this.type !== 'open' ) {
		path.curveTo(
			lastNode.lCtrl.x, lastNode.lCtrl.y,
			firstNode.rCtrl.x, firstNode.rCtrl.y,
			firstNode.x, firstNode.y
		);
	}

	return path;
};

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