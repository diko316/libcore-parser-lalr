'use strict';

var EXPORT = Lexeme,
    CORE = require("libcore"),
    TYPE = {
        token: 1,
        end: 2,
        compound: 3
    };
    
    

function Lexeme(type) {
    this.useType(type);
}


Lexeme.prototype = {
    constructor: Lexeme,
    name: null,
    rule: null,
    value: null,
    reduceCount: 0,
    from: 0,
    to: 0,
    
    parent: null,
    first: null,
    last: null,
    next: null,
    previous: null,
    
    useType: function (type) {
        var types = TYPE;
        this.type = CORE.contains(types, type) ?
                        types[type] : types.token;
    }
};


EXPORT.type = TYPE;
EXPORT["default"] = EXPORT;

module.exports = EXPORT;