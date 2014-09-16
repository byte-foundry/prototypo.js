/*jshint -W030 */

import Point from './Point.js';


describe('Point structure', function() {

	var _Point, p0, p1, p2, p3, p4, p5, p6;

	beforeEach(function() {
		_Point = Point;
		p0 = new Point(3,6);
		p1 = new Point(2,5);
		p2 = new Point([2,5]);
		p3 = new Point('2','5');
		p4 = new Point(['2','5']);
		p5 = new Point(p1);
		p6 = new Point({x: 2, y: 5});
	});

	it('accepts two args: x and y', function() {
		expect(p0.constructor).to.be.equal(Point);

		expect(p0.x).to.equal(3);
		expect(p0.y).to.equal(6);

		expect(p1.x).to.equal(2);
		expect(p1.y).to.equal(5);
	});

	it('accepts an array arg: [x,y]', function() {
		expect(p2.x).to.equal(2);
		expect(p2.y).to.equal(5);
	});

	it('accepts an object arg: {x:x,y:y}',function() {
		expect(p6.x).to.equal(2);
		expect(p6.y).to.equal(5);
	});

	it('accepts number and string args and turns them into numbers', function() {
		expect(p3.x).to.be.a('number');
		expect(p4.x).to.be.a('number');
	});

	it('can be serialized', function() {
		expect(p1 + '').to.equal('2 5');
	});

	it('accepts a Point as an argument, and this results in an independent clone', function() {
		p1.x = 4;
		p1.y = 7;

		expect(p5.x).to.equal(2);
		expect(p5.y).to.equal(5);
	});

	it('accepts undefined parameters', function() {
		var p1 = new Point( undefined, 5 );
		expect(p1.x).to.deep.equal(NaN);
		expect(p1.y).to.equal(5);

		var p2 = new Point( 2, undefined );
		expect(p2.y).to.deep.equal(NaN);
		expect(p2.x).to.equal(2);

		var p3 = new Point([undefined, 5]);
		expect(p3.x).to.deep.equal(NaN);
		expect(p3.y).to.equal(5);

		var p4 = new Point([2, undefined]);
		expect(p4.y).to.deep.equal(NaN);
		expect(p4.x).to.equal(2);

		var p5 = new Point({y: 5});
		expect(p5.x).to.deep.equal(NaN);
		expect(p5.y).to.equal(5);

		var p6 = new Point({x: 2});
		expect(p6.y).to.deep.equal(NaN);
		expect(p6.x).to.equal(2);
	});
});

describe('translatePoint', function () {

	var _Point, p0, p1, p2, p3, p4, p5, p6;

	beforeEach(function() {
		_Point = Point;
		p0 = new Point(3,6);
		p1 = new Point(2,5);
		p2 = new Point([2,5]);
		p3 = new Point('2','5');
		p4 = new Point(['2','5']);
		p5 = new Point(p1);
		p6 = new Point({x: 2, y: 5});
	});

	it('can translate a Point on x axis', function() {
		var p1 = new Point(2,5);
		p1.translateX(4);

		expect(p1.x).to.equal(6);
	});

	it('can translate a Point on y axis', function() {
		var p1 = new Point(2,5);
		p1.translateY(-2);

		expect(p1.y).to.equal(3);
	});

	it('can translate a Point on x and y axis', function() {
		var p1 = new Point(2,5);
		p1.translate(4,-2);

		expect(p1.x).to.equal(6);
		expect(p1.y).to.equal(3);
	});

	it('can translate a Point with NaN coords', function() {
		var p1 = new Point(2,undefined);
		p1.translate(4,-2);

		expect(p1.x).to.equal(6);
		expect(p1.y).to.deep.equal(NaN);

		var p2 = new Point(undefined,5);
		p2.translate(4,-2);

		expect(p2.y).to.equal(3);
		expect(p2.x).to.deep.equal(NaN);
	});

	it('accepts the same arguments in Point constructor and translate method', function() {
		expect( (new Point(0,0)).translate( 10, 20 ).toString() ).to.equal('10 20');
		expect( (new Point(0,0)).translate( [10, 20] ).toString() ).to.equal('10 20');
		expect( (new Point(0,0)).translate( {x: 10, y: 20} ).toString() ).to.equal('10 20');
		expect( (new Point(0,0)).translate( new Point(10, 20) ).toString() ).to.equal('10 20');
	});
});

/*describe('Point structure', function () {

	beforeEach(module('prototypo.Point', 'prototypo.Segment'));

	var seg1,
		seg2,
		p1,
		p2,
		p3,
		p4;

	beforeEach(inject(function( Segment, Point ) {
		seg1 = Segment( 'L 50 100', Point(0,0) );
		seg2 = Segment( 'M 30 -20', Point(-20, 80) );
		p1 = Point(40,80);
		p2 = Point(10,20);
		p3 = Point(-20,80);
		p4 = Point(30,-20);
	}));

	it('should find a point on a straight Segment, given x or y', inject(function( pointOn ) {
		expect(pointOn({ x: 20 }, seg1).toString()).to.equal('20 40');

		expect(pointOn({ y: 60 }, seg1).toString()).to.equal('30 60');

		expect(pointOn({ x: 0 }, seg2).toString()).to.equal('0 40');

		expect(pointOn({ y: 0 }, seg2).toString()).to.equal('20 0');
	}));

	it('should find a point between two Points, given x or y', inject(function( pointOn ) {
		expect(pointOn({ x: 20 }, [p1,p2]).toString()).to.equal('20 40');

		expect(pointOn({ y: 60 }, [p1,p2]).toString()).to.equal('30 60');

		expect(pointOn({ x: 0 }, [p3,p4]).toString()).to.equal('0 40');

		expect(pointOn({ y: 0 }, [p3,p4]).toString()).to.equal('20 0');
	}));

	it('handles undefined .on, given x or y', inject(function( pointOn ) {
		expect(pointOn({ x: 20 }, undefined).toString()).to.equal('20 NaN');

		expect(pointOn({ y: 60 }, undefined).toString()).to.equal('NaN 60');

		expect(pointOn({ x: 20 }, [undefined, p1]).toString()).to.equal('20 NaN');

		expect(pointOn({ y: 60 }, [p1, undefined]).toString()).to.equal('NaN 60');
	}));

	it('should find the intersection of two lines', inject(function( pointOn, Segment, Point ) {
		expect(pointOn([], [
			Segment('L 50 50', Point(0,0)),
			Segment('L 50 0', Point(0,50))
		]).toString()).to.equal('25 25');

		expect(pointOn([], [
			[Point(0,0), Segment('L 50 50', Point(0,0))],
			[Segment('L 50 0', Point(0,50)), Point(0,50)]
		]).toString()).to.equal('25 25');

		expect(pointOn([], [
			[Point(0,0), [50, 50]],
			[{x: 50, y: 0}, Point(0,50)]
		]).toString()).to.equal('25 25');
	}));
});*/