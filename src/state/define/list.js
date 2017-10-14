'use strict';


function List(name) {
    this.name = name;
}

List.prototype = {
    constructor: List,
    first: null,
    last: null,

    shift: function () {
        var item = this.first;
        var first;

        if (item) {
            this.first = first = item[0];
            if (!first) {
                this.last = first;
            }
            return item[1];
        }
        

        return null;
    },

    push: function (item) {
        item = [null, item];

        if (this.last) {
            this.last[0] = item;
        }
        else {
            this.first = item;
        }

        this.last = item;

        return this;
    }
};

export default List;