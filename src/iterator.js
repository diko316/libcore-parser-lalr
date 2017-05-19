'use strict';

var libcore = require("libcore"),
    BaseIterator = require("./iterator/base.js"),
    defaultIteratorName = "base",
    ITERATORS = {};

function register(name, Class) {
    var lib = libcore,
        Base = BaseIterator;
    
    if (!lib.string(name)) {
        throw new Error("Invalid iterator name parameter.");
    }
    
    if (!lib.method(Class) ||
        (Class !== Base && !(Class.prototype instanceof Base))) {
        throw new Error("Invalid iterator Class parameter.");
    }
    
    ITERATORS[':' + name] = Class;
    
    return true;
}

function get(name) {
    var list = ITERATORS;
    
    if (libcore.string(name)) {
        name = ':' + name;
        if (name in list) {
            return list[name];
        }
    }
    
    return null;
}


register(defaultIteratorName, BaseIterator);

module.exports = {
    defaultIterator: defaultIteratorName,
    Base: BaseIterator,
    register: register,
    get: get
};
