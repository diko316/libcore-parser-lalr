'use strict';

//import List from "./list.js";

function State(registry, id) {
    var list = registry.vstates;

    id = id || (++registry.vstateIdGen).toString(36);
    
    registry.vstateLookup[id] = 
        list[list.length] = this;

    this.registry = registry;
    
}

State.prototype = {
    constructor: State
};

export default State;