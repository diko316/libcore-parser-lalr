'use strict';


var libcore = require("libcore"),
    Parser = require("./parser.js"),
    iteratorManager = require("./iterator.js");
    
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

function isParser(parser) {
    return parser instanceof Parser;
}



module.exports = {
    Parser: Parser,
    Iterator: iteratorManager.Base,
    isParser: isParser,
    define: define,
    load: load,
    registerIterator: iteratorManager.register
};