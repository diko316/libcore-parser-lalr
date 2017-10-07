'use strict';


import {
            string,
            object,
            array,
            contains
            
        } from "libcore";

function StateMap() {
    var start = "$start",
        end = "$end",
        tokenEnd = "$",
        states = {};

    this.stateGen =
        this.symbolGen =
        this.reduceGen = 0;

    states[start] = {};
    this.root = end;
    this.lookup = {};
    this.symbol = {};
    this.start = start;
    this.states = states;
    this.anchors = {};
    this.ends = {};
    this.exclude = {};
    this.finalized = false;
    this.rawStates = [];

    this.reduceLookup = {};
    this.reducers = {};

    this.augmentedRoot = this.generateSymbol(end);
    this.endSymbol = this.generateSymbol(tokenEnd);
    this.endToken = tokenEnd;

    

}


StateMap.prototype = {
    stateGen: 0,
    rawStates: null,
    
    constructor: StateMap,
    
    generateState: function () {
        var id = 's' + (++this.stateGen);
        this.states[id] = {};
        return id;
    },

    generateSymbol: function (name) {
        var lookup = this.lookup,
            symbols = this.symbol,
            access = ':' + name;
        var id;
        
        if (access in lookup) {
            return lookup[access];
        }
    
        // create symbol
        id = 's>' + (++this.symbolGen);
    
        lookup[access] = id;
        symbols[id] = name;
    
        return id;
    
    },

    generateReduceId: function (name, params, ruleIndex) {
        var lookup = this.reduceLookup,
            all = this.reducers,
            access = name + ':' + params + ':' + ruleIndex;
        var id;

        if (access in lookup) {
            return lookup[access];
        }

        id = 'r>' + (++this.reduceGen);

        lookup[access] = id;
        all[id] = [name, params, ruleIndex];

        return id;
    },

    lookupReducer: function (id) {
        var all = this.reducers;
        
        if (id in all) {
            return all[id];
        }

        return false;
    },

    lookupSymbol(name) {
        var symbols = this.symbol;

        if (name in symbols) {
            return symbols[name];
        }

        return false;

    },
    
    setAnchorState: function (state) {
        var anchors = this.anchors;
        
        if (!(state in anchors)) {
            this.anchors[state] = true;
        }
    },
    
    setReduceState: function (state, name, params, ruleIndex) {
        var ends = this.ends,
            id = this.generateReduceId(name, params, ruleIndex),
            all = this.reducers;
        var current;
        
        if (state in ends) {
            current = all[ends[state]];
            if (current[0] !== name || current[1] !== params) {
                throw new Error("Reduce conflict found " +
                                current[0] + ' ! <- ' + name);
            }
        }
        else {
            ends[state] = id;
        }
        
    },
    
    reset: function () {
        this.constructor();
    },

    finalize: function() {
        var list = this.rawStates;
        var c, l;

        if (!this.finalized && list) {
            this.finalized = true;

            for (c = -1, l = list.length; l--;) {
                list[++c].finalize();
            }

            // remove raw states
            list.length = 0;

            // remove lookup
            delete this.lookup;
        }
        
        return this.finalized;
    },
    
    setExcludes: function (exclude) {
        var current = this.exclude;
        var c, l;
        
        if (array(exclude)) {
            for (c = -1, l = exclude.length; l--;) {
                current[exclude[++c]] = true;
            }
        }
    },
    
    importStates: function (definition) {
        var isObject = object,
            isString = string;
        var start, states, anchors, ends, root, exclude, symbol, reducers,
            list, c, l;
        
        if (!isObject(definition)) {
            throw new Error("Invalid Object definition parameter.");
        }
        
        states = definition.states;
        if (!isObject(states)) {
            throw new Error(
                        'Invalid "states" Object in definition parameter.');
        }
        
        root = definition.root;
        if (!isString(root)) {
            throw new Error(
                        'Invalid "root" grammar rule in definition parameter.');
        }
        
        start = definition.start;
        if (!isString(start) || !(start in states)) {
            throw new Error(
                        'Invalid "start" state in definition parameter.');
        }
        
        anchors = definition.anchors;
        if (!isObject(anchors)) {
            throw new Error('Invalid "anchors" states in definition parameter.');
        }
        
        ends = definition.ends;
        if (!isObject(anchors)) {
            throw new Error('Invalid "ends" states in definition parameter.');
        }

        reducers = definition.reducers;
        if (!isObject(reducers)) {
            throw new Error('Invalid production "reducers" in definition.');
        }

        symbol = definition.symbol;
        if (!isObject(symbol)) {
            throw new Error('Invalid "symbol" map in definition parameter.');
        }

        list = definition.exclude;
        if (!array(list)) {
            throw new Error('Invalid "exclude" token in definition parameter.');
        }

        exclude = {};
        for (c = -1, l = list.length; l--;) {
            exclude[list[++c]] = true;
        }
        
        this.root = root;
        this.start = start;
        this.states = states;
        this.anchors = anchors;
        this.ends = ends;
        this.reducers = reducers;
        this.exclude = exclude;
        this.symbol = symbol;
        
        return true;
    },
    
    toObject: function () {
        var has = contains,
            exclude = this.exclude,
            list = [],
            len = 0;
        var name;

        // export exclude
        for (name in exclude) {
            if (has(exclude, name)) {
                list[len++] = name;
            }
        }


        return {
                root: this.root,
                start: this.start,
                states: this.states,
                anchors: this.anchors,
                reducers: this.reducers,
                ends: this.ends,
                exclude: list,
                symbol: this.symbol
            };
    },
    
    exportStates: function (json) {
        var current = this.toObject();
            
        if (json === true) {
            try {
                return JSON.stringify(current);
            }
            catch (e) {
                return null;
            }
        }
        
        return current;
    }
    
    
};


export default StateMap;