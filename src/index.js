'use strict';


var libcore = require("libcore"),
    Parser = require("./parser.js");
    
function define(root, definitions, exclusions) {
    return new Parser(root, definitions, exclusions);
}

function load(json) {
    var lib = libcore;
    var parser;
    
    if (lib.string(json)) {
        try {
            json = JSON.parse(json);
        }
        catch (e) {
            throw new Error(
                "Unable to load from invalid json JSON String parameter: " +
                e.toString());
        }
    }
    else if (!lib.object(json)) {
        throw new Error("Unable to load from invalid json Object parameter.");
    }
    
    parser = new Parser();
    
    try {
        parser.fromJSON(json);
    }
    catch (e) {
        throw new Error(e);
    }
    
    return parser;
}

module.exports = {
    define: define,
    load: load
};