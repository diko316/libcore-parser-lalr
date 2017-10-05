'use strict';

import { clone } from "../helper.js";

function Recursion(parent) {
    
    this.parent = parent || null;
    this.data = parent ? clone(parent.data) : {};

}

Recursion.prototype = {
    constructor: Recursion,

    parent: null,
    data: null,

    createChild: function (state, lexeme) {
        var recursion;

        if (this.hasRecursion(ruleId)) {
            return this;
        }

        recursion = new Recursion(this);

        recursion.data[ruleId] = recursion;

        return recursion;
    },

    hasRecursion: function (ruleId) {
        return ruleId in this.data;
    }
};

export default Recursion;