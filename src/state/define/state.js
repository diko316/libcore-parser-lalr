'use strict';

function State(registry, id, items) {

    this.id = id;
    this.registry = registry;
    this.items = items || [];
    this.end = null;

    this.tokens = [];
    this.pointers = {};
}

State.prototype = {
    constructor: State,
    
    containsItems: function (items) {
        var myItems = this.items,
            total = myItems.length;
        var subject, mylen, len;

        if (items.length === total) {
            mylen = total;
            mainLoop: for (; mylen--;) {
                subject = myItems[mylen];
                len = total;
                for (; len--;) {
                    if (subject === items[len]) {
                        continue mainLoop;
                    }
                }
                return false;
            }
            return true;
        }
        return false;
    },

    pointTo: function (token, targetState) {
        var names = this.tokens,
            pointers = this.pointers,
            map = this.registry.map;

        if (token in pointers) {
            if (pointers[token] !== targetState) {
                throw new Error("Invalid state target from " + this.id +
                                    " -> " + map.lookupSymbol(token) +
                                    " -> " + map.lookupSymbol(targetState));
            }
        }
        else {
            pointers[token] = targetState;
            names[names.length] = token;
        }
    },

    setEnd: function (item) {
        var current = this.end,
            map = this.registry.map;

        if (current) {
            throw new Error("There is reduce-reduce conflict in: " + this.id +
                                " when you tried reducing it to `" +
                                map.lookupSymbol(item.production) +
                                "`, currently this state is reduced in `" +
                                map.lookupSymbol(current[1]) +
                                "` production.");
        }
        
        this.end = [item.params, item.production, item.index];
    }

};

export default State;