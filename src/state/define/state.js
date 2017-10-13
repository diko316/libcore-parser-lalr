'use strict';


function State(map) {
    this.map = map;
    
}

State.prototype = {
    pointer: null,
    map: null,
    constructor: State
};

export default State;