'use strict';

function empty() {
}

function clone(obj) {
    var E = empty;
    E.prototype = obj;
    return new E();
}

module.exports = {
    clone: clone
};