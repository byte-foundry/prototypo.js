import fp from './font-builder.js';
var build = fp.build;
var updater = fp.updater;

describe('font parser', function() {

	it('can create an updater from an operation object', function() {
		var up = updater({
			operation: 'thickness * contrast',
			parameters: ['thickness', 'contrast'],
			dependencies: []
		});

		expect(up).to.be.instanceof(Function);
		expect(up( {}, {}, {}, 2, 3 )).to.be.equal(6);
	});
});