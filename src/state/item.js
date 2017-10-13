'use strict';

import { clone } from "../helper.js";

import Pointer from "./pointer.js";

function Item(map, recursion, id) {
    var list = map.rawStates;
    
    this.map = map;
    this.state = id = id || map.generateState();
    this.base = this;
    this.watched = [];
    this.reduceList = [];
    this.recursion = recursion;
    this.appliedRecursion = {};

    this.references = [];

    this.observed = [];

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
    //contextPointer: null,
    reduceList: null,
    recursion: null,
    finalized: false,
    appliedRecursion: null,

    getRecursionItem: function (ruleId) {
        var recursion = this.recursion;

        return ruleId in recursion ? recursion[ruleId] : null;

    },

    // insertNextQueue: function (item) {
    //     var after = this.nextInQueue,
    //         last = item;

    //     this.nextInQueue = item;

    //     // connect last item with my next item
    //     for (; last.nextInQueue; last = last.nextInQueue) { }

    //     last.nextInQueue = after;

    // },

    // appendQueue: function (item) {
    //     var last = this;

    //     for (; last.nextInQueue; last = last.nextInQueue) { }

    //     last.nextInQueue = item;

    // },

    hasRecursion: function (ruleId) {
        var recursion = this.recursion;
        
        return ruleId in recursion ? recursion[ruleId] : null;
    },

    setRecursion: function (ruleId) {
        var //item = clone(this),
            // common recursion
            recursion = this.recursion;

        // item.parent = this;

        // item.recursion = recursion;
        recursion[ruleId] = this;

        // item.contextPointer =
        //     item.nextInQueue = null;

        return this;
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

    point: function (lexeme, ruleId) {

        var Class = Pointer,
            found = this.getPointerItem(lexeme);
        var list, c, len, item, has, recursion;

        // create if not found
        if (!found) {
            recursion = this.recursion;

            // create item
            found = new Item(this.map, recursion, null);

            // share recursion
            found.recursion = recursion;

            // create pointer
            this.onSetPointer(new Class(lexeme, found, ruleId));

            // populate dependencies
            list = this.watched;

            for (c = -1, len = list.length; len--;) {
                item = list[++c];
                has = item.getPointerItem(lexeme);
                if (!has) {
                    item.onSetPointer(new Class(lexeme, found, ruleId));
                }
            }
        }

        return found;

    },

    // watchItem: function (item) {
    //     var list = this.watched,
    //         Class = Pointer;
    //     var pointer, lexeme, found;

    //     if (item.state !== this.state && list.indexOf(item) === -1) {
            
    //         list[list.length] = item;

    //         pointer = this.pointer;

    //         // add current pointers
    //         for (; pointer; pointer = pointer.next) {
    //             lexeme = pointer.item;
    //             found = item.getPointerItem(lexeme);

    //             if (!found) {
    //                 item.onSetPointer(new Class(lexeme, pointer.to));
    //             }
    //         }
    //     }
        
    // },

    onSetPointer: function (pointer) {
        var last = this.pointer;
            //context = this.contextPointer;
        //var parent;

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
        // if (!context) {
        //     // populate parent context pointers
        //     parent = this;
        //     for (; parent; parent = parent.parent) {
        //         if (!parent.contextPointer) {
        //             parent.contextPointer = pointer;
        //         }
        //     }
        // }
    },

    observe: function (item, ruleId) {
        var list = this.observed;

        if (item !== this) {
            list[list.length] = [item, ruleId];
        }

    },

    finalizeObserved: function () {
        var list = this.observed,
            c = -1,
            l = list.length,
            Class = Pointer;

        var item, pointer, currentPointer, lexeme;

        for (; l--;) {
            item = list[++c][0];

            // sync pointers
            for (pointer = this.pointer; pointer; pointer = pointer.next) {
                lexeme = pointer.item;
                currentPointer = item.getPointerItem(lexeme);

                // if (item.state === 's6' && !currentPointer) {
                //     console.log("applying pointer? ", lexeme, '->', pointer.to.state, " existing? ", !!currentPointer);
                // }


                // populate!
                if (!currentPointer) {
                    item.onSetPointer(new Class(lexeme, pointer.to, pointer.ruleIds));
                }
                // else {

                //     if (item.state === 's6') {
                //         console.log("already defined pointer ", item.state, ':', lexeme, " -> ", pointer.to.state);
                //     }
                // }
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