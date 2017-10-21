'use strict';

//import List from "./list.js";

function State(registry, id) {

    this.id = id;
    this.registry = registry;
    this.items = [];
    this.itemLookup = {};
    this.tokens = [];
    this.itemTokenLookup = {};
    
}

State.prototype = {
    constructor: State,
    addItem: function (closureItem) {
        var id = closureItem.id,
            list = this.items,
            lookup = this.itemLookup,
            tokenLookup = this.itemTokenLookup,
            tokens = this.tokens;
        var token, after;

        if (!(id in lookup)) {
            lookup[id] = closureItem;
            list[list.length] = id;

            after = closureItem.after;

            // for non ending items
            if (after) {
                // grouped items
                token = closureItem.token;
                if (!(token in tokenLookup)) {
                    tokens[tokens.length] = token;
                    tokenLookup[token] = [];
                }

                list = tokenLookup[token];
                list[list.length] = after;

            }

        }
    },

    getTokenStates: function (token) {
        var lookup = this.itemTokenLookup;

        return token in lookup ? lookup[token] : null;
    },

    hasItem: function (item) {
        return item in this.itemLookup;
    }

};

export default State;