var path = require('path');

module.exports = {
	entry: [ './src/prototypo.js' ],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'prototypo.js',
		library: 'prototypo',
        libraryTarget: 'umd',
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			}
		],
	},
};
