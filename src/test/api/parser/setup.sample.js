'use strict';

function defineSampleParser() {
    var api = global.main,
        parser = api.define("Expr",
                [
                    "Expr", [
                                "Add"
                            ],
                    
                    "Add",  [
                                ["Add", /\+/, "Mul"],
                                "Mul",
                            ],
                    "Mul",  [
                                ["Mul", /\*/, "Unit"],
                                "Unit"
                            ],
                    "Unit", [
                                "Number",
                                [/\(/, "Expr", /\)/]
                            ],
                    "Number", [
                                /(\+|\-)?[0-9]+(\.[0-9]+)?/
                            ]
                ],
                [
                    /[ \t]+/ // ignore space
                ]);
    
    return parser;
    
}

module.exports = defineSampleParser;