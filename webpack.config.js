var path = require('path');
var webpack = require('webpack');

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
				loader: ['babel-loader', 'if-loader'],
			}
		],
	},
	externals: [{
		'./node/window': true,
		'./node/extend': true,
	}],
	node: {
		Buffer: false,
	},
	plugins: [
		new webpack.LoaderOptionsPlugin({
			options: {
				'if-loader': process.env.BUILD_ENV,
			}
		})
	]
};
