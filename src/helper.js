'use strict';

function empty() {
}

export
    function clone(obj) {
        var E = empty;
        E.prototype = obj;
        return new E();
    }

