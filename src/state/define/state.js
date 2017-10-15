'use strict';


function State(registry, id) {
    var list = registry.vstates;

    id = id || 's' + (++registry.vstateIdGen);
    
    registry.vstateLookup[id] = 
        list[list.length] = this;
    
    this.id = id;
    this.registry = registry;
    this.tags = {};
    this.tagNames = [];
    this.pointer = 
        this.rparent = null;

    
}

State.prototype = {
    pointer: null,
    registry: null,
    constructor: State,

    tag: function (id, anchored) {
        var list = this.tags,
            names = this.tagNames;

        if (anchored) {
            console.log("anchored! ", id);
        }

        if (!(id in list)) {
            list[id] = true;
            names[names.length] = id;
        }

        return this;
    },

    hasTag: function (id) {
        return id in this.tags;
    },

    findRecursion: function (id) {
        var parent = this;

        for (; parent; parent = parent.rparent) {
            if (parent.hasTag(id)) {
                return parent;
            }
        }
        return null;
    },

    pointed: function (token) {
        var pointer = this.pointer;

        for (; pointer; pointer = pointer.next) {
            if (pointer.token === token) {
                return pointer;
            }
        }
        return null;
    },

    pointTo: function (token, state) {
        var last = this.pointer,
            pointer = {
                token: token,
                to: state,
                next: null
            };

        if (last) {
            for (; last.next; last = last.next) { }
            last.next = pointer;
        }
        else {
            this.pointer = pointer;
        }

        return state;
    },

    point: function (token, recurseState) {
        var pointer = this.pointed(token);
        var newState;

        // create
        if (!pointer) {
            newState = new State(this.registry);
            newState.rparent = recurseState;

            return this.pointTo(token, newState);

        }

        return pointer.to;
    }
};

export default State;