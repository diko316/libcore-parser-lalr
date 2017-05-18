'use strict';


function augment(config) {
    config.devtool = "eval-source-map";
    config.entry.demo = ["./src/demo.js"];
}


module.exports = augment;