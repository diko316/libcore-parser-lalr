'use strict';


describe('Declares LALR grammar using ' +
    'define(root:String, definitions:Array [, exclusions:Array]) method',
    function () {

        var parser;
        
        function defineGrammar() {
            var api = global.main;
            
            parser = api.define("Expr",
                        [
                            "Expr", [
                                        "Assign"
                                    ],
                            
                            "Basic",  [
                                        /Buang/,
                                        [/\(/, "Expr", /\)/]
                                    ],

                            "Operand",  [
                                        "Basic",
                                        ["Operand", /\./, "Basic"],
                                        ["Operand", /\[/, "Expr", /\]/]
                                    ],

                            "Assign",   [
                                        ["Operand", /\=/, "Assign"],
                                        "Operand"
                                    ]
                        ],
                        [
                            /[ \r\n\t]+/
                        ]);
        }
        
        it('1. Should define combination of LL and LR grammar without errors.',
            function () {
                expect(defineGrammar).not.toThrow();
            });

        it('2. Should be able to parse string subject.',
            function () {
                var iterator, lexeme;

                expect(defineGrammar).not.toThrow();

                iterator = parser.iterator();
                iterator.set('Buang = Buang.Buang');
                lexeme = iterator.next();

                for (; lexeme; lexeme = iterator.next()) {
                    console.log(lexeme.name,
                                lexeme.rule,
                                lexeme.value,
                                lexeme.reduceCount,
                                lexeme);
                }

            });

    });