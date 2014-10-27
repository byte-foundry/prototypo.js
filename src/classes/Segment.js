import Bezier from './bezier.js';

function Segment( start, end ) {
	Bezier.prototype.constructor.apply( this, [ start, start.lCtrl, end.rCtrl, end ] );

	this.start = start;
	this.end = end;
	this.lCtrl = this.start.lCtrl;
	this.rCtrl = this.end.rCtrl;
}

Segment.prototype = Object.create(Bezier.prototype);
Segment.prototype.constructor = Segment;

Segment.prototype.toString = function() {
	return [
		'C',
		this.lCtrl,
		this.rCtrl,
		this.end
	].join(' ');
};

export default Segment;