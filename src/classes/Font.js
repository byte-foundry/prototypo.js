import Glyph from './Glyph.js';

function Font( args ) {
	this.glyphs = {};
	this.src = args && args.src;
	this.cmap = args && args.src && args.src.info['glyph-order'];
}

Font.prototype.addGlyph = function( name, args ) {
	return ( this.glyphs[name] = new Glyph( args ) );
};

Font.prototype.update = function( chars, params ) {
	var allChars = {};

	chars.forEach(char => {
		if ( this.cmap[char] ) {
			allChars[char] = this.glyphs[ this.cmap[char] ].update( this, params );
		}
	});

	return allChars;
};

export default Font;