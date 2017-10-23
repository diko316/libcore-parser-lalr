'use strict';

import {
            string,
            contains
        } from "libcore";


function Registry(map, tokenizer) {
    this.tokenizer = tokenizer;
    this.map = map;

    this.ruleLookup = {};
    this.productions = {};
    this.closureItems = {};

    // this.productions = {};
    // this.productionNames = [];
    // this.lexemes = {};
    // this.closures = {};

    // this.stateIndex = {};
    // this.vstateIdGen = 0;
    // this.vstateLookup = {};
    // this.vstates = [];
    // this.ends = {};

    // this.rules = {};
    // this.recursions = {};
    
    this.terminals = [];
    this.terminalLookup = {};

    // this.symbolGen = 0;
    // this.symbol = {};
    // this.lookup = {};

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
        var closureItems = this.closureItems,
            rules = this.productions,
            ruleIndex = this.ruleLookup,
            c = -1,
            l = mask.length + 1,
            before = null,
            params = 0;
        var items, state, item, ruleCount;

        if (!(name in rules)) {
            rules[name] = [];
        }

        rules = rules[name];
        ruleCount = rules.length + 1;

        for (; l--;) {
            items = mask.slice(0);
            items.splice(++c, 0, '.');
            state = this.hashState(name + '->' + items.join(' '));

            // first
            if (!c) {
                if (state in ruleIndex) {
                    throw new Error("Duplicate Grammar Rule found " +
                                    this.lookupState(state) +
                                    " in production: " +
                                    this.map.lookupSymbol(name));
                }
                ruleIndex[state] = name;

                // register production state
                rules[rules.length] = state;
            }

            closureItems[state] =
                item = {
                    id: state,
                    production: name,
                    index: ruleCount,
                    before: null,
                    after: null,
                    terminal: false,
                    token: null
                };

            if (before) {
                item.before = before.id;
                before.after = state;
            }
            
            before = item;

            // has token lookup
            if (l) {
                params++;
                item.terminal = c in terminals;
                item.token = mask[c];
            }
            else {
                item.params = params;
            }
            
        }

    },

    createClosure: function (items) {
        var definitions = this.closureItems,
            productionItems = this.productions,
            created = {},
            processed = {},
            tokens = [],
            tl = 0,
            c = -1,
            l = items.length;
        var item, token, terminal, list, additional;

        items = items.slice(0);

        for (; l--;) {
            item = items[++c];
            if (item in created) {
                items.splice(c--, 1);
                continue;
            }
            created[item] = true;
            item = definitions[item];
            token = item.token;
            terminal = item.terminal;

            if (token) {
                
                if (token in processed) {
                    list = tokens[processed[token]][1];
                    list[list.length] = item.after;
                }
                else {
                    processed[token] = tl;
                    tokens[tl++] = [token, [item.after]];

                    // non-terminal
                    if (!terminal) {
                        // recurse get additional production first states
                        additional = productionItems[token];
                        items.push.apply(items, additional);
                        l += additional.length;

                    }
                }

            }
        }

        return [items, tokens];

    }
};


export default Registry;