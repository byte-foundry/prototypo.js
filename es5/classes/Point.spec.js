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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8yIiwiY2xhc3Nlcy9Qb2ludC5zcGVjLmpzIiwiQHRyYWNldXIvZ2VuZXJhdGVkL1RlbXBsYXRlUGFyc2VyLzEiLCJAdHJhY2V1ci9nZW5lcmF0ZWQvVGVtcGxhdGVQYXJzZXIvOSIsIkB0cmFjZXVyL2dlbmVyYXRlZC9UZW1wbGF0ZVBhcnNlci8wIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEtBQUssQUFBQyxFQ0VZLFlBQVcsRUNGN0IsVUFBUyxJQUFnQjs7QUNBekIsS0FBSSxLQUFpQixHQUFLLEVBQUMsZUFBMkI7QUFDMUMsU0FBb0IsRUFBQyxPQUFNLE1BQW1CLENBQUMsQ0FBQTtBQUFBLElGQ3BELE1BQUk7QUFHWCxTQUFPLEFBQUMsQ0FBQyxpQkFBZ0IsQ0FBRyxVQUFRLEFBQUMsQ0FBRTtBQUV0QyxBQUFJLE1BQUEsQ0FBQSxNQUFLO0FBQUcsU0FBQztBQUFHLFNBQUM7QUFBRyxTQUFDO0FBQUcsU0FBQztBQUFHLFNBQUM7QUFBRyxTQUFDO0FBQUcsU0FBQyxDQUFDO0FBRXRDLGFBQVMsQUFBQyxDQUFDLFNBQVEsQUFBQyxDQUFFO0FBQ3JCLFdBQUssRUFBSSxNQUFJLENBQUM7QUFDZCxPQUFDLEVBQUksSUFBSSxNQUFJLEFBQUMsQ0FBQyxDQUFBLENBQUUsRUFBQSxDQUFDLENBQUM7QUFDbkIsT0FBQyxFQUFJLENBQUEsS0FBSSxBQUFDLENBQUMsQ0FBQSxDQUFFLEVBQUEsQ0FBQyxDQUFDO0FBQ2YsT0FBQyxFQUFJLENBQUEsS0FBSSxBQUFDLENBQUMsQ0FBQyxDQUFBLENBQUUsRUFBQSxDQUFDLENBQUMsQ0FBQztBQUNqQixPQUFDLEVBQUksQ0FBQSxLQUFJLEFBQUMsQ0FBQyxHQUFFLENBQUUsSUFBRSxDQUFDLENBQUM7QUFDbkIsT0FBQyxFQUFJLENBQUEsS0FBSSxBQUFDLENBQUMsQ0FBQyxHQUFFLENBQUUsSUFBRSxDQUFDLENBQUMsQ0FBQztBQUNyQixPQUFDLEVB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QUMsQ0FBRSxTQUFRLENBQUcsRUFBQSxDQUFFLENBQUM7QUFDOUIsV0FBSyxBQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsR0FBRyxLQUFLLE1BQU0sQUFBQyxDQUFDLEdBQUUsQ0FBQyxDQUFDO0FBQy9CLFdBQUssQUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxBQUFDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFeEIsQUFBSSxRQUFBLENBQUEsRUFBQyxFQUFJLENBQUEsS0FBSSxBQUFDLENBQUUsQ0FBQSxDQUFHLFVBQVEsQ0FBRSxDQUFDO0FBQzlCLFdBQUssQUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxNQUFNLEFBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQztBQUMvQixXQUFLLEFBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQUFBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBRXhCLEFBQUksUUFBQSxDQUFBLEVBQUMsRUFBSSxDQUFBLEtBQUksQUFBQyxDQUFDLENBQUMsU0FBUSxDQUFHLEVBQUEsQ0FBQyxDQUFDLENBQUM7QUFDOUIsV0FBSyxBQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsR0FBRyxLQUFLLE1BQU0sQUFBQyxDQUFDLEdBQUUsQ0FBQyxDQUFDO0FBQy9CLFdBQUssQUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxBQUFDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFFeEIsQUFBSSxRQUFBLENBQUEsRUFBQyxFQUFJLENBQUEsS0FBSSxBQUFDLENBQUMsQ0FBQyxDQUFBLENBQUcsVUFBUSxDQUFDLENBQUMsQ0FBQztBQUM5QixXQUFLLEFBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssTUFBTSxBQUFDLENBQUMsR0FBRSxDQUFDLENBQUM7QUFDL0IsV0FBSyxBQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEFBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztBQUV4QixBQUFJLFFBQUEsQ0FBQSxFQUFDLEVBQUks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LFVBQVUsQUFBQyxDQUFDLENBQUEsQ0FBRSxFQUFDLENBQUEsQ0FBQyxDQUFDO0FBRWxCLFdBQUssQUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxBQUFDLENBQUMsQ0FBQSxDQUFDLENBQUM7QUFDeEIsV0FBSyxBQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsR0FBRyxNQUFNLEFBQUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztJQUN6QixDQUFDLENBQUM7QUFFRixLQUFDLEFBQUMsQ0FBQyx1Q0FBc0MsQ0FBRyxVQUFRLEFBQUMsQ0FBRTtBQUN0RCxBQUFJLFFBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxLQUFJLEFBQUMsQ0FBQyxDQUFBLENBQUUsVUFBUSxDQUFDLENBQUM7QUFDM0IsT0FBQyxVQUFVLEFBQUMsQ0FBQyxDQUFBLENBQUUsRUFBQyxDQUFBLENBQUMsQ0FBQztBQUVsQixXQUFLLEFBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQUFBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBQ3hCLFdBQUssQUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxNQUFNLEFBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQztBQUUvQixBQUFJLFFBQUEsQ0FBQSxFQUFDLEVBQUksQ0FBQSxLQUFJLEFBQUMsQ0FBQyxTQUFRLENBQUUsRUFBQSxDQUFDLENBQUM7QUFDM0IsT0FBQyxVQUFVLEFBQUMsQ0FBQyxDQUFBLENBQUUsRUFBQyxDQUFBLENBQUMsQ0FBQztBQUVsQixXQUFLLEFBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQUFBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0FBQ3hCLFdBQUssQUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxNQUFNLEFBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQztJQUNoQyxDQUFDLENBQUM7QUFFRixLQUFDLEFBQUMsQ0FBQyxzRUFBcUUsQ0FBRyxVQUFRLEFBQUMsQ0FBRTtBQUNyRixXQUFLLEFBQUMsQ0FBRSxLQUFJLEFBQUMsQ0FBQyxDQUFBLENBQUUsRUFBQSxDQUFDLFVBQVUsQUFBQyxDQUFFLEVBQUMsQ0FBRyxHQUFDLENBQUUsU0FBUyxBQUFDLEVBQUMsQ0FBRSxHQUFHLE1BQU0sQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDO0FBQ3JFLFdBQUssQUFBQyxDQUFFLEtBQUksQUFBQyxDQUFDLENBQUEsQ0FBRSxFQUFBLENBQUMsVUFBVSxBQUFDLENBQUUsQ0FBQyxFQUFDLENBQUcsR0FBQyxDQUFDLENBQUUsU0FBUyxBQUFDLEVBQUMsQ0FBRSxHQUFHLE1BQU0sQUFBQyxDQUFDLE9BQU0sQ0FBQyxDQUFDO0FBQ3ZFLFdBQUssQUFBQyxDQUFFLEtBQUksQUFBQyxDQUFDLENBQUEsQ0FBRSxFQUFBLENBQUMsVUFBVSxBQUFDLENBQUU7QUFBQyxRQUFBLENBQUcsR0FBQztBQUFHLFFBQUEsQ0FBRyxHQUFDO0FBQUEsTUFBQyxDQUFFLFNBQVMsQUFBQyxFQUFDLENBQUUsR0FBRyxNQUFNLEFBQUMsQ0FBQyxPQUFNLENBQUMsQ0FBQztBQUM3RSxXQUFLLEFBQUMsQ0FBRSxLQUFJLEFBQUMsQ0FBQyxDQUFBLENBQUUsRUFBQSxDQUFDLFVBQVUsQUFBQyxDQUFFLEtBQUksQUFBQyxDQUFDLEVBQUMsQ0FBRyxHQUFDLENBQUMsQ0FBRSxTQUFTLEFBQUMsRUFBQyxDQUFFLEdBQUcsTUFBTSxBQUFDLENBQUMsT0FBTSxDQUFDLENBQUM7SUFDN0UsQ0FBQyxDQUFDO0VBQ0gsQ0FBQyxDQUFDO0FHaEpGLFdBQXVCO0FGRW5CLENGRnVDLENBQUM7QUNvTnhDIiwiZmlsZSI6ImNsYXNzZXMvUG9pbnQuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIuLiIsInNvdXJjZXNDb250ZW50IjpbImRlZmluZSgkX19wbGFjZWhvbGRlcl9fMCwgJF9fcGxhY2Vob2xkZXJfXzEpOyIsIi8qanNoaW50IC1XMDMwICovXG5cbmltcG9ydCBQb2ludCBmcm9tICcuL1BvaW50LmpzJztcblxuXG5kZXNjcmliZSgnUG9pbnQgc3RydWN0dXJlJywgZnVuY3Rpb24oKSB7XG5cblx0dmFyIF9Qb2ludCwgcDAsIHAxLCBwMiwgcDMsIHA0LCBwNSwgcDY7XG5cblx0YmVmb3JlRWFjaChmdW5jdGlvbigpIHtcblx0XHRfUG9pbnQgPSBQb2ludDtcblx0XHRwMCA9IG5ldyBQb2ludCgzLDYpO1xuXHRcdHAxID0gUG9pbnQoMiw1KTtcblx0XHRwMiA9IFBvaW50KFsyLDVdKTtcblx0XHRwMyA9IFBvaW50KCcyJywnNScpO1xuXHRcdHA0ID0gUG9pbnQoWycyJywnNSddKTtcblx0XHRwNSA9IFBvaW50KHAxKTtcblx0XHRwNiA9IFBvaW50KHt4OiAyLCB5OiA1fSk7XG5cdH0pO1xuXG5cdGl0KCdjYW4gYmUgY2FsbGVkIHdpdGggb3Igd2l0aG91dCBuZXcnLCBmdW5jdGlvbigpIHtcblx0XHRleHBlY3QocDAgaW5zdGFuY2VvZiBfUG9pbnQpLnRvLmJlLnRydWU7XG5cdFx0ZXhwZWN0KHAxIGluc3RhbmNlb2YgX1BvaW50KS50by5iZS50cnVlO1xuXHR9KTtcblxuXHRpdCgnYWNjZXB0cyB0d28gYXJnczogeCBhbmQgeScsIGZ1bmN0aW9uKCkge1xuXHRcdGV4cGVjdChwMC54KS50by5lcXVhbCgzKTtcblx0XHRleHBlY3QocDAueSkudG8uZXF1YWwoNik7XG5cblx0XHRleHBlY3QocDEueCkudG8uZXF1YWwoMik7XG5cdFx0ZXhwZWN0KHAxLnkpLnRvLmVxdWFsKDUpO1xuXHR9KTtcblxuXHRpdCgnYWNjZXB0cyBhbiBhcnJheSBhcmc6IFt4LHldJywgZnVuY3Rpb24oKSB7XG5cdFx0ZXhwZWN0KHAyLngpLnRvLmVxdWFsKDIpO1xuXHRcdGV4cGVjdChwMi55KS50by5lcXVhbCg1KTtcblx0fSk7XG5cblx0aXQoJ2FjY2VwdHMgYW4gb2JqZWN0IGFyZzoge3g6eCx5Onl9JyxmdW5jdGlvbigpIHtcblx0XHRleHBlY3QocDYueCkudG8uZXF1YWwoMik7XG5cdFx0ZXhwZWN0KHA2LnkpLnRvLmVxdWFsKDUpO1xuXHR9KTtcblxuXHRpdCgnYWNjZXB0cyBudW1iZXIgYW5kIHN0cmluZyBhcmdzIGFuZCB0dXJucyB0aGVtIGludG8gbnVtYmVycycsIGZ1bmN0aW9uKCkge1xuXHRcdGV4cGVjdChwMy54KS50by5iZS5hKCdudW1iZXInKTtcblx0XHRleHBlY3QocDQueCkudG8uYmUuYSgnbnVtYmVyJyk7XG5cdH0pO1xuXG5cdGl0KCdjYW4gYmUgc2VyaWFsaXplZCcsIGZ1bmN0aW9uKCkge1xuXHRcdGV4cGVjdChwMSArICcnKS50by5lcXVhbCgnMiA1Jyk7XG5cdH0pO1xuXG5cdGl0KCdhY2NlcHRzIGEgUG9pbnQgYXMgYW4gYXJndW1lbnQsIGFuZCB0aGlzIHJlc3VsdHMgaW4gYW4gaW5kZXBlbmRlbnQgY2xvbmUnLCBmdW5jdGlvbigpIHtcblx0XHRwMS54ID0gNDtcblx0XHRwMS55ID0gNztcblxuXHRcdGV4cGVjdChwNS54KS50by5lcXVhbCgyKTtcblx0XHRleHBlY3QocDUueSkudG8uZXF1YWwoNSk7XG5cdH0pO1xuXG5cdGl0KCdhY2NlcHRzIHVuZGVmaW5lZCBwYXJhbWV0ZXJzJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHAxID0gUG9pbnQoIHVuZGVmaW5lZCwgNSApO1xuXHRcdGV4cGVjdChwMS54KS50by5kZWVwLmVxdWFsKE5hTik7XG5cdFx0ZXhwZWN0KHAxLnkpLnRvLmVxdWFsKDUpO1xuXG5cdFx0dmFyIHAyID0gUG9pbnQoIDIsIHVuZGVmaW5lZCApO1xuXHRcdGV4cGVjdChwMi55KS50by5kZWVwLmVxdWFsKE5hTik7XG5cdFx0ZXhwZWN0KHAyLngpLnRvLmVxdWFsKDIpO1xuXG5cdFx0dmFyIHAzID0gUG9pbnQoW3VuZGVmaW5lZCwgNV0pO1xuXHRcdGV4cGVjdChwMy54KS50by5kZWVwLmVxdWFsKE5hTik7XG5cdFx0ZXhwZWN0KHAzLnkpLnRvLmVxdWFsKDUpO1xuXG5cdFx0dmFyIHA0ID0gUG9pbnQoWzIsIHVuZGVmaW5lZF0pO1xuXHRcdGV4cGVjdChwNC55KS50by5kZWVwLmVxdWFsKE5hTik7XG5cdFx0ZXhwZWN0KHA0LngpLnRvLmVxdWFsKDIpO1xuXG5cdFx0dmFyIHA1ID0gUG9pbnQoe3k6IDV9KTtcblx0XHRleHBlY3QocDUueCkudG8uZGVlcC5lcXVhbChOYU4pO1xuXHRcdGV4cGVjdChwNS55KS50by5lcXVhbCg1KTtcblxuXHRcdHZhciBwNiA9IFBvaW50KHt4OiAyfSk7XG5cdFx0ZXhwZWN0KHA2LnkpLnRvLmRlZXAuZXF1YWwoTmFOKTtcblx0XHRleHBlY3QocDYueCkudG8uZXF1YWwoMik7XG5cdH0pO1xufSk7XG5cbmRlc2NyaWJlKCd0cmFuc2xhdGVQb2ludCcsIGZ1bmN0aW9uICgpIHtcblxuXHR2YXIgX1BvaW50LCBwMCwgcDEsIHAyLCBwMywgcDQsIHA1LCBwNjtcblxuXHRiZWZvcmVFYWNoKGZ1bmN0aW9uKCkge1xuXHRcdF9Qb2ludCA9IFBvaW50O1xuXHRcdHAwID0gbmV3IFBvaW50KDMsNik7XG5cdFx0cDEgPSBQb2ludCgyLDUpO1xuXHRcdHAyID0gUG9pbnQoWzIsNV0pO1xuXHRcdHAzID0gUG9pbnQoJzInLCc1Jyk7XG5cdFx0cDQgPSBQb2ludChbJzInLCc1J10pO1xuXHRcdHA1ID0gUG9pbnQocDEpO1xuXHRcdHA2ID0gUG9pbnQoe3g6IDIsIHk6IDV9KTtcblx0fSk7XG5cblx0aXQoJ2NhbiB0cmFuc2xhdGUgYSBQb2ludCBvbiB4IGF4aXMnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgcDEgPSBQb2ludCgyLDUpO1xuXHRcdHAxLnRyYW5zbGF0ZVgoNCk7XG5cblx0XHRleHBlY3QocDEueCkudG8uZXF1YWwoNik7XG5cdH0pO1xuXG5cdGl0KCdjYW4gdHJhbnNsYXRlIGEgUG9pbnQgb24geSBheGlzJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHAxID0gUG9pbnQoMiw1KTtcblx0XHRwMS50cmFuc2xhdGVZKC0yKTtcblxuXHRcdGV4cGVjdChwMS55KS50by5lcXVhbCgzKTtcblx0fSk7XG5cblx0aXQoJ2NhbiB0cmFuc2xhdGUgYSBQb2ludCBvbiB4IGFuZCB5IGF4aXMnLCBmdW5jdGlvbigpIHtcblx0XHR2YXIgcDEgPSBQb2ludCgyLDUpO1xuXHRcdHAxLnRyYW5zbGF0ZSg0LC0yKTtcblxuXHRcdGV4cGVjdChwMS54KS50by5lcXVhbCg2KTtcblx0XHRleHBlY3QocDEueSkudG8uZXF1YWwoMyk7XG5cdH0pO1xuXG5cdGl0KCdjYW4gdHJhbnNsYXRlIGEgUG9pbnQgd2l0aCBOYU4gY29vcmRzJywgZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHAxID0gUG9pbnQoMix1bmRlZmluZWQpO1xuXHRcdHAxLnRyYW5zbGF0ZSg0LC0yKTtcblxuXHRcdGV4cGVjdChwMS54KS50by5lcXVhbCg2KTtcblx0XHRleHBlY3QocDEueSkudG8uZGVlcC5lcXVhbChOYU4pO1xuXG5cdFx0dmFyIHAyID0gUG9pbnQodW5kZWZpbmVkLDUpO1xuXHRcdHAyLnRyYW5zbGF0ZSg0LC0yKTtcblxuXHRcdGV4cGVjdChwMi55KS50by5lcXVhbCgzKTtcblx0XHRleHBlY3QocDIueCkudG8uZGVlcC5lcXVhbChOYU4pO1xuXHR9KTtcblxuXHRpdCgnYWNjZXB0cyB0aGUgc2FtZSBhcmd1bWVudHMgaW4gUG9pbnQgY29uc3RydWN0b3IgYW5kIHRyYW5zbGF0ZSBtZXRob2QnLCBmdW5jdGlvbigpIHtcblx0XHRleHBlY3QoIFBvaW50KDAsMCkudHJhbnNsYXRlKCAxMCwgMjAgKS50b1N0cmluZygpICkudG8uZXF1YWwoJzEwIDIwJyk7XG5cdFx0ZXhwZWN0KCBQb2ludCgwLDApLnRyYW5zbGF0ZSggWzEwLCAyMF0gKS50b1N0cmluZygpICkudG8uZXF1YWwoJzEwIDIwJyk7XG5cdFx0ZXhwZWN0KCBQb2ludCgwLDApLnRyYW5zbGF0ZSgge3g6IDEwLCB5OiAyMH0gKS50b1N0cmluZygpICkudG8uZXF1YWwoJzEwIDIwJyk7XG5cdFx0ZXhwZWN0KCBQb2ludCgwLDApLnRyYW5zbGF0ZSggUG9pbnQoMTAsIDIwKSApLnRvU3RyaW5nKCkgKS50by5lcXVhbCgnMTAgMjAnKTtcblx0fSk7XG59KTtcblxuLypkZXNjcmliZSgnUG9pbnQgc3RydWN0dXJlJywgZnVuY3Rpb24gKCkge1xuXG5cdGJlZm9yZUVhY2gobW9kdWxlKCdwcm90b3R5cG8uUG9pbnQnLCAncHJvdG90eXBvLlNlZ21lbnQnKSk7XG5cblx0dmFyIHNlZzEsXG5cdFx0c2VnMixcblx0XHRwMSxcblx0XHRwMixcblx0XHRwMyxcblx0XHRwNDtcblxuXHRiZWZvcmVFYWNoKGluamVjdChmdW5jdGlvbiggU2VnbWVudCwgUG9pbnQgKSB7XG5cdFx0c2VnMSA9IFNlZ21lbnQoICdMIDUwIDEwMCcsIFBvaW50KDAsMCkgKTtcblx0XHRzZWcyID0gU2VnbWVudCggJ00gMzAgLTIwJywgUG9pbnQoLTIwLCA4MCkgKTtcblx0XHRwMSA9IFBvaW50KDQwLDgwKTtcblx0XHRwMiA9IFBvaW50KDEwLDIwKTtcblx0XHRwMyA9IFBvaW50KC0yMCw4MCk7XG5cdFx0cDQgPSBQb2ludCgzMCwtMjApO1xuXHR9KSk7XG5cblx0aXQoJ3Nob3VsZCBmaW5kIGEgcG9pbnQgb24gYSBzdHJhaWdodCBTZWdtZW50LCBnaXZlbiB4IG9yIHknLCBpbmplY3QoZnVuY3Rpb24oIHBvaW50T24gKSB7XG5cdFx0ZXhwZWN0KHBvaW50T24oeyB4OiAyMCB9LCBzZWcxKS50b1N0cmluZygpKS50by5lcXVhbCgnMjAgNDAnKTtcblxuXHRcdGV4cGVjdChwb2ludE9uKHsgeTogNjAgfSwgc2VnMSkudG9TdHJpbmcoKSkudG8uZXF1YWwoJzMwIDYwJyk7XG5cblx0XHRleHBlY3QocG9pbnRPbih7IHg6IDAgfSwgc2VnMikudG9TdHJpbmcoKSkudG8uZXF1YWwoJzAgNDAnKTtcblxuXHRcdGV4cGVjdChwb2ludE9uKHsgeTogMCB9LCBzZWcyKS50b1N0cmluZygpKS50by5lcXVhbCgnMjAgMCcpO1xuXHR9KSk7XG5cblx0aXQoJ3Nob3VsZCBmaW5kIGEgcG9pbnQgYmV0d2VlbiB0d28gUG9pbnRzLCBnaXZlbiB4IG9yIHknLCBpbmplY3QoZnVuY3Rpb24oIHBvaW50T24gKSB7XG5cdFx0ZXhwZWN0KHBvaW50T24oeyB4OiAyMCB9LCBbcDEscDJdKS50b1N0cmluZygpKS50by5lcXVhbCgnMjAgNDAnKTtcblxuXHRcdGV4cGVjdChwb2ludE9uKHsgeTogNjAgfSwgW3AxLHAyXSkudG9TdHJpbmcoKSkudG8uZXF1YWwoJzMwIDYwJyk7XG5cblx0XHRleHBlY3QocG9pbnRPbih7IHg6IDAgfSwgW3AzLHA0XSkudG9TdHJpbmcoKSkudG8uZXF1YWwoJzAgNDAnKTtcblxuXHRcdGV4cGVjdChwb2ludE9uKHsgeTogMCB9LCBbcDMscDRdKS50b1N0cmluZygpKS50by5lcXVhbCgnMjAgMCcpO1xuXHR9KSk7XG5cblx0aXQoJ2hhbmRsZXMgdW5kZWZpbmVkIC5vbiwgZ2l2ZW4geCBvciB5JywgaW5qZWN0KGZ1bmN0aW9uKCBwb2ludE9uICkge1xuXHRcdGV4cGVjdChwb2ludE9uKHsgeDogMjAgfSwgdW5kZWZpbmVkKS50b1N0cmluZygpKS50by5lcXVhbCgnMjAgTmFOJyk7XG5cblx0XHRleHBlY3QocG9pbnRPbih7IHk6IDYwIH0sIHVuZGVmaW5lZCkudG9TdHJpbmcoKSkudG8uZXF1YWwoJ05hTiA2MCcpO1xuXG5cdFx0ZXhwZWN0KHBvaW50T24oeyB4OiAyMCB9LCBbdW5kZWZpbmVkLCBwMV0pLnRvU3RyaW5nKCkpLnRvLmVxdWFsKCcyMCBOYU4nKTtcblxuXHRcdGV4cGVjdChwb2ludE9uKHsgeTogNjAgfSwgW3AxLCB1bmRlZmluZWRdKS50b1N0cmluZygpKS50by5lcXVhbCgnTmFOIDYwJyk7XG5cdH0pKTtcblxuXHRpdCgnc2hvdWxkIGZpbmQgdGhlIGludGVyc2VjdGlvbiBvZiB0d28gbGluZXMnLCBpbmplY3QoZnVuY3Rpb24oIHBvaW50T24sIFNlZ21lbnQsIFBvaW50ICkge1xuXHRcdGV4cGVjdChwb2ludE9uKFtdLCBbXG5cdFx0XHRTZWdtZW50KCdMIDUwIDUwJywgUG9pbnQoMCwwKSksXG5cdFx0XHRTZWdtZW50KCdMIDUwIDAnLCBQb2ludCgwLDUwKSlcblx0XHRdKS50b1N0cmluZygpKS50by5lcXVhbCgnMjUgMjUnKTtcblxuXHRcdGV4cGVjdChwb2ludE9uKFtdLCBbXG5cdFx0XHRbUG9pbnQoMCwwKSwgU2VnbWVudCgnTCA1MCA1MCcsIFBvaW50KDAsMCkpXSxcblx0XHRcdFtTZWdtZW50KCdMIDUwIDAnLCBQb2ludCgwLDUwKSksIFBvaW50KDAsNTApXVxuXHRcdF0pLnRvU3RyaW5nKCkpLnRvLmVxdWFsKCcyNSAyNScpO1xuXG5cdFx0ZXhwZWN0KHBvaW50T24oW10sIFtcblx0XHRcdFtQb2ludCgwLDApLCBbNTAsIDUwXV0sXG5cdFx0XHRbe3g6IDUwLCB5OiAwfSwgUG9pbnQoMCw1MCldXG5cdFx0XSkudG9TdHJpbmcoKSkudG8uZXF1YWwoJzI1IDI1Jyk7XG5cdH0pKTtcbn0pOyovIiwiZnVuY3Rpb24oJF9fcGxhY2Vob2xkZXJfXzApIHtcbiAgICAgICRfX3BsYWNlaG9sZGVyX18xXG4gICAgfSIsImlmICghJF9fcGxhY2Vob2xkZXJfXzAgfHwgISRfX3BsYWNlaG9sZGVyX18xLl9fZXNNb2R1bGUpXG4gICAgICAgICAgICAkX19wbGFjZWhvbGRlcl9fMiA9IHtkZWZhdWx0OiAkX19wbGFjZWhvbGRlcl9fM30iLCJyZXR1cm4gJF9fcGxhY2Vob2xkZXJfXzAiXX0=