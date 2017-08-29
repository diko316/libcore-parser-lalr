'use strict';




let pkg = require('./package.json'),
    configure = require('./config/base.js'),
    meta = {
        name: pkg.name,
        esTarget: pkg.module,
        target: pkg.main,
        moduleTarget: pkg.moduleName
    },
    config = {};

// base setup
configure(config, meta);

// setup by env
switch (process.env.BUILD_MODE) {
case 'production':
    require("./config/production.js")(config, meta);
    break;

case 'compressed':
    require("./config/compressed.js")(config, meta);
    break;

case 'unit-test':
    require("./config/unit-test.js")(config, meta);
    break;

default:
    require("./config/devel.js")(config, meta);
}


module.exports = config;