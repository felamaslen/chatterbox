/* eslint-disable no-sync */
const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

const nodeModules = fs.readdirSync(path.join(__dirname, '../node_modules'))
    .filter(item => ['.bin'].indexOf(item) === -1)
    .reduce((modules, mod) => ({ ...modules, [mod]: `commonjs ${mod}` }), {});

module.exports = () => ({
    entry: './index.js',
    resolveLoader: {
        modules: ['node_modules', __dirname]
    },
    target: 'node',
    node: {
        __dirname: true
    },
    output: {
        path: path.join(__dirname, '../build'),
        filename: 'index.js'
    },
    externals: nodeModules,
    plugins: [
        new webpack.IgnorePlugin(/\.(s?css)$/)
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                enforce: 'pre',
                exclude: /node_modules/,
                loaders: `strip-loader?${JSON.stringify({ env: ['DEV'] })}`
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    forceEnv: 'backend'
                }
            }
        ]
    },
    devtool: 'sourcemap'
});

