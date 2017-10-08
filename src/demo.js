'use strict';

import Parser from "./index.js";
//var parser = new Parser("Expr",
//                        [
//                            "Expr", [
//                                        "Add"
//                                    ],
//                            
//                            "Add",  [
//                                        ["Add", /\+/, "Mul"],
//                                        "Mul",
//                                    ],
//                            "Mul",  [
//                                        ["Mul", /\*/, "Unit"],
//                                        "Unit"
//                                    ],
//                            "Unit", [
//                                        "Number",
//                                        [/\(/, "Expr", /\)/]
//                                    ],
//                            "Number", [
//                                        /(\+|\-)?[0-9]+(\.[0-9]+)?/
//                                    ]
//                        ],
//                        [
//                            /[ \r\n\t]+/
//                        ]);

// var parser = new Parser("Expr", // root grammar rule
//                         [ // grammar rules
//                             "Expr", [
//                                         "Add"
//                                     ],
                            
//                             "Add",  [
//                                         ["Add", /\+/, "Mul"],
//                                         "Mul",
//                                     ],
//                             "Mul",  [
//                                         ["Mul", /\*/, "Unit"],
//                                         "Unit"
//                                     ],
//                             "Unit", [
//                                         "Number",
//                                         [/\(/, "Expr", /\)/]
//                                     ],
//                             "Number", [
//                                         /(\+|\-)?[0-9]+(\.[0-9]+)?/
//                                     ]
//                         ],
//                         // ignore these tokens
//                         [
// 	                        /[ \r\n\t]+/
//                         ]);


//var parser = new Parser("Sentence", [
//                            "Sentence", [
//                                        ["Subject", "IVerb"],
//                                        ["Subject", "TVerb", "Object"]
//                                    ],
//                            
//                            "Noun", [
//                                        /diko/,
//                                        /draegan/,
//                                        /cha/,
//                                        /aerin/,
//                                        /room/,
//                                        /car/,
//                                        /dvd\-drive/
//                                    ],
//                            
//                            "Subject", [
//                                        [ /the/, "Noun" ],
//                                        "Noun"
//                                    ],
//                            
//                            "Object", [
//                                        [ /of/, "Subject" ],
//                                        [ /to/, "Subject" ],
//                                        [ /on/, "Subject" ],
//                                        [ /about/, "Subject" ],
//                                        "Subject"
//                                    ],
//                            
//                            "TVerb", [
//                                        /jump/,
//                                        /run|walk/,
//                                        /look/
//                                    ],
//                            
//                            "IVerb", [
//                                        /jumped/,
//                                        /ran|walked/,
//                                        /looked/,
//                                        ["LVerb", "SCompliment"]
//                                    ],
//                            
//                            "SCompliment", [
//                                        /beautiful/,
//                                        /cute/,
//                                        /bare/
//                                    ],
//                            
//                            "LVerb", [
//                                        /is|are/
//                                    ]
//                        ],
//                        [
//                            /[ \t]+/ // ignore space
//                        ]);
var parser = Parser.define("Expr",
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

    "Multiple", [
                "Operand",
                ["Multiple", /\+/, "Operand"]
            ],

    "Additive", [
                "Multiple",
                ["Additive", /\+/, "Multiple"]
            ],

    "Assign",   [
                ["Additive", /\=/, "Assign"],
                "Additive"
            ],
],
[
    /[ \r\n\t]+/
]);
var iterator = parser.iterator(),
    output = [],
    ol = 0;
var lexeme;



iterator.set('Buang = (Chaching = Buang.Buang)');

for (lexeme = iterator.next(); lexeme; lexeme = iterator.next()) {
    output[ol++] = {
        name: lexeme.name,
        type: lexeme.type,
        reduceCount: lexeme.reduceCount
    };
    console.log(lexeme.name,
                lexeme.value,
                lexeme.reduceCount);
    //console.log(lexeme);

}

//console.log(JSON.stringify(output));


console.log(parser);
console.log(parser.toJSON());