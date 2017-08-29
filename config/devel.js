'use strict';

var browsersync = require('rollup-plugin-browsersync');



function configure(config) {
    config.plugins.
        push(browsersync({
                server: {
                    baseDir: "dist",
                    index: "index.html"
                },
                port: 3000,
                open: false,
                files: ["dist/**/*.html",
                        "dist/**/*.js"]
            }));
}
    
    
module.exports = configure;