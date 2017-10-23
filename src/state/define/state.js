'use strict';

//import List from "./list.js";

function State(registry, id, items) {

    this.id = id;
    this.registry = registry;
    this.items = items || [];

}

State.prototype = {
    constructor: State,
    createShift: function () {

    },
    
    containsItems: function (items) {
        var myItems = this.items,
            total = myItems.length;
        var subject, mylen, len;

        if (items.length === total) {
            mylen = total;
            mainLoop: for (; mylen--;) {
                subject = myItems[mylen];
                len = total;
                for (; len--;) {
                    if (subject === items[len]) {
                        continue mainLoop;
                    }
                }
                return false;
            }
            return true;
        }
        return false;
    }

};

export default State;