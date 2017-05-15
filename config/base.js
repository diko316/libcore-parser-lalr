'use strict';

var PATH = require('path'),
    ROOT_PATH = PATH.resolve(__dirname, '..'),
    SOURCE_PATH = PATH.join(ROOT_PATH, 'src'),
    DEFINITION = require(PATH.join(ROOT_PATH, 'package.json')),
    LIB_NAME = DEFINITION.name,
    entry = {};

// entry
entry[LIB_NAME] = ['./src/index.js'];


module.exports = {
    entry: entry,
    output: {
        filename: '[name].js',
        //path: PATH.join(ROOT_PATH, 'dist'),
        path: PATH.join(ROOT_PATH, 'test', 'assets'),
        publicPath: '/assets/',
        library: LIB_NAME,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
        },
        {
            test: /\.png$/,
            use: { loader: 'url-loader', options: { limit: 100000 } },
        },
        {
            test: /\.jpg$/,
            use: [ 'file-loader' ]
        },
        {
            test: /\.(jpg|jpeg|gif|png)$/,
            include: SOURCE_PATH,
            use: {
                loader:'url-loader',
                options: {
                    'limit': '1024',
                    'name': 'images/[name].[ext]'
                }
            }
            
        },
        {
            test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
            use: {
                loader: 'url-loader',
                options: {
                    'limit': '10000',
                    'mimetype': 'application/font-woff',
                    'name': 'fonts/[name].[ext]'
                }
            }
        },
        {
            test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
            use: {
                loader: 'url-loader',
                options: {
                    'limit': '10000',
                    'mimetype': 'application/font-woff',
                    'name': 'fonts/[name].[ext]'
                }
            }
        },
        {
            test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
            use: {
                loader: 'url-loader',
                options: {
                    'limit': '10000',
                    'mimetype': 'application/octet-stream',
                    'name': 'fonts/[name].[ext]'
                }
            }
        },
        {
            test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
            use: {
                loader: 'file-loader',
                options: {
                    'limit': '10000',
                    'name': 'fonts/[name].[ext]'
                }
            }
        },
        {
            test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
            use: {
                loader: 'url-loader',
                options: {
                    'limit': '10000',
                    'mimetype': 'mimetype=image/svg+xml',
                    'name': 'fonts/[name].[ext]'
                }
            }
        }]
    }
};