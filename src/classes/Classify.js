function Classify( args = {} ) {
	if ( !args.tags ) {
		args.tags = [];
	}
	var self = this;

	this._tags = typeof args.tags === 'string' ?
		args.tags.split(' '):
		args.tags;

	this.type = args.type;

	this.tags = {
		add() {
			Array.prototype.slice.call(arguments, 0).forEach(tag => {
				if ( self._tags.indexOf( tag ) === -1 ) {
					self._tags.push( tag );
				}
			});
		},
		remove() {
			Array.prototype.slice.call(arguments, 0).forEach(tag => {
				var i = self._tags.indexOf( tag );
				if ( i !== -1 ) {
					self._tags.splice( i, 1 );
				}
			});
		},
		has() {
			var has = true;

			Array.prototype.slice.call(arguments, 0).forEach(tag => {
				if ( self._tags.indexOf( tag ) === -1 ) {
					has = false;
				}
			});

			return has;
		}
	};
}

export default Classify;