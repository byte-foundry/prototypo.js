function Group( classes = [] ) {
	this.classes = typeof classes === 'string' ?
		classes.split(' '):
		classes;
	this._children = [];
}

Group.prototype.is = function( className ) {
	return this.classes
		.indexOf( className.replace(/^\./, '') ) !== -1;
};

Group.prototype.children = function( className ) {
	return className ?
		this._children.filter( child => child.is( className ) ) :
		this._children;
};

Group.prototype.append = function( ...children ) {
	this._children.push( ...children );

	return this;
};

Group.prototype.transform = function( m ) {
	// m.constructor === SVGMatrix
	if ( m.constructor !== Float32Array ) {
		m = new Float32Array( m.a, m.b, m.c, m.d, m.e, m.f );
	}

	var coords0 = this.coords[0];
	this.coords[0] = m[0] * coords0 + m[2] * this.coords[1] + m[4];
	this.coords[1] = m[1] * coords0 + m[3] * this.coords[1] + m[5];

	this.children().forEach( child => child.transform( m ) );
}

export default Group;