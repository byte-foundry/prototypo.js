import Classify from './Classify.js';

function Glyph( args ) {
	Classify.prototype.constructor.apply( this );

	this.contours = [];
	if ( args.contours ) {
		args.contours.forEach(contour => {
			this.contours.push( new Node( contour ) );
		});
	}
}

Glyph.prototype = Object.create(Classify.prototype);
Glyph.prototype.constructor = Glyph;

Glyph.prototype.update = function( params ) {
	this.src.sortedCoords.forEach(id => {
		id = id.split('.');
		var contour = this.contours(id[0]);

		contour.nodes[id[1]].update( id[2], {
			params: params,
			glyph: this,
			contour: contour
		});
	});
};

export default Glyph;