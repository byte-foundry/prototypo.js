import Classify from './Classify.js';
import Contour from './Contour.js';

function Glyph() {
	Classify.prototype.constructor.apply( this );

	this.contours = [];
	this.anchors = [];
	// if ( args.contours ) {
	// 	args.contours.forEach(contour => {
	// 		this.contours.push( new Contour( contour ) );
	// 	});
	// }
}

Glyph.prototype = Object.create(Classify.prototype);
Glyph.prototype.constructor = Glyph;

Glyph.prototype.addContour = function( args ) {
	var contour = new Contour( args );
	this.contours.push( contour );
	return contour;
};

Glyph.prototype.addAnchor = function( args ) {
	var node = new Node( args );
	this.nodes.push( node );
	return node;
};

Glyph.prototype.update = function( font, params ) {
	// this.src.sortedProps.forEach(id => {
	// 	id = id.split('.');
	// 	var contour = this.contours(id[0]);

	// 	contour.nodes[id[1]].update( id[2], {
	// 		params: params,
	// 		glyph: this,
	// 		contour: contour
	// 	});
	// });

	this.anchors.forEach(anchor => anchor.update( params, this ));
	this.contours.forEach(contour => contour.update( params, this ));

	return this;
};

Glyph.prototype.gatherNodes = function() {
	return ( this.nodes = [].concat.apply(
		this.anchors,
		this.contours.map( contour => contour.nodes )
	));
};

export default Glyph;