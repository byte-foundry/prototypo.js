import Glyph from './Glyph.js';

function Font() {
	this.glyphs = {};
}

Font.prototype.addGlyph = function( name, args ) {
	return this.glyphs[name] = new Glyph( args );
}

export default Font;