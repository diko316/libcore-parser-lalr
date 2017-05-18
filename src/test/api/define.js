'use strict';


describe('Declares LALR grammar using ' +
    'define(root:String, definitions:Array [, exclusions:Array]) method',
    function () {
        
        function defineCompleteGrammar() {
            var api = global.main;
            
            return api.define("Expr",
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
        }
        
        function defineNoExclusionsGrammar() {
            var api = global.main;
            
            return api.define("Expr",
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
        }
        
        function defineWrongRoot() {
            var api = global.main;
            
            return api.define("FakeRoot",
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
                        ]);
        }
        
        function defineWrongParameters() {
            var api = global.main;
            
            return api.define(null, 100);
        }
        
        it('1. Should define LALR grammar without errors',
            function () {
                expect(defineNoExclusionsGrammar).not.toThrow();
            });
        
        it('2. Should not accept "root" parameter not defined ' +
           ' as grammar rule in "definitions" parameter.',
            function () {
                expect(defineWrongRoot).toThrow();
            });
        
        it('3. Should not accept parameters not following define() API.',
            function () {
                expect(defineWrongParameters).toThrow();
            });
        
        it('4. Should accept exclusions array of Regexp as ' +
           ' grammar rule terminals.',
            function () {
                expect(defineCompleteGrammar).not.toThrow();
            });

    });