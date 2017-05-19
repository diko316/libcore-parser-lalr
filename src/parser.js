'use strict';

var libcore = require("libcore"),
    Tokenizer = require("libcore-tokenizer"),
    StateMap = require("./state/map.js"),
    builder = require("./state/builder.js"),
    iteratorManager = require("./iterator.js");

function Parser(root, definition, exclude) {
    
    this.tokenizer = new Tokenizer();
    this.map = new StateMap();
    
    if (root && definition) {
        this.define(root, definition, exclude);
    }
}


Parser.prototype = {
    subject: '',
    tokenizer: null,
    map: null,
    ready: false,
    constructor: Parser,
    
    iterator: function (name) {
        var mgr = iteratorManager;
        var Iterator;
        
        if (arguments.length) {
            Iterator = mgr.get(name);
            if (!Iterator) {
                throw new Error("Invalid iterator name parameter.");
            }
        }
        else {
            Iterator = mgr.get(mgr.defaultIterator);
        }
        
        return new Iterator(this);
    },
    
    define: function (root, definition, exclude) {
        var lib = libcore,
            array = lib.array;
        var ready;
        
        if (!array(exclude)) {
            exclude = [];
        }
        
        if (lib.string(root) && array(definition)) {
            this.ready = ready = builder(root,
                                        this.map,
                                        this.tokenizer,
                                        definition,
                                        exclude);
            
            return ready;
        }
        
        return false;
    },
    
    fromJSON: function (json) {
        var lib = libcore,
            object = lib.object;
        var tokenMap;
        
        if (lib.string(json)) {
            try {
                json = JSON.parse(json);
            }
            catch (e) {
                throw new Error("Invalid JSON String json parameter.");
            }
        }
        
        if (!object(json)) {
            throw new Error("Invalid Object json parameter.");
        }
        
        tokenMap = json.tokens;
        
        if (!object(tokenMap)) {
            throw new Error('Invalid "tokens" property of json parameter.');
        }
        
        this.tokenizer.fromJSON(tokenMap);
        this.map.importStates(json);
        
        return this;
        
    },
    
    toJSON: function () {
        
    },
    
    parse: function (subject, reducer, iterator) {
        var lib = libcore,
            string = lib.string,
            rpn = [],
            rl = 0;
        var lexeme, name, value;
        
        if (!string(subject)) {
            throw new Error("Invalid string subject parameter");
        }
        
        iterator = lib.string(iterator) ?
                        this.iterator(iterator) :
                        this.iterator();
        
        if (!iterator) {
            throw new Error("Invalid Iterator parameter.");
        }
        
        if (!lib.object(reducer)) {
            reducer = {};
        }
        
        iterator.set(subject);
        
        for (lexeme = iterator.next(); lexeme; lexeme = iterator.next()) {
            rpn[rl++] = lexeme;
            
            name = lexeme.name;
            if (name in reducer) {
                value = reducer[name](name, lexeme.value, lexeme);
                
                if (typeof value !== "undefined") {
                    lexeme.value = value;
                }
                else if (lexeme.params !== 0) {
                    lexeme.value = null;
                }
                
            }
            
        }
        
        return iterator.error ? false : rpn;
        
    }
};


module.exports = Parser;