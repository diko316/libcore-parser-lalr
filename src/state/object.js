'use strict';

//import { clone } from "../helper.js";

//import { each } from "libcore";

import Pointer from "./pointer.js";

function StateObject(map, id) {

    this.id = id || map.generateState();
    this.map = map;
    this.merges = [this];

}

StateObject.prototype = {
    constructor: StateObject,
    id: null,
    pointer: null,
    base: null,
    merges: null,

    point: function (lexeme) {
        var target = this.getTarget(lexeme);
        var pointer, last, after;

        if (!target) {
            target = new StateObject(this.map);
            pointer = new Pointer(lexeme, target);

            last = this.pointer;
            this.pointer = pointer;

            if (last) {
                after = last.after;
                if (after) {
                    after.before = pointer;
                    pointer.after = after;
                }

                pointer.before = last;
                
            }

        }

        return target;

    },

    getTarget: function (lexeme) {
        var list = this.merges,
            l = list.length;
        var pointer;


        for (; l--;) {
            pointer = list[l].pointer;
            
            for (; pointer; pointer = pointer.before) {
                if (pointer.item === lexeme) {
                    return pointer.to;
                }
            }
        }

        return null;
    },

    merge: function (state) {
        var list = this.merges;

        if (list.indexOf(state) === -1) {
            list[list.length] = state;
        }
        
    },

    finalize: function () {
        var map = this.map,
            mapPointer = map.states[this.id],
            list = this.merges,
            l = list.length;
        var pointer, item, target;

        if (this.id === 's36') {
            console.log(list);
        }

        for (; l--;) {
            pointer = this.pointer;
            
            for (; pointer; pointer = pointer.before) {
                item = pointer.item;
                target = pointer.to.id;

                if (!(item in mapPointer)) {
                    mapPointer[item] = target;
                }
            }
        }

        return null;

    }

};

export default StateObject;