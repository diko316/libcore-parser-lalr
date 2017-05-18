'use strict';

var //PATH = require('path'),
    webpack = require("webpack"),
    DEFINITION = require("./package.json"),
    LIB_NAME = DEFINITION.name,
    CONFIG = require("./config/base.js"),
    hot = true,
    dev = true;
    
switch (process.env.BUILD_MODE) {
case "unit-test":
case "production":
case "compressed":
    hot = false;
    dev = false;
    
/* falls through */
default:
    if (dev) {
        console.log("applying development build");
        require("./config/dev.js")(CONFIG);
    }
    
    if (hot) {
        console.log("running hot module replacement");
        CONFIG.plugins = [new webpack.HotModuleReplacementPlugin()];
        CONFIG.entry[LIB_NAME].
            splice(0,0,
                'webpack-hot-middleware/client?reload=true&overlay=false');
            
        CONFIG.entry.demo.
            splice(0,0,
                'webpack-hot-middleware/client?reload=true&overlay=false');
    }
}
    
    
module.exports = CONFIG;