'use strict';

import { clone } from "../helper.js";

import Pointer from "./pointer.js";

function Item(id, map) {
    var list = map.rawStates;
    
    this.map = map;
    this.state = id = id || map.generateState();
    this.base = this;
    this.watched = [];
    this.reduceList = [];

    // register as raw state
    list[list.length] = this;

}

Item.prototype = {
    state: null,
    constructor: Item,
    nextInQueue: null,
    parent: null,
    map: null,
    pointer: null,
    watched: null,
    contextPointer: null,
    reduceList: null,
    lexeme: "$end",
    recursion: {},
    finalized: false,

    getRecursionItem: function (ruleId) {
        var recursion = this.recursion;

        return ruleId in recursion ? recursion[ruleId] : null;

    },

    insertNextQueue: function (item) {
        var after = this.nextInQueue,
            last = item;

        this.nextInQueue = item;

        // connect last item with my next item
        for (; last.nextInQueue; last = last.nextInQueue) { }

        last.nextInQueue = after;

    },

    appendQueue: function (item) {
        var last = this;

        for (; last.nextInQueue; last = last.nextInQueue) { }

        last.nextInQueue = item;

    },

    createRecursion: function (ruleId, lexeme) {
        var duplicate = clone,
            item = duplicate(this),
            recursion = duplicate(this.recursion);

        item.parent = this;

        item.lexeme = lexeme;
        item.recursion = recursion;
        recursion[ruleId] = item;

        item.contextPointer =
            item.nextInQueue = null;

        return item;
    },

    getPointerItem(lexeme) {
        var pointer = this.pointer;

        // find from parent and up
        for (; pointer; pointer = pointer.next) {
            if (pointer.item === lexeme) {
                return pointer.to;
            }
        }

        return null;

    },

    point: function (lexeme) {

        var Class = Pointer,
            found = this.getPointerItem(lexeme);
        var list, c, len, item, has;

        // create if not found
        if (!found) {

            // create item
            found = new Item(null, this.map);
            found.lexeme = lexeme;

            // share recursion
            found.recursion = this.recursion;

            // create pointer
            this.onSetPointer(new Class(lexeme, found));

            // populate dependencies
            list = this.watched;

            for (c = -1, len = list.length; len--;) {
                item = list[++c];
                has = item.getPointerItem(lexeme);
                if (!has) {
                    item.onSetPointer(new Class(lexeme, found));
                }
            }
        }

        return found;

    },

    watchItem: function (item) {
        var list = this.watched,
            Class = Pointer;
        var pointer, lexeme, found;

        if (item.state !== this.state && list.indexOf(item) === -1) {
            
            list[list.length] = item;

            pointer = this.pointer;

            // add current pointers
            for (; pointer; pointer = pointer.next) {
                lexeme = pointer.item;
                found = item.getPointerItem(lexeme);

                if (!found) {
                    item.onSetPointer(new Class(lexeme, pointer.to));
                }
            }
        }
        
    },

    onSetPointer: function (pointer) {
        var last = this.pointer,
            context = this.contextPointer;
        var parent;

        // connect to last item
        if (last) {
            // connect last
            for (; last.next; last = last.next) {}
            last.next = pointer;

        }
        // new pointer
        else {
            // set base pointer
            this.base.pointer = pointer;
        }

        // populate context pointer across parents
        if (!context) {
            // populate parent context pointers
            parent = this;
            for (; parent; parent = parent.parent) {
                if (!parent.contextPointer) {
                    parent.contextPointer = pointer;
                }
            }
        }
    },

    finalize: function () {
        var map = this.map,
            id = this.state,
            stateObject = map.states[id];

        var list, c, len, item, lexeme;

        // finalize main pointers
        item = this.pointer;

        for (; item; item = item.next) {
            lexeme = item.item;

            if (!(lexeme in stateObject)) {
                stateObject[lexeme] = item.to.state;
            }
        }

        // reduce
        list = this.reduceList;
        for (c = -1, len = list.length; len--;) {
            item = list[++c];
            map.setReduceState(id, item[0], item[1], item[2]);
        }

    },

    reduce: function (production, params, group) {
        var list = this.reduceList;

        list[list.length] = [production, params, group];

    }

};

export default Item;