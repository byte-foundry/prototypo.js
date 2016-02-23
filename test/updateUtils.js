var Utils = prototypo.Utils;

describe('#rayRayIntersection', function() {
	it('should return an array with the coordinates of the intersection',
		function() {
			var rri;

			// first quadrant
			rri = Utils.rayRayIntersection(
					{ x: 110, y: 10 },
					Math.PI / 2,
					{ x: 10, y: 110 },
					0
				);

			expect(Math.round(rri[0])).to.equal(110);
			expect(rri[1]).to.equal(110);

			// second quadrant
			rri = Utils.rayRayIntersection(
					{ x: 110, y: 110 },
					-Math.PI,
					{ x: 10, y: 10 },
					Math.PI / 2
				);

			expect(Math.round(rri[0])).to.equal(10);
			expect(rri[1]).to.equal(110);

			// third quadrant
			rri = Utils.rayRayIntersection(
					{ x: 10, y: 110 },
					-Math.PI / 2,
					{ x: 110, y: 10 },
					-Math.PI
				);

			expect(Math.round(rri[0])).to.equal(10);
			expect(Math.round(rri[1])).to.equal(10);

			// fourth quadrant
			rri = Utils.rayRayIntersection(
					{ x: 10, y: 10 },
					0,
					{ x: 110, y: 110 },
					-Math.PI / 2
				);

			expect(Math.round(rri[0])).to.equal(110);
			expect(rri[1]).to.equal(10);
	});

	it('should return null when rays don\'t intersect', function() {
		var rri = Utils.rayRayIntersection(
				{ x: 0, y: 0 },
				0,
				{ x: 0, y: 100 },
				Math.PI
			);

		expect(rri).to.equal(null);
	});
});

describe('#onLine', function() {
	it('should find y, given x and two points', function() {
		var y = Utils.onLine({
			x: 20,
			on: [ { x: 0, y: 0 }, { x: 100, y: 50 } ]
		});

		expect(y).to.equal(10);
	});

	it('should find x, given y and two points', function() {
		var x = Utils.onLine({
			y: 20,
			on: [ { x: 0, y: 0 }, { x: 100, y: 50 } ]
		});

		expect(x).to.equal(40);
	});
});
