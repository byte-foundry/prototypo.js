var plumin = require('plumin.js'),
	paper = plumin.paper;

function ComponentMenu( args ) {
	paper.Group.prototype.constructor.apply( this );

	var circle = new paper.Shape.Circle(new paper.Point(16.4, 16.4), 16.4);
	circle.fillColor = 'black';
	var icon = new paper.CompoundPath('M27.1,16.1l-1.6-0.2c0-1.1-0.3-2.1-0.7-3.1l1.3-1c0.1-0.1,0.1-0.2,0.2-0.3 c0-0.1,0-0.2-0.1-0.3l-1.8-2.4c-0.1-0.1-0.2-0.1-0.3-0.2c-0.1,0-0.2,0-0.3,0.1l-1.2,0.9c-0.8-0.7-1.7-1.3-2.8-1.8L20,6.3 c0-0.1,0-0.2-0.1-0.3c-0.1-0.1-0.2-0.1-0.3-0.2l-3-0.4c-0.1,0-0.2,0-0.3,0.1c-0.1,0.1-0.1,0.2-0.2,0.3l-0.2,1.5 c-1.1,0-2.2,0.3-3.2,0.7l-0.9-1.2c-0.1-0.2-0.4-0.2-0.6-0.1L8.8,8.5C8.7,8.6,8.6,8.7,8.6,8.8c0,0.1,0,0.2,0.1,0.3l0.9,1.2 C8.8,11.1,8.2,12,7.8,13l-1.5-0.2c-0.1,0-0.2,0-0.3,0.1c-0.1,0.1-0.1,0.2-0.2,0.3l-0.4,3c0,0.2,0.1,0.4,0.3,0.5l1.5,0.2 C7.3,18,7.6,19.1,8,20.1l-1.3,1c-0.2,0.1-0.2,0.4-0.1,0.6L8.5,24c0.1,0.2,0.4,0.2,0.6,0.1l1.3-0.9c0.8,0.7,1.8,1.3,2.7,1.7 l-0.2,1.7c0,0.2,0.1,0.4,0.3,0.5l3,0.4c0,0,0,0,0.1,0c0.2,0,0.4-0.1,0.4-0.4l0.2-1.6c1.1-0.1,2.1-0.3,3.1-0.7l1,1.4 c0.1,0.2,0.4,0.2,0.6,0.1l2.4-1.8c0.1-0.1,0.1-0.2,0.2-0.3c0-0.1,0-0.2-0.1-0.3l-1-1.3c0.7-0.8,1.3-1.7,1.7-2.7l1.7,0.2 c0.2,0,0.4-0.1,0.5-0.3l0.4-3C27.4,16.4,27.3,16.2,27.1,16.1z M16.4,20.2c-2.1,0-3.8-1.7-3.8-3.8c0-2.1,1.7-3.8,3.8-3.8 s3.8,1.7,3.8,3.8C20.2,18.5,18.5,20.2,16.4,20.2z');
	icon.fillColor = 'green';
	icon.scale(1, -1);
	this.addChild(icon);
	this.addChild(circle);
	this.position = args.point;

}

ComponentMenu.prototype = Object.create(paper.Group.prototype);
ComponentMenu.prototype.constructor = ComponentMenu;

ComponentMenu.prototype.move = function( point ) {
	this.position = point;
}

//function ComponentMenuItem( args ) {
//}

module.exports = ComponentMenu;
