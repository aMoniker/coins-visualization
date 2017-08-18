const path = require('path');
const MinifyPlugin = require("babel-minify-webpack-plugin");

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
    entry: './src/index.js',
    output: {
        filename: (isProd ? 'bundle.min.js' : 'bundle.js'),
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        contentBase: './dist',
    },
    plugins: [],
};

if (isProd) {
    module.exports.plugins.push(new MinifyPlugin());
}
