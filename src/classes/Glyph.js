import Classify from './Classify.js';
import Contour from './Contour.js';
import Node from './Node.js';
import Utils from './Utils.js';

function Glyph( args ) {
	Classify.prototype.constructor.apply( this );

	this.contours = [];
	this.anchors = [];
	this.components = [];
	this.parentAnchors = [];

	if ( args.src ) {
		this.src = args.src;
		this.fromSrc( args.src );
	}
}

Glyph.prototype = Object.create(Classify.prototype);
Glyph.prototype.constructor = Glyph;

Glyph.prototypo.fromSrc = function( glyphSrc/*, fontSrc*/ ) {
	Utils.mergeStatic( this, glyphSrc );

	if( glyphSrc.anchor ) {
		glyphSrc.anchor.forEach(anchorSrc => {
			Utils.createUpdaters( anchorSrc );

			this.addAnchor({ src: anchorSrc });
		});
	}

	if ( glyphSrc.outline && glyphSrc.outline.contour ) {
		glyphSrc.outline.contour.forEach(contourSrc => {
			this.addContour({ src: contourSrc });
		});
	}

	// if ( glyphSrc.outline && glyphSrc.outline.components ) {
	// 	glyphSrc.outline.components.forEach(componentSrc => {
	// 		var component = this.addComponent({ src: fontSrc[componentSrc.base] });
	// 		componentSrc.anchors.forEach(anchorSrc => {
	// 			Utils.createUpdaters( anchorSrc );

	// 			component.addParentAnchor({ src: anchorSrc });
	// 		});
	// 	});
	// }
};

Glyph.prototype.addContour = function( args ) {
	var contour = new Contour( args );
	this.contours.push( contour );
	return contour;
};

Glyph.prototype.addAnchor = function( args ) {
	var node = new Node( args );
	this.anchors.push( node );
	return node;
};

Glyph.prototype.addComponent = function( args ) {
	var component = new Glyph( args );
	this.components.push( component );
	return component;
};

Glyph.prototype.addParentAnchor = function( args ) {
	var node = new Node( args );
	this.parentAnchors.push( node );
	return node;
};

Glyph.prototype.update = function( params ) {
	this.anchors.forEach(anchor => anchor.update( params, this ));
	this.contours.forEach(contour => contour.update( params, this ));
	this.components.forEach(component => component.update( params, this ));

	return this;
};

Glyph.prototype.gatherNodes = function() {
	return ( this.nodes = [].concat.apply(
		this.anchors,
		this.contours.map( contour => contour.nodes )
	));
};

export default Glyph;