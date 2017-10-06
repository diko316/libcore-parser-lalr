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

    }

};

export default StateObject;