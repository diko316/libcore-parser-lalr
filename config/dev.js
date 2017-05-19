'use strict';

var webpack = require("webpack");

function augment(config, definition) {
    config.devtool = "eval-source-map";
    delete config.externals;
    
    config.entry.demo = [
                './src/demo.js',
                'webpack-hot-middleware/client?reload=true&overlay=false'];
    
    console.log("running hot module replacement");
    config.plugins = [new webpack.HotModuleReplacementPlugin()];
    
    config.entry[definition.name].
        splice(0,0,
            'webpack-hot-middleware/client?reload=true&overlay=false');
}


module.exports = augment;