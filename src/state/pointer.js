'use strict';


function Pointer(lexeme, state) {

    this.item = lexeme;

    // bind
    this.to = state;

}

Pointer.prototype = {
    constructor: Pointer,
    before: null,
    after: null,
    item: null,
    to: null

};


export default Pointer;