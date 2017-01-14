const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const debug = require('debug')('call-circle:webpack');
const Config = require('./lib/config');


const pagesDir = path.join(__dirname, 'client', 'scripts', 'pages');

const entries = {};

const jsxFilenameRegex = /\.jsx?$/;

_.each(
	fs.readdirSync(pagesDir),
	file => {
		if (jsxFilenameRegex.test(file)) {
			entries[file.replace(jsxFilenameRegex, '')] = [
				path.join(pagesDir, file)
			]
		}
	}
);

module.exports = {
	// entry: entries,
	entry: './client/scripts/index.jsx',

	output: {
		path: Config.paths.dist,
		publicPath: '/static/',
		filename: 'js/bundle.js'
	},

	module: {
		loaders: [
			{
				test: jsxFilenameRegex,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},

			{
				test: /\.less$/,
				loader: ExtractTextPlugin.extract(
					'css-loader?sourceMap!postcss-loader!less-loader?' +
						JSON.stringify({
							sourceMap: true,
							modifyVars: {
								'fa-font-path': '"/static/fonts/font-awesome/"'
							}
						}),
					{
						publicPath: '/static/css'
					}
				)
			},

			{
				test: /\.css$/,
				loader: ExtractTextPlugin.extract('css-loader?sourceMap!postcss', {
					publicPath: '/static/css'
				})
			},

			{
				test: /\.json$/,
				loader: 'json-loader'
			},

			{
				test: /\.woff(2)?(\?.*)?$/,
				loader: 'url-loader?limit=10000&mimetype=application/font-woff'
			},

			{
				test: /\.ttf(\?.*)?$/,
				loader: 'file-loader'
			},

			{
				test: /\.eot(\?.*)?$/,
				loader: 'file-loader'
			},

			{
				test: /\.svg(\?.*)?$/,
				loader: 'file-loader'
			}
		]
	},

	plugins: [
		new webpack.ProvidePlugin({
			"React": "react"
		}),

		// jQuery and Tether required by Bootstrap
		new webpack.ProvidePlugin({
			"jQuery": "jquery",
			"$": "jquery"
		}),
		new webpack.DefinePlugin({
			"IS_DEVELOPMENT": JSON.stringify(Config.app.isDevelopment),
		}),

        new ExtractTextPlugin('css/bundle.css', {
            allChunks: true
        })
	],

	resolve: {
		extensions: ['', '.js', '.jsx', '.json', '.less', '.css'],
		root: [
			Config.paths.client,
			path.join(Config.paths.client, 'styles')
		]
	},

	node: {
		Buffer: true,
		fs: 'empty',
		assert: true,
		events: true
	},

	devtool: "source-map"
	// devtool: "cheap-eval-source-map"
};
