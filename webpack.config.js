const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: {
		app: './src/index.js'
	},
	output: { 
		path: path.join(__dirname, 'dist'),
		filename: 'app.bundle.js' 
	},
	module: {
		rules: [
			{ test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] }, // Starts with the rightmost loader
			{ test: /\.css$/, use: ['style-loader', 'css-loader'] },
			{ test: /\.js$/, exclude: /node_modules/,  
				use: { 
					loader: 'babel-loader',
	        		options: {
	          			presets: ['env', 'react']
	        		} 
        		}
			},
			{
				test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
				use: [{
				  loader: 'file-loader',
				  options: {
					name: '[name].[ext]',
					outputPath: 'fonts/',    // where the fonts will go
					publicPath: '../'       // override the default path
				  }
				}]
			  }
		]
	},
	plugins: [
		new HtmlWebpackPlugin({ // Final index.html won't exist without this
			title: 'Beer Browser',
			minify: {
				collapseWhitespace: true
			},
			template: './src/index.html'
		})
	],
	
}