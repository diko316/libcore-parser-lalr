'use strict';

describe('Loads LALR pushdown FSM data by calling ' +
    'load(fsmData:{String|Object}) method',
    function () {
        var exported;

        beforeEach(function () {
            var parser = global.main.define("Expr",
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
                            /[ \r\n\t]+/
                        ]);
            exported = parser.toJSON();
        });
        
        
        it('1. Should load fsm data from JSON String parameter.',
            function () {
                var param = exported;
                
                function load() {
                    return global.main.load(param);
                }
                
                expect(load).not.toThrow();
                expect(global.main.isParser(load())).toBe(true);
            });
        
        it('2. Should load fsm data from Object parameter.',
            function () {
                var param = exported;
                
                function load() {
                    return global.main.load(JSON.parse(param));
                }
                
                expect(load).not.toThrow();
                expect(global.main.isParser(load())).toBe(true);
            });
    });