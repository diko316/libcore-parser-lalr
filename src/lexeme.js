'use strict';

import { contains } from "libcore";

var TYPE = {
        terminal: 1,
        nonterminal: 2,
        compound: 3,
        end: 4
    };
    
    

function Lexeme(type) {
    this.terminal = false;
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
    terminal: false,
    
    useType: function (type) {
        var types = TYPE;
        this.type = type = contains(types, type) ?
                                types[type] : types.token;
        if (type === TYPE.terminal) {
            this.terminal = true;
        }
    }
};

export {
        TYPE as type,
        Lexeme
    };

export default Lexeme;