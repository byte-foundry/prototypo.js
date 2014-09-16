function Typeface( config ) {
	// remember config
	for ( var i in config ) {
		this[i] = config[i];
	}

	this.glyphs = {};
	this.info = {};
	this.kerning = {};
}

export default Typeface;