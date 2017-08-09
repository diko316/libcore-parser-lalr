'use strict';

var helper = require("../helper.js");

function StateObject(map, id) {
    this.id = id;
    this.map = map;
    this.pointer = {};
    this.lexemes = [];
}

StateObject.prototype = {
    constructor: StateObject,
    id: null,
    pointer: null,
    parent: null,
    rid: null,
    lexemes: null,
    
    clone: function (rid) {
        var dupe = helper.clone(this);
        if (rid) {
            dupe.rid = rid;
        }
        dupe.parent = this;

        return dupe;
    },
    
    point: function (lexeme) {
        var pointer = this.pointer,
            lexemes = this.lexemes,
            map = this.map;
        var vstate, state;
        
        if (!(lexeme in pointer)) {
            state = this.map.generateState();
            vstate = this.clone();
            vstate.id = state;
            vstate.pointer = {};
            vstate.lexemes = [];
            
            lexemes[lexemes.length] = lexeme;
            
            pointer[lexeme] = vstate;
            //console.log(this.id, ':', lexeme, '-> ', state);
            map.states[this.id][lexeme] = state;
        }
        
        return pointer[lexeme];
        
    },
    
    reduce: function (rule, params, ruleIndex) {
        this.map.setReduceState(this.id, rule, params, ruleIndex);
    }
};


module.exports = StateObject;