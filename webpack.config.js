'use strict';

var //PATH = require('path'),
    webpack = require("webpack"),
    DEFINITION = require("./package.json"),
    LIB_NAME = DEFINITION.name,
    CONFIG = require("./config/base.js");
    
switch (process.env.BUILD_MODE) {
case "production":
case "compressed":
/* falls through */
default:
    require("./config/dev.js")(CONFIG);
    CONFIG.plugins = [new webpack.HotModuleReplacementPlugin()];
    CONFIG.entry[LIB_NAME].splice(0,0,
                                'webpack-hot-middleware/client?reload=true&overlay=false');
}
    
    
module.exports = CONFIG;