'use strict';

import {
            string,
            contains
        } from "libcore";


function Registry(map, tokenizer) {
    this.tokenizer = tokenizer;
    this.map = map;

    this.transitions = {};
    this.recursions = {};
    this.starts = {};
    this.ends = {};
    this.rules = {};
    
    this.terminals = [];
    this.terminalLookup = {};

    this.symbolGen = 0;
    this.symbol = {};
    this.lookup = {};


    

}

Registry.prototype = {
    constructor: Registry,

    startRule: null,
    rules: null,

    hashLexeme: function (name) {
        
        var lookup = this.lookup,
            symbols = this.symbol,
            access = ':' + name;
        var id;
        
        if (access in lookup) {
            return lookup[access];
        }
    
        // create symbol
        //id = '>' + (++this.symbolGen);
        //id = name.replace(/[^a-zA-Z0-9]/, 'x');
        id = name;
    
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
            access = '/' + terminal.source + '/';
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

            return name;
            
        }

        return false;


    },

    registerRule: function (name, mask, terminals) {
        var transitions = this.transitions,
            recursions = this.recursions,
            starts = this.starts,
            ends = this.ends,
            rules = this.rules,
            c = -1,
            total = mask.length,
            l = total + 1;
        var items, terminal, id, start, last;

        start = name in rules ? rules[name] : null;

        if (!(name in rules)) {
            rules[name] = null;
        }

        console.log("------------------------------- Rules for: " + name);

        for (; l--;) {
            //item = mask[++c];
            

            items = mask.slice(0);
            items.splice(++c, 0, '.');
            id = items.join(' ');

            console.log(id);

            if (id in transitions) {
                throw new Error("Duplicate Grammar Rule found in " + name);
            }

            transitions[id] = name;

            if (l && !(c in terminals)) {
                recursions[id] = mask[c];
            }

            


        }


    }
};


export default Registry;