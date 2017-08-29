'use strict';




let pkg = require('./package.json'),
    configure = require('./config/base.js'),
    meta = {
        name: pkg.name,
        target: pkg.main,
        moduleTarget: pkg.moduleName
    },
    config = {};

// base setup
configure(config, meta);

// setup demo
require("./config/demo.js")(config, meta);

module.exports = config;