'use strict';


import {
            string,
            object,
            array
            
        } from "libcore";

function StateMap() {
    this.reset();
}


StateMap.prototype = {
    stateGen: 0,
    
    constructor: StateMap,
    
    generateState: function () {
        var id = 's' + (++this.stateGen);
        this.states[id] = {};
        return id;
    },
    
    setAnchorState: function (state) {
        var anchors = this.anchors;
        
        if (!(state in anchors)) {
            this.anchors[state] = true;
        }
    },
    
    setReduceState: function (state, name, params, ruleIndex) {
        var ends = this.ends;
        var current;
        
        if (state in ends) {
            current = ends[state];
            if (current[0] !== name || current[1] !== params) {
                throw new Error("Reduce conflict found " +
                                current[0] + ' ! <- ' + name);
            }
        }
        else {
            ends[state] = [name, params, ruleIndex];
        }
        
    },
    
    reset: function () {
        var start = '$start',
            states = {};
        
        states[start] = {};
        this.root = '$end';
        this.start = start;
        this.states = states;
        this.anchors = {};
        this.ends = {};
        this.exclude = {};
        this.finalized = false;
    },

    finalize: function() {
        if (!this.finalized) {
            this.finalized = true;
        }
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
        var start, states, anchors, ends, root, exclude;
        
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

        exclude = definition.exclude;
        if (!isObject(exclude)) {
            throw new Error('Invalid "exclude" token in definition parameter.');
        }
        
        this.root = root;
        this.start = start;
        this.states = states;
        this.anchors = anchors;
        this.ends = ends;
        this.exclude = exclude;
        
        return true;
    },
    
    toObject: function () {
        return {
                root: this.root,
                start: this.start,
                states: this.states,
                anchors: this.anchors,
                ends: this.ends,
                exclude: this.exclude
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