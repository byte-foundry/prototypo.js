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

	if ( chars === true ) {
		chars = Object.keys( this.cmap );
	}

	chars.forEach(char => {
		if ( this.cmap[char] ) {
			allChars[char] = this.glyphs[ this.cmap[char] ].update( params, this );
		}
	});

	return allChars;
};

Font.prototype.toSVG = function( chars ) {
	var allChars = [];

	if ( chars === true ) {
		chars = Object.keys( this.cmap );
	}

	chars.sort().forEach(char => {
		if ( this.cmap[char] ) {
			this.glyphs[ this.cmap[char] ].toSVG();
			allChars.push( this.glyphs[ this.cmap[char] ] );
		}
	});

	return allChars;
};

Font.prototype.toOT = function( chars, args ) {
	var font = new opentype.Font({
			familyName: ( args && args.familyName ) || this.familyName,
			styleName: ( args && args.styleName ) || 'Regular',
			unitsPerEm: 1024
		}),
		allChars = [
			new opentype.Glyph({
				name: '.notdef',
				unicode: 0,
				path: new opentype.Path()
			})
		];

	if ( chars === true ) {
		chars = Object.keys( this.cmap );
	}

	chars.sort().forEach(char => {
		if ( this.cmap[char] ) {
			allChars.push( this.glyphs[ this.cmap[char] ].toOT() );
		}
	});

	font.glyphs = allChars;

	return font;
};

var _URL = window.URL || window.webkitURL,
	ruleIndex;
Font.prototype.addToFonts = document.fonts ?
	// CSS font loading, lightning fast
	function( chars, args ) {
		document.fonts.add(
			new FontFace(
				'preview',
				this.toOT( chars, args ).toBuffer()
			)
		);
	}:
	function( chars, args ) {
		var url = _URL.createObjectURL(
			new Blob(
				[ new DataView( this.toOT( chars, args ).toBuffer() ) ],
				{type: 'font/opentype'}
			)
		);

		if ( ruleIndex ) {
			document.styleSheets[0].deleteRule( ruleIndex );
		}

		ruleIndex = document.styleSheets[0].insertRule(
			'@font-face { font-family: "preview"; src: url(' + url + '); }',
			ruleIndex || document.styleSheets[0].cssRules.length
		);
	};

export default Font;