'use strict';


describe('Declares LL grammar using ' +
    'define(root:String, definitions:Array [, exclusions:Array]) method',
    function () {

        var output = [{"name":"/Buang/","type":1,"reduceCount":0},
                        {"name":"Basic","type":2,"reduceCount":1},
                        {"name":"Operand","type":2,"reduceCount":1},
                        {"name":"/\\=/","type":1,"reduceCount":0},
                        {"name":"/\\(/","type":1,"reduceCount":0},
                        {"name":"/Chaching/","type":1,"reduceCount":0},
                        {"name":"Basic","type":2,"reduceCount":1},
                        {"name":"Operand","type":2,"reduceCount":1},
                        {"name":"/\\=/","type":1,"reduceCount":0},
                        {"name":"/Buang/","type":1,"reduceCount":0},
                        {"name":"Basic","type":2,"reduceCount":1},
                        {"name":"Operand","type":2,"reduceCount":1},
                        {"name":"/\\./","type":1,"reduceCount":0},
                        {"name":"/Buang/","type":1,"reduceCount":0},
                        {"name":"Basic","type":2,"reduceCount":1},
                        {"name":"Operand","type":2,"reduceCount":3},
                        {"name":"Assign","type":2,"reduceCount":1},
                        {"name":"Assign","type":2,"reduceCount":3},
                        {"name":"Expr","type":2,"reduceCount":1},
                        {"name":"/\\)/","type":1,"reduceCount":0},
                        {"name":"Basic","type":2,"reduceCount":3},
                        {"name":"Operand","type":2,"reduceCount":1},
                        {"name":"Assign","type":2,"reduceCount":1},
                        {"name":"Assign","type":2,"reduceCount":3},
                        {"name":"Expr","type":2,"reduceCount":1},
                        {"name":"$end","type":4,"reduceCount":1}],
            parser;
        
        function defineGrammar() {
            var api = global.main;
            
            parser = api.define("Expr",
                        [
                            "Expr", [
                                        "Assign"
                                    ],
                            
                            "Basic",  [
                                        /Buang/,
                                        /Chaching/,
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
                var list = output,
                    current = -1;
                var iterator, lexeme, item, verify;

                expect(defineGrammar).not.toThrow();

                iterator = parser.iterator();
                iterator.set('Buang = (Chaching = Buang.Buang)');
                lexeme = iterator.next();

                for (; lexeme; lexeme = iterator.next()) {
                    item = {
                        name: lexeme.name,
                        reduceCount: lexeme.reduceCount
                    };
                    if (lexeme.type) {
                        item.type = lexeme.type;
                    }

                    verify = list[++current];

                    console.log("verify ", item);

                    expect(item).toEqual(verify);
                }

            });

    });