'use strict';

import {
            string,
            object
        } from "libcore";
        
import Parser,
        { debug } from "./parser.js";

export {
            debug,
            Parser
        };

export {
            Base as Iterator,
            register as registerIterator
        } from "./iterator.js";

export
    function define(root, definitions, exclusions) {
        return new Parser(root, definitions, exclusions);
    }

export
    function load(json) {
        var parser;
        
        if (string(json)) {
            try {
                json = JSON.parse(json);
            }
            catch (e) {
                throw new Error(
                    "Unable to load from invalid json JSON String parameter: " +
                    e.toString());
            }
        }
        else if (!object(json)) {
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
export
    function isParser(parser) {
        return parser instanceof Parser;
    }




// integrate to libcore
//module.exports = libcore.lalr = {
//    Parser: Parser,
//    Iterator: iteratorManager.Base,
//    isParser: isParser,
//    define: define,
//    load: load,
//    registerIterator: iteratorManager.register
//};