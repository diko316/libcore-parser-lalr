'use strict';

var libcore = require("libcore");


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
    
    setReduceState: function (state, name, params) {
        var ends = this.ends;
        var current;
        
        if (state in ends) {
            current = ends[state];
            if (current[0] !== name || current[1] !== params) {
                console.log(this);
                throw new Error("Reduce conflict found " +
                                current[0] + ' ! <- ' + name);
            }
        }
        else {
            ends[state] = [name, params];
        }
        
    },
    
    reset: function () {
        var start = '$start',
            states = {};
        
        states[start] = {};
        
        this.start = start;
        this.states = states;
        this.anchors = {};
        this.ends = {};
        this.exclude = {};
    },
    
    setExcludes: function (exclude) {
        var current = this.exclude;
        var c, l;
        
        if (libcore.array(exclude)) {
            for (c = -1, l = exclude.length; l--;) {
                current[exclude[++c]] = true;
            }
        }
    },
    
    importStates: function (definition) {
        var lib = libcore,
            object = lib.object;
        var start, states, anchors, ends;
        
        if (!object(definition)) {
            throw new Error("Invalid Object definition parameter.");
        }
        
        states = definition.states;
        if (!object(states)) {
            throw new Error(
                        'Invalid "states" Object in definition parameter.');
        }
        
        start = definition.start;
        if (!lib.string(start) || !(start in states)) {
            throw new Error(
                        'Invalid "start" state in definition parameter.');
        }
        
        anchors = definition.anchors;
        if (!object(anchors)) {
            throw new Error('Invalid "anchors" states in definition parameter.');
        }
        
        ends = definition.ends;
        if (!object(anchors)) {
            throw new Error('Invalid "ends" states in definition parameter.');
        }
        
        this.start = start;
        this.states = states;
        this.anchors = anchors;
        this.ends = ends;
        
        return true;
    },
    
    exportStates: function (json) {
        var current = {
                start: this.start,
                states: this.states,
                anchors: this.anchors,
                ends: this.ends
            };
            
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


module.exports = StateMap;