'use strict';

import {
            string,
            method
        } from "libcore";

import BaseIterator from "./iterator/base.js";
        
var defaultIteratorName = "base",
    ITERATORS = {};

export
    function register(name, Class) {
        var Base = BaseIterator;
        
        if (!string(name)) {
            throw new Error("Invalid iterator name parameter.");
        }
        
        if (!method(Class) ||
            (Class !== Base && !(Class.prototype instanceof Base))) {
            throw new Error("Invalid iterator Class parameter.");
        }
        
        ITERATORS[':' + name] = Class;
        
        return true;
    }

export
    function get(name) {
        var list = ITERATORS;
        
        if (string(name)) {
            name = ':' + name;
            if (name in list) {
                return list[name];
            }
        }
        
        return null;
    }

export {
            defaultIteratorName as defaultIterator,
            BaseIterator as Base
        };

register(defaultIteratorName, BaseIterator);


