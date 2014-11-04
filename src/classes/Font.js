import Glyph from './Glyph.js';
import Utils from './Utils.js';
import opentype from '../bower_components/opentype.js/opentype.js';

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

	this.familyName = fontSrc.info.familyName;
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

Font.prototype.toOT = function( chars, args ) {
	var font = new opentype.Font({
			familyName: args.familyName || this.familyName,
			styleName: args.styleName || 'Regular',
			unitsPerEm: 1024
		}),
		allChars = [
			new opentype.Glyph({
				name: '.notdef',
				unicode: 0,
				path: new opentype.Path()
			})
		];

	chars.forEach(char => {
		if ( this.cmap[char] ) {
			allChars.push( this.glyphs[ this.cmap[char] ].toOT() );
		}
	});

	font.glyphs = allChars;
console.log(font);
	return font;
};

Font.prototype.addToFonts = function( chars, args ) {
	document.fonts.add(
		new FontFace(
			'preview',
			this.toOT( chars, args ).toBuffer()
		)
	);
};

export default Font;