'use strict';

var webpack = require("webpack"),
    UglifyJSPlugin = require('uglifyjs-webpack-plugin');

function augment(config, definition) {
    var wp = webpack,
        name = definition.name;
    
    
    config.entry[name + '.min'] = config.entry[name];
    delete config.entry[name];
    
    config.plugins = [new wp.LoaderOptionsPlugin({
                            minimize: true,
                            debug: false
                        }),
                        new wp.optimize.UglifyJsPlugin({
                            beautify: false,
                            comments: false
                        })];
        //new UglifyJSPlugin()];
    
}

module.exports = augment;

