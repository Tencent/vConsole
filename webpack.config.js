var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	devtool: false,
	entry: {
		"vconsole" : "./src/vconsole.js"
	},
	output: {
		path: "./dist",
		filename: "[name].min.js",
		library: 'vConsole',
		libraryTarget: 'umd',
		umdNameDefine: true
	},
	module: {
		loaders: [
			{
				test: /\.html$/, loader: "html"
			},
			{ 
				test: /\.js$/, loader: "babel"
			},
			{
				test: /\.less$/,
				loader: "style!css!less"
				// loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader") // 将css独立打包
			}
		]
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		})
		// ,new ExtractTextPlugin("[name].min.css") // 将css独立打包
	]

};