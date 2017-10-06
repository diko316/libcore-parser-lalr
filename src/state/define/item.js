'use strict';

import { clone } from "../../helper.js";

function Item(state, lexeme) {
    this.state = state;
    this.lexeme = lexeme;
}

Item.prototype = {
    constructor: Item,
    next: null,
    state: null,
    parent: null,
    lexeme: "$end",
    recursion: {},

    getRecursionRule: function (ruleId) {
        var recursion = this.recursion;

        return ruleId in recursion ? recursion[ruleId] : null;

    },

    insertNext: function (item) {
        var after = this.next,
            last = item;

        this.next = item;

        // connect last item with my next item
        for (; last.next; last = last.next) { }

        last.next = after;

    },

    append: function (item) {
        var last = this;

        for (; last.next; last = last.next) { }

        last.next = item;

    },

    createRecursion: function (vstate, ruleId, lexeme) {
        var item = new Item(vstate, lexeme),
            recursion = clone(this.recursion);

        item.recursion = recursion;
        item.recursion[ruleId] = item;
        item.parent = this;

        return item;
    },

    merge: function (item) {

    }

};

export default Item;