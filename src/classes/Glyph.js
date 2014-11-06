import Classify from './Classify.js';
import Contour from './Contour.js';
import Node from './Node.js';
import Utils from './Utils.js';
import opentype from '../bower_components/opentype.js/opentype.js';

function Glyph( args ) {
	Classify.prototype.constructor.apply( this );

	this.contours = [];
	this.anchors = [];
	this.components = [];
	this.parentAnchors = [];

	if ( args && args.src ) {
		this.src = args.src;
		this.fromSrc( args.src, args.fontSrc );
		Utils.mergeStatic( this, args.src );
	}
}

Glyph.prototype = Object.create(Classify.prototype);
Glyph.prototype.constructor = Glyph;

Glyph.prototype.fromSrc = function( glyphSrc, fontSrc ) {
	Utils.createUpdaters( glyphSrc );

	if( glyphSrc.anchor ) {
		glyphSrc.anchor.forEach(anchorSrc => {
			this.addAnchor({ src: anchorSrc });
		});
	}

	if ( glyphSrc.outline && glyphSrc.outline.contour ) {
		glyphSrc.outline.contour.forEach(contourSrc => {
			this.addContour({ src: contourSrc });
		});
	}

	if ( glyphSrc.outline && glyphSrc.outline.component ) {
		glyphSrc.outline.component.forEach(componentSrc => {
			var component = this.addComponent({ src: fontSrc.glyphs[componentSrc.base] });
			componentSrc.anchor.forEach(anchorSrc => {
				component.addParentAnchor({ src: anchorSrc });
			});

			component.parentTransform = componentSrc.transform;
		});
	}
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

	this.gatherNodes();

	return this;
};

Glyph.prototype.gatherNodes = function() {
	return ( this.allNodes = [].concat.apply(
		this.anchors,
		this.gatherContours().map( contour => contour.nodes )
	));
};

Glyph.prototype.gatherContours = function() {
	return ( this.allContours = [].concat.apply(
		this.contours,
		this.components.map( component => component.contours )
	));
};

Glyph.prototype.transform = function( matrix, withControls ) {

	// transform from sources if no matrix is provided
	if ( !matrix ) {
		matrix = this.parentTransform;

		if ( this.src && this.src.transform ) {
			matrix = matrix ?
				Utils.matrixProduct( matrix, this.src.transform ):
				this.src.transform;
		}
	}

	if ( matrix ) {
		this.anchors.forEach(anchor => anchor.transform( matrix, withControls ));
		this.contours.forEach(contour => contour.transform( matrix, withControls ));
		this.components.forEach(component => component.transform( matrix, withControls ));
	}
};

Glyph.prototype.toOT = function() {
	var path = new opentype.Path();

	this.allContours.forEach(function( contour ) {
		contour.toOT( path );
	});

	return new opentype.Glyph({
        name: this.name,
        unicode: this.unicode,
        path: path,
        advanceWidth: this.advanceWidth || 512
    });
};

export default Glyph;