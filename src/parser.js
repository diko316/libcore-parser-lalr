'use strict';

var libcore = require("libcore"),
    Tokenizer = require("libcore-tokenizer"),
    StateMap = require("./state/map.js"),
    builder = require("./state/builder.js"),
    BaseIterator = require("./iterator/base.js"),
    ITERATORS = {};
    
    
function registerIterator(name, Class) {
    var lib = libcore,
        Base = BaseIterator;
    
    if (!lib.string(name)) {
        throw new Error("Invalid iterator name parameter.");
    }
    
    if (!lib.method(Class) ||
        (Class !== Base && !(Class.prototype instanceof Base))) {
        throw new Error("Invalid iterator Class parameter.");
    }
    
    ITERATORS[name] = Class;
    
}

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
    
    iterator: function (name, Class) {
        var list = ITERATORS,
            l = arguments.length;
        
        // set
        if (l > 1) {
            registerIterator(name, Class);
            return this;
        }
        
        // get and instantiate
        return l < 1 ?
                    
                    new (list.base)(this) :
                    
                    libcore.contains(list, name) ?
                    
                        new (list[name])(this) : null;
    
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


// register base iterator
registerIterator('base', BaseIterator);


module.exports = Parser;