'use strict';

var DEFINITION = require("./package.json"),
    CONFIG = require("./config/base.js");
    
    
switch (process.env.BUILD_MODE) {
case "compressed":
    require("./config/compressed.js")(CONFIG, DEFINITION);
    break;

case "production":
case "unit-test":
    require("./config/production.js")(CONFIG, DEFINITION);
    break;
/* falls through */
default:
    require("./config/dev.js")(CONFIG, DEFINITION);
}
    
    
module.exports = CONFIG;