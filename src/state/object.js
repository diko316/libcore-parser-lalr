'use strict';

import { clone } from "../helper.js";

function StateObject(map, id) {
    if (!id) {
        id = map.generateState();
        map.stateCache[id] = this;
    }

    this.id = id;
    this.map = map;
    this.pointer = {};

}

StateObject.prototype = {
    constructor: StateObject,
    id: null,
    pointer: null,
    
    // clone: function () {
    //     var dupe = clone(this);
        
    //     dupe.base = this;

    //     return dupe;
    // },

    // recurseClone: function (ruleId) {
    //     var dupe = this.clone();

    //     dupe[ruleId] = dupe;

    //     return dupe;

    // },

    
    point: function (ruleId, lexeme, vstate) {

        var pointer = this.pointer;


        if (lexeme in pointer) {

            vstate = pointer[lexeme];

        }
        else {

            pointer[lexeme] = vstate = vstate || new StateObject(this.map);

            this.map.states[this.id][lexeme] = vstate.id;
        }

        //var pointers = this.map.states[this.id];

        //console.log("has transition ", this.id, '->', lexeme,' ? ', lexeme in pointers ? pointers[lexeme] : false);

        //console.log('pointing ', this.id, ':', lexeme, '->', vstate.id);

        return vstate;
        


        //vstate









        // var pointer = this.pointer,
        //     map = this.map,
        //     base = this.base;
        // var vstate, id;

        // if (!(lexeme in pointer)) {

        //     id = map.generateState();
        //     vstate = base.clone();
        //     vstate.id = id;
        //     vstate.pointer = {};

        //     pointer[lexeme] = vstate;

        //     map.states[this.id][lexeme] = id;
        // }

        // return pointer[lexeme];

        
    }
    
    // reduce: function (rule, params, ruleIndex) {
    //     this.map.setReduceState(this.id, rule, params, ruleIndex);
    // }
};

export default StateObject;