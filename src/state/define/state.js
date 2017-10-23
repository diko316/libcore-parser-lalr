'use strict';

//import List from "./list.js";

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
            pointers = this.pointers;

        if (token in pointers) {
            if (pointers[token] !== targetState) {
                throw new Error("Invalid state target from " + this.id +
                                        " -> " + token + " -> " + targetState);
            }
        }
        else {
            pointers[token] = targetState;
            names[names.length] = token;
        }
    },

    setEnd: function (item) {
        var current = this.end;
        if (current) {
            throw new Error("There is reduce-reduce conflict in: " +
                                item.id + " <- " + item.production +
                                " from state: ", this.id);
        }
        
        this.end = [item.params, item.production, item.id];
    }

};

export default State;