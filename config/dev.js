'use strict';


function augment(config) {
    config.devtool = "cheap-eval-source-map";
}


module.exports = augment;