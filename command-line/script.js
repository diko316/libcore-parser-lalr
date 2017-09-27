'use strict';

// use umd
var Parser = require("../dist/libcore-parser-lalr.js"),
    args = require("./arguments.js");

console.log(
    args(null,
        {
            'o': "whatO",
            'g': ["whatG", 2]
        }));

console.log("cool! ", Parser);