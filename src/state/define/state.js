'use strict';


function State(map) {
    this.map = map;
    this.tags = [];
    this.pointer = null;
}

State.prototype = {
    pointer: null,
    map: null,
    constructor: State,

    tag: function (id) {
        var list = this.tags;

        if (list.indexOf(id) === -1) {
            list[list.length] = id;
        }

        return this;
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

    point: function (token) {
        var pointer = this.pointed(token);
        var last;

        // create
        if (!pointer) {
            pointer = {
                token: token,
                to: new State(this.map),
                next: null
            };
            last = this.pointer;
            if (last) {
                for (; last.next; last = last.next) { }
                last.next = pointer;
            }
            else {
                this.pointer = pointer;
            }
        }
        return pointer.to;
    }
};

export default State;