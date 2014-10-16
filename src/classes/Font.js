import Glyph from './Glyph.js';
import Utils from './Utils.js';

function Font( args ) {
	this.glyphs = {};
	this.cmap = args && args.src && args.src.info['glyph-order'];

	if ( args && args.src ) {
		this.src = args.src;
		this.fromSrc( args.src );
		Utils.mergeStatic( this, args.src );
	}
}

Font.prototype.fromSrc = function( fontSrc ) {
	for ( var name in fontSrc.glyphs ) {
		this.addGlyph( name, {
			src: fontSrc.glyphs[name],
			fontSrc: fontSrc
		});
	}
};

Font.prototype.addGlyph = function( name, args ) {
	return ( this.glyphs[name] = new Glyph( args ) );
};

Font.prototype.update = function( chars, params ) {
	var allChars = {};

	chars.forEach(char => {
		if ( this.cmap[char] ) {
			allChars[char] = this.glyphs[ this.cmap[char] ].update( params, this );
		}
	});

	return allChars;
};

export default Font;