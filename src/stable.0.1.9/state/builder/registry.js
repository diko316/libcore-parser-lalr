'use strict';

import {
            string,
            contains
        } from "libcore";


function Registry(map, tokenizer) {
    this.tokenizer = tokenizer;
    this.map = map;

    this.productions = {};
    this.lexemes = {};

    this.stateIndex = {};
    this.vstateIdGen = 0;
    this.vstateLookup = {};
    this.vstates = [];
    this.ends = {};

    this.rules = {};
    this.recursions = {};
    
    this.terminals = [];
    this.terminalLookup = {};

    this.symbolGen = 0;
    this.symbol = {};
    this.lookup = {};

    this.stateTagIdGen = 0;
    this.stateTagId = {};
    this.stateTagIdLookup = {};

    

}

Registry.prototype = {
    constructor: Registry,

    startRule: null,
    rules: null,

    hashState: function (name) {
        var lookup = this.stateTagIdLookup,
            access = ':' + name;
        var id;

        if (access in lookup) {
            return lookup[access];
        }

        id = this.map.debugMode ?
                ':' + name :
                (++this.stateTagIdGen).toString(36);

        lookup[access] = id;
        this.stateTagId[id] = name;

        return id;

    },

    lookupState: function (id) {
        var list = this.stateTagId;
        
        return id in list ? list[id] : null;
    },

    hashLexeme: function (name) {
        
        var lookup = this.lookup,
            symbols = this.symbol,
            access = ':' + name;
        var id;
        
        if (access in lookup) {
            return lookup[access];
        }
    
        // create symbol
        id = this.map.debugMode ?
                '[' + name + ']' :
                (++this.symbolGen).toString(36);
    
        lookup[access] = id;
        symbols[id] = name;
    
        return id;
    
    },

    lookupLexeme: function (id) {
        var lookup = this.lookup;
        return id in lookup ? lookup[id] : null;
    },

    terminalExist: function (terminal) {
        var lookup = this.terminalLookup;

        return string(terminal) ?
                    contains(lookup, terminal) :
                    '/' + terminal.source + '/' in lookup;
    },

    registerTerminal: function (terminal, name) {
        var lookup = this.terminalLookup,
            names = this.terminals,
            access = this.map.generateSymbol('/' + terminal.source + '/');
        var list;

        if (!name) {
            name = access;
        }

        // allow register
        if (!(access in lookup)) {
            
            lookup[access] = name;

            // register named
            if (access === name) {
                names[names.length] = name;

            }
            else if (!contains(lookup, name)) {
                names[names.length] = name;
                lookup[name] = [access];

            }
            else {
                list = lookup[name];
                list[list.length] = access;
            }

            this.tokenizer.define([name, terminal]);

            return name;
            
        }

        return false;


    },

    registerRule: function (name, mask, terminals) {
        var states = this.stateIndex,
            recursions = this.recursions,
            productions = this.productions,
            lexemes = this.lexemes,
            ruleIndex = this.rules,
            rules = [],
            rl = 0,
            c = -1,
            total = mask.length,
            l = total + 1;
        var items, id, lexeme, list, index, ruleId;

        if (!(name in productions)) {
            productions[name] = [];
            lexemes[name] = [];
        }

        list = productions[name];
        index = list.length;
        list[index] = rules;
        lexemes[name][index] = mask;
        ruleId = ':' + name + '-> ' + mask.join(',');

        if (ruleId in ruleIndex) {
            throw new Error("Duplicate Grammar Rule found " +
                                this.lookupState(id) + " in production: " +
                                this.map.lookupSymbol(name));
        }

        ruleIndex[ruleId] = name;
        //console.log("------------------------------- Rules for: " + name);

        for (; l--;) {
            lexeme = mask[++c];

            items = mask.slice(0);
            items.splice(c, 0, '.');
            id = this.hashState(items.join(' '));

            rules[rl++] = id;

            states[id] = id;

            ruleIndex[id] = name;

            // non-terminal
            if (l && !(c in terminals)) {
                //console.log("recusion? ", id, " is ", lexeme);
                recursions[id] = lexeme;
            }

        }

    },

    getRuleProduction: function (id) {
        var rules = this.rules;

        return id in rules ? rules[id] : null;

    },

    getRules: function (production) {
        var list = this.productions;

        return production in list ?
                    [list[production], this.lexemes[production]] : null;
    },

    isRecursed: function (id) {
        var recursions = this.recursions;
        return id in recursions && recursions[id];
    },

    setEnd: function (id, production, params, ruleId) {
        var ends = this.ends,
            map = this.map,
            state = this.vstateLookup[id];

        if (!(id in ends)) {
            ends[id] = [production, params, ruleId];
        }
        else if (ends[id][0] !== production) {
            throw new Error("Reduce conflict! " + state.id +
                                ":" + map.lookupSymbol(ends[id][0]) + ' <- ' +
                                map.lookupSymbol(production));
        }
        
    },

    isEnd: function (id) {
        var ends = this.ends;
        return id in ends && ends[id];
    }
};


export default Registry;