'use strict';

import { array } from "libcore";

function Pointer(lexeme, state, ruleId) {

    this.item = lexeme;

    this.ruleIds = array(ruleId) ? ruleId : [ruleId];

    if (lexeme === 'buang') {
        console.log("ruleIds ", this.ruleIds);
    }

    // bind
    this.to = state;

}

Pointer.prototype = {
    constructor: Pointer,
    next: null,
    item: null,
    to: null

};


export default Pointer;