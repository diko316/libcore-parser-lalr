'use strict';


function Pointer(lexeme, state) {

    this.item = lexeme;

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