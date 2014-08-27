class Leaf {
	constructor( className = '' ) {
		this.className = className;
		this._children = [];
	}

	is( className ) {
		return this.className.split(' ').indexOf( className ) !== -1;
	}

	children( className ) {
		return className ?
			this._children.filter( child => child.is( className ) ) :
			this._children;
	}

	append( ...children ) {
		this._children.push( ...children );

		return this;
	}
}

export default Leaf;