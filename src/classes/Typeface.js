function Typeface( config ) {
	// remember config
	for ( var i in config ) {
		this[i] = config[i];
	}

	this.components = {};
	this.characters = {};
}

export default Typeface;