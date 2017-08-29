'use strict';

var APPEND_MIN_RE = /(\.js)$/i;

function augment(config, meta) {
    var es = meta.es,
        umd = meta.umd,
        output = config.output;
    
    // rename ".js" suffix to "min.js"
    es.file = es.file.replace(APPEND_MIN_RE, ".min.js");
    umd.file = umd.file.replace(APPEND_MIN_RE, ".min.js");
    
    // exclude es minification (uglify is unable to minify es6 modules)
    output.splice(output.indexOf(es), 1);
    
    
    config.plugins.
        push(require('rollup-plugin-uglify')({
        }));
    
}

module.exports = augment;

