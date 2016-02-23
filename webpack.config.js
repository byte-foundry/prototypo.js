var path = require('path');

module.exports = {
	entry: [ './src/prototypo.js' ],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'prototypo.js',
		library: 'prototypo',
        libraryTarget: 'umd',
	},
	resolve: {
		alias: {
			'plumin.js': 'plumin.js/dist/plumin.js',
		}
	},
	externals: [{
		'./node/window': true,
		'./node/extend': true,
	}],
	node: {
		Buffer: false,
	}
};
