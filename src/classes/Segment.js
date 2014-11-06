function Segment( start, end ) {
	this.start = start;
	this.end = end;
	this.lCtrl = this.start.lCtrl;
	this.rCtrl = this.end.rCtrl;
}

Segment.prototype.toString = function() {
	return [
		'C',
		this.lCtrl,
		this.rCtrl,
		this.end
	].join(' ');
};

export default Segment;