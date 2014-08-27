define(['./Point.js'], function($__0) {
  "use strict";
  if (!$__0 || !$__0.__esModule)
    $__0 = {default: $__0};
  var Point = $__0.default;
  describe('Point structure', function() {
    var _Point,
        p0,
        p1,
        p2,
        p3,
        p4,
        p5,
        p6;
    beforeEach(function() {
      _Point = Point;
      p0 = new Point(3, 6);
      p1 = Point(2, 5);
      p2 = Point([2, 5]);
      p3 = Point('2', '5');
      p4 = Point(['2', '5']);
      p5 = Point(p1);
      p6 = Point({
        x: 2,
        y: 5
      });
    });
    it('can be called with or without new', function() {
      expect(p0 instanceof _Point).to.be.true;
      expect(p1 instanceof _Point).to.be.true;
    });
    it('accepts two args: x and y', function() {
      expect(p0.x).to.equal(3);
      expect(p0.y).to.equal(6);
      expect(p1.x).to.equal(2);
      expect(p1.y).to.equal(5);
    });
    it('accepts an array arg: [x,y]', function() {
      expect(p2.x).to.equal(2);
      expect(p2.y).to.equal(5);
    });
    it('accepts an object arg: {x:x,y:y}', function() {
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
      var p1 = Point(undefined, 5);
      expect(p1.x).to.deep.equal(NaN);
      expect(p1.y).to.equal(5);
      var p2 = Point(2, undefined);
      expect(p2.y).to.deep.equal(NaN);
      expect(p2.x).to.equal(2);
      var p3 = Point([undefined, 5]);
      expect(p3.x).to.deep.equal(NaN);
      expect(p3.y).to.equal(5);
      var p4 = Point([2, undefined]);
      expect(p4.y).to.deep.equal(NaN);
      expect(p4.x).to.equal(2);
      var p5 = Point({y: 5});
      expect(p5.x).to.deep.equal(NaN);
      expect(p5.y).to.equal(5);
      var p6 = Point({x: 2});
      expect(p6.y).to.deep.equal(NaN);
      expect(p6.x).to.equal(2);
    });
  });
  describe('translatePoint', function() {
    var _Point,
        p0,
        p1,
        p2,
        p3,
        p4,
        p5,
        p6;
    beforeEach(function() {
      _Point = Point;
      p0 = new Point(3, 6);
      p1 = Point(2, 5);
      p2 = Point([2, 5]);
      p3 = Point('2', '5');
      p4 = Point(['2', '5']);
      p5 = Point(p1);
      p6 = Point({
        x: 2,
        y: 5
      });
    });
    it('can translate a Point on x axis', function() {
      var p1 = Point(2, 5);
      p1.translateX(4);
      expect(p1.x).to.equal(6);
    });
    it('can translate a Point on y axis', function() {
      var p1 = Point(2, 5);
      p1.translateY(-2);
      expect(p1.y).to.equal(3);
    });
    it('can translate a Point on x and y axis', function() {
      var p1 = Point(2, 5);
      p1.translate(4, -2);
      expect(p1.x).to.equal(6);
      expect(p1.y).to.equal(3);
    });
    it('can translate a Point with NaN coords', function() {
      var p1 = Point(2, undefined);
      p1.translate(4, -2);
      expect(p1.x).to.equal(6);
      expect(p1.y).to.deep.equal(NaN);
      var p2 = Point(undefined, 5);
      p2.translate(4, -2);
      expect(p2.y).to.equal(3);
      expect(p2.x).to.deep.equal(NaN);
    });
    it('accepts the same arguments in Point constructor and translate method', function() {
      expect(Point(0, 0).translate(10, 20).toString()).to.equal('10 20');
      expect(Point(0, 0).translate([10, 20]).toString()).to.equal('10 20');
      expect(Point(0, 0).translate({
        x: 10,
        y: 20
      }).toString()).to.equal('10 20');
      expect(Point(0, 0).translate(Point(10, 20)).toString()).to.equal('10 20');
    });
  });
  return {};
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiY2xhc3Nlcy9Qb2ludC5zcGVjLmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMTAiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvMCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxLQUFLLEFBQUMsRUNFWSxZQUFXLEVDRjdCLFVBQVMsSUFBZ0I7O0FDQXpCLEtBQUksS0FBaUIsR0FBSyxFQUFDLGVBQTJCO0FBQzFDLFNBQW9CLEVBQUMsT0FBTSxNQUFtQixDQUFDLENBQUE7QUFBQSxJRkNwRCxNQUFJO0FBR1gsU0FBTyxBQUFDLENBQUMsaUJBQWdCLENBQUcsVUFBUSxBQUFDLENBQUU7QUFFdEMsQUFBSSxNQUFBLENBQUEsTUFBSztBQUFHLFNBQUM7QUFBRyxTQUFDO0FBQUcsU0FBQztBQUFHLFNBQUM7QUFBRyxTQUFDO0FBQUcsU0FBQztBQUFHLFNBQUMsQ0FBQztBQUV0QyxhQUFTLEFBQUMsQ0FBQyxTQUFRLEFBQUMsQ0FBRTtBQUNyQixXQUFLLEVBQUksTUFBSSxDQUFDO0FBQ2QsT0FBQyxFQUFJLElBQUksTUFBSSxBQUFDLENBQUMsQ0FBQSxDQUFFLEVBQUEsQ0FBQyxDQUFDO0FBQ25CLE9BQUMsRUFBSSxDQUFBLEtBQUksQUFBQyxDQUFDLENBQUEsQ0FBRSxFQUFBLENBQUMsQ0FBQztBQUNmLE9BQUMsRUFBSSxDQUFBLEtBQUksQUFBQyxDQUFDLENBQUMsQ0FBQSxDQUFFLEVBQUEsQ0FBQyxDQUFDLENBQUM7QUFDakIsT0FBQyxFQUFJLENBQUEsS0FBSSxBQUFDLENBQUMsR0FBRSxDQUFFLElBQUUsQ0FBQyxDQUFDO0FBQ25CLE9BQUMsRUFBSSxDQUFBLEtBQUksQUFBQyxDQUFDLENBQUMsR0FBRSxDQUFFLElBQUUsQ0FBQyxDQUFDLENBQUM7QUFDckIsT0FBQyxF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QUFDLENBQUUsU0FBUSxDQUFHLEVBQUEsQ0FBRSxDQUFDO0FBQzlCLFdBQUssQUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxNQUFNLEFBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQztBQUMvQixXQUFLLEFBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQUFBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRXhCLEFBQUksUUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLEtBQUksQUFBQyxDQUFFLENBQUEsQ0FBRyxVQUFRLENBQUUsQ0FBQztBQUM5QixXQUFLLEFBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssTUFBTSxBQUFDLENBQUMsR0FBRSxDQUFDLENBQUM7QUFDL0IsV0FBSyxBQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEFBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUV4QixBQUFJLFFBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxLQUFJLEFBQUMsQ0FBQyxDQUFDLFNBQVEsQ0FBRyxFQUFBLENBQUMsQ0FBQyxDQUFDO0FBQzlCLFdBQUssQUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxNQUFNLEFBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQztBQUMvQixXQUFLLEFBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQUFBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRXhCLEFBQUksUUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLEtBQUksQUFBQyxDQUFDLENBQUMsQ0FBQSxDQUFHLFVBQVEsQ0FBQyxDQUFDLENBQUM7QUFDOUIsV0FBSyxBQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsR0FBRyxLQUFLLE1BQU0sQUFBQyxDQUFDLEdBQUUsQ0FBQyxDQUFDO0FBQy9CLFdBQUssQUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxBQUFDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFeEIsQUFBSSxRQUFBLENBQUEsRUFBQyxFQUFJ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QyxVQUFVLEFBQUMsQ0FBQyxDQUFBLENBQUUsRUFBQyxDQUFBLENBQUMsQ0FBQztBQUVsQixXQUFLLEFBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQUFBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBQ3hCLFdBQUssQUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxBQUFDLENBQUMsQ0FBQSxDQUFDLENBQUM7SUFDekIsQ0FBQyxDQUFDO0FBRUYsS0FBQyxBQUFDLENBQUMsdUNBQXNDLENBQUcsVUFBUSxBQUFDLENBQUU7QUFDdEQsQUFBSSxRQUFBLENBQUEsRUFBQyxFQUFJLENBQUEsS0FBSSxBQUFDLENBQUMsQ0FBQSxDQUFFLFVBQVEsQ0FBQyxDQUFDO0FBQzNCLE9BQUMsVUFBVSxBQUFDLENBQUMsQ0FBQSxDQUFFLEVBQUMsQ0FBQSxDQUFDLENBQUM7QUFFbEIsV0FBSyxBQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEFBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUN4QixXQUFLLEFBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssTUFBTSxBQUFDLENBQUMsR0FBRSxDQUFDLENBQUM7QUFFL0IsQUFBSSxRQUFBLENBQUEsRUFBQyxFQUFJLENBQUEsS0FBSSxBQUFDLENBQUMsU0FBUSxDQUFFLEVBQUEsQ0FBQyxDQUFDO0FBQzNCLE9BQUMsVUFBVSxBQUFDLENBQUMsQ0FBQSxDQUFFLEVBQUMsQ0FBQSxDQUFDLENBQUM7QUFFbEIsV0FBSyxBQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEFBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUN4QixXQUFLLEFBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssTUFBTSxBQUFDLENBQUMsR0FBRSxDQUFDLENBQUM7SUFDaEMsQ0FBQyxDQUFDO0FBRUYsS0FBQyxBQUFDLENBQUMsc0VBQXFFLENBQUcsVUFBUSxBQUFDLENBQUU7QUFDckYsV0FBSyxBQUFDLENBQUUsS0FBSSxBQUFDLENBQUMsQ0FBQSxDQUFFLEVBQUEsQ0FBQyxVQUFVLEFBQUMsQ0FBRSxFQUFDLENBQUcsR0FBQyxDQUFFLFNBQVMsQUFBQyxFQUFDLENBQUUsR0FBRyxNQUFNLEFBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQztBQUNyRSxXQUFLLEFBQUMsQ0FBRSxLQUFJLEFBQUMsQ0FBQyxDQUFBLENBQUUsRUFBQSxDQUFDLFVBQVUsQUFBQyxDQUFFLENBQUMsRUFBQyxDQUFHLEdBQUMsQ0FBQyxDQUFFLFNBQVMsQUFBQyxFQUFDLENBQUUsR0FBRyxNQUFNLEFBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQztBQUN2RSxXQUFLLEFBQUMsQ0FBRSxLQUFJLEFBQUMsQ0FBQyxDQUFBLENBQUUsRUFBQSxDQUFDLFVBQVUsQUFBQyxDQUFFO0FBQUMsUUFBQSxDQUFHLEdBQUM7QUFBRyxRQUFBLENBQUcsR0FBQztBQUFBLE1BQUMsQ0FBRSxTQUFTLEFBQUMsRUFBQyxDQUFFLEdBQUcsTUFBTSxBQUFDLENBQUMsT0FBTSxDQUFDLENBQUM7QUFDN0UsV0FBSyxBQUFDLENBQUUsS0FBSSxBQUFDLENBQUMsQ0FBQSxDQUFFLEVBQUEsQ0FBQyxVQUFVLEFBQUMsQ0FBRSxLQUFJLEFBQUMsQ0FBQyxFQUFDLENBQUcsR0FBQyxDQUFDLENBQUUsU0FBUyxBQUFDLEVBQUMsQ0FBRSxHQUFHLE1BQU0sQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDO0lBQzdFLENBQUMsQ0FBQztFQUNILENBQUMsQ0FBQztBR2hKRixXQUF1QjtBRkVuQixDRkZ1QyxDQUFDO0FDb054QyIsImZpbGUiOiJjbGFzc2VzL1BvaW50LnNwZWMuanMiLCJzb3VyY2VSb290IjoiLi4iLCJzb3VyY2VzQ29udGVudCI6WyJkZWZpbmUoJF9fcGxhY2Vob2xkZXJfXzAsICRfX3BsYWNlaG9sZGVyX18xKTsiLCIvKmpzaGludCAtVzAzMCAqL1xuXG5pbXBvcnQgUG9pbnQgZnJvbSAnLi9Qb2ludC5qcyc7XG5cblxuZGVzY3JpYmUoJ1BvaW50IHN0cnVjdHVyZScsIGZ1bmN0aW9uKCkge1xuXG5cdHZhciBfUG9pbnQsIHAwLCBwMSwgcDIsIHAzLCBwNCwgcDUsIHA2O1xuXG5cdGJlZm9yZUVhY2goZnVuY3Rpb24oKSB7XG5cdFx0X1BvaW50ID0gUG9pbnQ7XG5cdFx0cDAgPSBuZXcgUG9pbnQoMyw2KTtcblx0XHRwMSA9IFBvaW50KDIsNSk7XG5cdFx0cDIgPSBQb2ludChbMiw1XSk7XG5cdFx0cDMgPSBQb2ludCgnMicsJzUnKTtcblx0XHRwNCA9IFBvaW50KFsnMicsJzUnXSk7XG5cdFx0cDUgPSBQb2ludChwMSk7XG5cdFx0cDYgPSBQb2ludCh7eDogMiwgeTogNX0pO1xuXHR9KTtcblxuXHRpdCgnY2FuIGJlIGNhbGxlZCB3aXRoIG9yIHdpdGhvdXQgbmV3JywgZnVuY3Rpb24oKSB7XG5cdFx0ZXhwZWN0KHAwIGluc3RhbmNlb2YgX1BvaW50KS50by5iZS50cnVlO1xuXHRcdGV4cGVjdChwMSBpbnN0YW5jZW9mIF9Qb2ludCkudG8uYmUudHJ1ZTtcblx0fSk7XG5cblx0aXQoJ2FjY2VwdHMgdHdvIGFyZ3M6IHggYW5kIHknLCBmdW5jdGlvbigpIHtcblx0XHRleHBlY3QocDAueCkudG8uZXF1YWwoMyk7XG5cdFx0ZXhwZWN0KHAwLnkpLnRvLmVxdWFsKDYpO1xuXG5cdFx0ZXhwZWN0KHAxLngpLnRvLmVxdWFsKDIpO1xuXHRcdGV4cGVjdChwMS55KS50by5lcXVhbCg1KTtcblx0fSk7XG5cblx0aXQoJ2FjY2VwdHMgYW4gYXJyYXkgYXJnOiBbeCx5XScsIGZ1bmN0aW9uKCkge1xuXHRcdGV4cGVjdChwMi54KS50by5lcXVhbCgyKTtcblx0XHRleHBlY3QocDIueSkudG8uZXF1YWwoNSk7XG5cdH0pO1xuXG5cdGl0KCdhY2NlcHRzIGFuIG9iamVjdCBhcmc6IHt4OngseTp5fScsZnVuY3Rpb24oKSB7XG5cdFx0ZXhwZWN0KHA2LngpLnRvLmVxdWFsKDIpO1xuXHRcdGV4cGVjdChwNi55KS50by5lcXVhbCg1KTtcblx0fSk7XG5cblx0aXQoJ2FjY2VwdHMgbnVtYmVyIGFuZCBzdHJpbmcgYXJncyBhbmQgdHVybnMgdGhlbSBpbnRvIG51bWJlcnMnLCBmdW5jdGlvbigpIHtcblx0XHRleHBlY3QocDMueCkudG8uYmUuYSgnbnVtYmVyJyk7XG5cdFx0ZXhwZWN0KHA0LngpLnRvLmJlLmEoJ251bWJlcicpO1xuXHR9KTtcblxuXHRpdCgnY2FuIGJlIHNlcmlhbGl6ZWQnLCBmdW5jdGlvbigpIHtcblx0XHRleHBlY3QocDEgKyAnJykudG8uZXF1YWwoJzIgNScpO1xuXHR9KTtcblxuXHRpdCgnYWNjZXB0cyBhIFBvaW50IGFzIGFuIGFyZ3VtZW50LCBhbmQgdGhpcyByZXN1bHRzIGluIGFuIGluZGVwZW5kZW50IGNsb25lJywgZnVuY3Rpb24oKSB7XG5cdFx0cDEueCA9IDQ7XG5cdFx0cDEueSA9IDc7XG5cblx0XHRleHBlY3QocDUueCkudG8uZXF1YWwoMik7XG5cdFx0ZXhwZWN0KHA1LnkpLnRvLmVxdWFsKDUpO1xuXHR9KTtcblxuXHRpdCgnYWNjZXB0cyB1bmRlZmluZWQgcGFyYW1ldGVycycsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBwMSA9IFBvaW50KCB1bmRlZmluZWQsIDUgKTtcblx0XHRleHBlY3QocDEueCkudG8uZGVlcC5lcXVhbChOYU4pO1xuXHRcdGV4cGVjdChwMS55KS50by5lcXVhbCg1KTtcblxuXHRcdHZhciBwMiA9IFBvaW50KCAyLCB1bmRlZmluZWQgKTtcblx0XHRleHBlY3QocDIueSkudG8uZGVlcC5lcXVhbChOYU4pO1xuXHRcdGV4cGVjdChwMi54KS50by5lcXVhbCgyKTtcblxuXHRcdHZhciBwMyA9IFBvaW50KFt1bmRlZmluZWQsIDVdKTtcblx0XHRleHBlY3QocDMueCkudG8uZGVlcC5lcXVhbChOYU4pO1xuXHRcdGV4cGVjdChwMy55KS50by5lcXVhbCg1KTtcblxuXHRcdHZhciBwNCA9IFBvaW50KFsyLCB1bmRlZmluZWRdKTtcblx0XHRleHBlY3QocDQueSkudG8uZGVlcC5lcXVhbChOYU4pO1xuXHRcdGV4cGVjdChwNC54KS50by5lcXVhbCgyKTtcblxuXHRcdHZhciBwNSA9IFBvaW50KHt5OiA1fSk7XG5cdFx0ZXhwZWN0KHA1LngpLnRvLmRlZXAuZXF1YWwoTmFOKTtcblx0XHRleHBlY3QocDUueSkudG8uZXF1YWwoNSk7XG5cblx0XHR2YXIgcDYgPSBQb2ludCh7eDogMn0pO1xuXHRcdGV4cGVjdChwNi55KS50by5kZWVwLmVxdWFsKE5hTik7XG5cdFx0ZXhwZWN0KHA2LngpLnRvLmVxdWFsKDIpO1xuXHR9KTtcbn0pO1xuXG5kZXNjcmliZSgndHJhbnNsYXRlUG9pbnQnLCBmdW5jdGlvbiAoKSB7XG5cblx0dmFyIF9Qb2ludCwgcDAsIHAxLCBwMiwgcDMsIHA0LCBwNSwgcDY7XG5cblx0YmVmb3JlRWFjaChmdW5jdGlvbigpIHtcblx0XHRfUG9pbnQgPSBQb2ludDtcblx0XHRwMCA9IG5ldyBQb2ludCgzLDYpO1xuXHRcdHAxID0gUG9pbnQoMiw1KTtcblx0XHRwMiA9IFBvaW50KFsyLDVdKTtcblx0XHRwMyA9IFBvaW50KCcyJywnNScpO1xuXHRcdHA0ID0gUG9pbnQoWycyJywnNSddKTtcblx0XHRwNSA9IFBvaW50KHAxKTtcblx0XHRwNiA9IFBvaW50KHt4OiAyLCB5OiA1fSk7XG5cdH0pO1xuXG5cdGl0KCdjYW4gdHJhbnNsYXRlIGEgUG9pbnQgb24geCBheGlzJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHAxID0gUG9pbnQoMiw1KTtcblx0XHRwMS50cmFuc2xhdGVYKDQpO1xuXG5cdFx0ZXhwZWN0KHAxLngpLnRvLmVxdWFsKDYpO1xuXHR9KTtcblxuXHRpdCgnY2FuIHRyYW5zbGF0ZSBhIFBvaW50IG9uIHkgYXhpcycsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBwMSA9IFBvaW50KDIsNSk7XG5cdFx0cDEudHJhbnNsYXRlWSgtMik7XG5cblx0XHRleHBlY3QocDEueSkudG8uZXF1YWwoMyk7XG5cdH0pO1xuXG5cdGl0KCdjYW4gdHJhbnNsYXRlIGEgUG9pbnQgb24geCBhbmQgeSBheGlzJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHAxID0gUG9pbnQoMiw1KTtcblx0XHRwMS50cmFuc2xhdGUoNCwtMik7XG5cblx0XHRleHBlY3QocDEueCkudG8uZXF1YWwoNik7XG5cdFx0ZXhwZWN0KHAxLnkpLnRvLmVxdWFsKDMpO1xuXHR9KTtcblxuXHRpdCgnY2FuIHRyYW5zbGF0ZSBhIFBvaW50IHdpdGggTmFOIGNvb3JkcycsIGZ1bmN0aW9uKCkge1xuXHRcdHZhciBwMSA9IFBvaW50KDIsdW5kZWZpbmVkKTtcblx0XHRwMS50cmFuc2xhdGUoNCwtMik7XG5cblx0XHRleHBlY3QocDEueCkudG8uZXF1YWwoNik7XG5cdFx0ZXhwZWN0KHAxLnkpLnRvLmRlZXAuZXF1YWwoTmFOKTtcblxuXHRcdHZhciBwMiA9IFBvaW50KHVuZGVmaW5lZCw1KTtcblx0XHRwMi50cmFuc2xhdGUoNCwtMik7XG5cblx0XHRleHBlY3QocDIueSkudG8uZXF1YWwoMyk7XG5cdFx0ZXhwZWN0KHAyLngpLnRvLmRlZXAuZXF1YWwoTmFOKTtcblx0fSk7XG5cblx0aXQoJ2FjY2VwdHMgdGhlIHNhbWUgYXJndW1lbnRzIGluIFBvaW50IGNvbnN0cnVjdG9yIGFuZCB0cmFuc2xhdGUgbWV0aG9kJywgZnVuY3Rpb24oKSB7XG5cdFx0ZXhwZWN0KCBQb2ludCgwLDApLnRyYW5zbGF0ZSggMTAsIDIwICkudG9TdHJpbmcoKSApLnRvLmVxdWFsKCcxMCAyMCcpO1xuXHRcdGV4cGVjdCggUG9pbnQoMCwwKS50cmFuc2xhdGUoIFsxMCwgMjBdICkudG9TdHJpbmcoKSApLnRvLmVxdWFsKCcxMCAyMCcpO1xuXHRcdGV4cGVjdCggUG9pbnQoMCwwKS50cmFuc2xhdGUoIHt4OiAxMCwgeTogMjB9ICkudG9TdHJpbmcoKSApLnRvLmVxdWFsKCcxMCAyMCcpO1xuXHRcdGV4cGVjdCggUG9pbnQoMCwwKS50cmFuc2xhdGUoIFBvaW50KDEwLCAyMCkgKS50b1N0cmluZygpICkudG8uZXF1YWwoJzEwIDIwJyk7XG5cdH0pO1xufSk7XG5cbi8qZGVzY3JpYmUoJ1BvaW50IHN0cnVjdHVyZScsIGZ1bmN0aW9uICgpIHtcblxuXHRiZWZvcmVFYWNoKG1vZHVsZSgncHJvdG90eXBvLlBvaW50JywgJ3Byb3RvdHlwby5TZWdtZW50JykpO1xuXG5cdHZhciBzZWcxLFxuXHRcdHNlZzIsXG5cdFx0cDEsXG5cdFx0cDIsXG5cdFx0cDMsXG5cdFx0cDQ7XG5cblx0YmVmb3JlRWFjaChpbmplY3QoZnVuY3Rpb24oIFNlZ21lbnQsIFBvaW50ICkge1xuXHRcdHNlZzEgPSBTZWdtZW50KCAnTCA1MCAxMDAnLCBQb2ludCgwLDApICk7XG5cdFx0c2VnMiA9IFNlZ21lbnQoICdNIDMwIC0yMCcsIFBvaW50KC0yMCwgODApICk7XG5cdFx0cDEgPSBQb2ludCg0MCw4MCk7XG5cdFx0cDIgPSBQb2ludCgxMCwyMCk7XG5cdFx0cDMgPSBQb2ludCgtMjAsODApO1xuXHRcdHA0ID0gUG9pbnQoMzAsLTIwKTtcblx0fSkpO1xuXG5cdGl0KCdzaG91bGQgZmluZCBhIHBvaW50IG9uIGEgc3RyYWlnaHQgU2VnbWVudCwgZ2l2ZW4geCBvciB5JywgaW5qZWN0KGZ1bmN0aW9uKCBwb2ludE9uICkge1xuXHRcdGV4cGVjdChwb2ludE9uKHsgeDogMjAgfSwgc2VnMSkudG9TdHJpbmcoKSkudG8uZXF1YWwoJzIwIDQwJyk7XG5cblx0XHRleHBlY3QocG9pbnRPbih7IHk6IDYwIH0sIHNlZzEpLnRvU3RyaW5nKCkpLnRvLmVxdWFsKCczMCA2MCcpO1xuXG5cdFx0ZXhwZWN0KHBvaW50T24oeyB4OiAwIH0sIHNlZzIpLnRvU3RyaW5nKCkpLnRvLmVxdWFsKCcwIDQwJyk7XG5cblx0XHRleHBlY3QocG9pbnRPbih7IHk6IDAgfSwgc2VnMikudG9TdHJpbmcoKSkudG8uZXF1YWwoJzIwIDAnKTtcblx0fSkpO1xuXG5cdGl0KCdzaG91bGQgZmluZCBhIHBvaW50IGJldHdlZW4gdHdvIFBvaW50cywgZ2l2ZW4geCBvciB5JywgaW5qZWN0KGZ1bmN0aW9uKCBwb2ludE9uICkge1xuXHRcdGV4cGVjdChwb2ludE9uKHsgeDogMjAgfSwgW3AxLHAyXSkudG9TdHJpbmcoKSkudG8uZXF1YWwoJzIwIDQwJyk7XG5cblx0XHRleHBlY3QocG9pbnRPbih7IHk6IDYwIH0sIFtwMSxwMl0pLnRvU3RyaW5nKCkpLnRvLmVxdWFsKCczMCA2MCcpO1xuXG5cdFx0ZXhwZWN0KHBvaW50T24oeyB4OiAwIH0sIFtwMyxwNF0pLnRvU3RyaW5nKCkpLnRvLmVxdWFsKCcwIDQwJyk7XG5cblx0XHRleHBlY3QocG9pbnRPbih7IHk6IDAgfSwgW3AzLHA0XSkudG9TdHJpbmcoKSkudG8uZXF1YWwoJzIwIDAnKTtcblx0fSkpO1xuXG5cdGl0KCdoYW5kbGVzIHVuZGVmaW5lZCAub24sIGdpdmVuIHggb3IgeScsIGluamVjdChmdW5jdGlvbiggcG9pbnRPbiApIHtcblx0XHRleHBlY3QocG9pbnRPbih7IHg6IDIwIH0sIHVuZGVmaW5lZCkudG9TdHJpbmcoKSkudG8uZXF1YWwoJzIwIE5hTicpO1xuXG5cdFx0ZXhwZWN0KHBvaW50T24oeyB5OiA2MCB9LCB1bmRlZmluZWQpLnRvU3RyaW5nKCkpLnRvLmVxdWFsKCdOYU4gNjAnKTtcblxuXHRcdGV4cGVjdChwb2ludE9uKHsgeDogMjAgfSwgW3VuZGVmaW5lZCwgcDFdKS50b1N0cmluZygpKS50by5lcXVhbCgnMjAgTmFOJyk7XG5cblx0XHRleHBlY3QocG9pbnRPbih7IHk6IDYwIH0sIFtwMSwgdW5kZWZpbmVkXSkudG9TdHJpbmcoKSkudG8uZXF1YWwoJ05hTiA2MCcpO1xuXHR9KSk7XG5cblx0aXQoJ3Nob3VsZCBmaW5kIHRoZSBpbnRlcnNlY3Rpb24gb2YgdHdvIGxpbmVzJywgaW5qZWN0KGZ1bmN0aW9uKCBwb2ludE9uLCBTZWdtZW50LCBQb2ludCApIHtcblx0XHRleHBlY3QocG9pbnRPbihbXSwgW1xuXHRcdFx0U2VnbWVudCgnTCA1MCA1MCcsIFBvaW50KDAsMCkpLFxuXHRcdFx0U2VnbWVudCgnTCA1MCAwJywgUG9pbnQoMCw1MCkpXG5cdFx0XSkudG9TdHJpbmcoKSkudG8uZXF1YWwoJzI1IDI1Jyk7XG5cblx0XHRleHBlY3QocG9pbnRPbihbXSwgW1xuXHRcdFx0W1BvaW50KDAsMCksIFNlZ21lbnQoJ0wgNTAgNTAnLCBQb2ludCgwLDApKV0sXG5cdFx0XHRbU2VnbWVudCgnTCA1MCAwJywgUG9pbnQoMCw1MCkpLCBQb2ludCgwLDUwKV1cblx0XHRdKS50b1N0cmluZygpKS50by5lcXVhbCgnMjUgMjUnKTtcblxuXHRcdGV4cGVjdChwb2ludE9uKFtdLCBbXG5cdFx0XHRbUG9pbnQoMCwwKSwgWzUwLCA1MF1dLFxuXHRcdFx0W3t4OiA1MCwgeTogMH0sIFBvaW50KDAsNTApXVxuXHRcdF0pLnRvU3RyaW5nKCkpLnRvLmVxdWFsKCcyNSAyNScpO1xuXHR9KSk7XG59KTsqLyIsImZ1bmN0aW9uKCRfX3BsYWNlaG9sZGVyX18wKSB7XG4gICAgICAkX19wbGFjZWhvbGRlcl9fMVxuICAgIH0iLCJpZiAoISRfX3BsYWNlaG9sZGVyX18wIHx8ICEkX19wbGFjZWhvbGRlcl9fMS5fX2VzTW9kdWxlKVxuICAgICAgICAgICAgJF9fcGxhY2Vob2xkZXJfXzIgPSB7ZGVmYXVsdDogJF9fcGxhY2Vob2xkZXJfXzN9IiwicmV0dXJuICRfX3BsYWNlaG9sZGVyX18wIl19