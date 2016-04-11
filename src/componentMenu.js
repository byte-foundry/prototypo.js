var plumin = require('plumin.js'),
	paper = plumin.paper;

function ComponentMenu( args ) {
	paper.Group.prototype.constructor.apply( this );

	var background = new paper.Shape.Rectangle(new paper.Point(0,0), new paper.Size(100 / this.getView().zoom, 100 / this.getView().zoom));
	background.fillColor = 'white';
	background.strokeColor = 'black';
	this.addChild(background);

	var titleBackground = new paper.Shape.Rectangle(new paper.Point(0, 80 / this.getView().zoom), new paper.Size( 100 / this.getView().zoom, 20 / this.getView().zoom));
	titleBackground.fillColor = '#24d390';
	this.addChild(titleBackground);
	var title = new paper.PointText(new paper.Point(2,80));
	title.fontSize = 10 / this.getView().zoom;
	title.content = 'Choose a component';
	title.scale(1, -1);
	title.fillColor = 'white';
	this.addChild(title);

	this.pivot = background.bounds.topLeft;
	this.position = args.point;

}

ComponentMenu.prototype = Object.create(paper.Group.prototype);
ComponentMenu.prototype.constructor = ComponentMenu;

//function ComponentMenuItem( args ) {
//}

module.exports = ComponentMenu;
