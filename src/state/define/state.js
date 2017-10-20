'use strict';

import List from "./list.js";

function State(registry, id) {
    var list = registry.vstates;

    id = id || (++registry.vstateIdGen).toString(36);
    
    registry.vstateLookup[id] = 
        list[list.length] = this;
    
    this.id = id;
    this.registry = registry;
    this.tags = {};
    this.tagNames = [];
    this.pointer = new List();
    this.rparent = null;
    this.recursedAs = {};
    
}

State.prototype = {
    pointer: null,
    registry: null,
    constructor: State,

    tag: function (id) {
        var list = this.tags,
            names = this.tagNames;

        if (!(id in list)) {
            list[id] = true;
            names[names.length] = id;
        }

        return this;
    },

    hasTag: function (id) {
        return id in this.tags;
    },

    setRecursed: function (production) {
        var access = ':' + production,
            list = this.recursedAs;

        if (!(access in list)) {
            list[access] = true;
        }

        return this;
    },

    isRecursed: function (production) {
        var access = ':' + production,
            list = this.recursedAs;

        return access in list;
    },

    findRecursion: function (id) {
        var me = this,
            parent = me.rparent;

        for (; parent; parent = parent.rparent) {
            if (parent.hasTag(id)) {
                return parent;
            }
        }
        return null;
    },

    pointed: function (token) {
        var pointer = this.pointer.first;
        var item;

        for (; pointer; pointer = pointer[0]) {
            item = pointer[1];
            if (item[1] === token) {
                return item[0];
            }
        }
        
        return null;
    },

    pointTo: function (token, state) {
        this.pointer.push([state, token]);
        return state;
    },

    point: function (token, recurseState) {
        var pointed = this.pointed(token);
        var newState;

        // create
        if (!pointed) {
            newState = new State(this.registry);
            newState.rparent = recurseState;

            return this.pointTo(token, newState);

        }

        return pointed;
    }
};

export default State;