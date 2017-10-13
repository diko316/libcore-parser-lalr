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
// var parser = Parser.define("Expr",
// [
//     "Expr", [
//                 "Assign"
//             ],

//     "buang",[
//                 /Buang/,
//                 /Chaching/
//             ],
    
//     "Basic",  [
//                 "buang",
//                 /[0-9]+/,
//                 [/\(/, "Expr", /\)/]
//             ],


//     "Operand",  [
//                 "Basic",
//                 ["Basic", "Arguments"],
//                 ["Operand", /\./, "Basic"],
//                 ["Operand", /\[/, "Expr", /\]/]
                
//             ],

//     "Arguments",[
//                 [/\(/, /\)/],
//                 [/\(/, "ArgumentList", /\)/]
//             ],

//     "ArgumentList",[
//                 "Expr",
//                 ["ArgumentList", /\,/, "Expr"]
//             ],

//     "Multiple", [
//                 "Operand",
//                 ["Multiple", /\*/, "Operand"]
//             ],

//     "Additive", [
//                 "Multiple",
//                 ["Additive", /\+/, "Multiple"]
//             ],

//     "Assign",   [
//                 ["Additive", /\=/, "Assign"],
//                 "Additive"
//             ],
// ],
// [
//     /[ \r\n\t]+/
// ]);
// var iterator = parser.iterator(),
//     output = [],
//     ol = 0;
// var lexeme;



// //iterator.set('Buang = (Chaching = Buang.Buang)');

// iterator.set('Chaching = (Buang)');

// //iterator.set('Buang = 2 * Buang(4)');
// //iterator.set('Buang(4)');

// for (lexeme = iterator.next(); lexeme; lexeme = iterator.next()) {
//     output[ol++] = {
//         name: lexeme.name,
//         type: lexeme.type,
//         reduceCount: lexeme.reduceCount
//     };
//     console.log(lexeme.name,
//                 lexeme.value,
//                 lexeme.reduceCount);
//     //console.log(lexeme);

// }

// //console.log(JSON.stringify(output));


// console.log(parser);
// console.log(parser.toJSON());




var parser = Parser.define("Expr",
[
    "Expr", [
                "Assign"
            ],

    "buang", [
                /Buang/,
                /Chaching/
            ],

    "number",[
                /[0-9]+/
            ],

    "+",    [/\+/],

    "*",    [/\*/],
    
    "Basic",  [
                "buang",
                "number",
                [/\(/, "Expr", /\)/]
            ],

    "Operand",  [
                "Basic",
                ["Basic", "Arguments"],
                ["Operand", /\./, "Basic"],
                ["Operand", /\[/, "Expr", /\]/]
            ],

    "Arguments",[
                [/\(/, /\)/],
                [/\(/, "ArgumentList", /\)/]
            ],

    "ArgumentList",[
                "Expr",
                ["ArgumentList", /\,/, "Expr"]
            ],

    "Multiple", [
                "Operand",
                ["Multiple", '*', "Operand"]
            ],

    "Additive", [
                "Multiple",
                ["Additive", '+', "Multiple"]
            ],

    "Assign",   [
                "Additive",
                ["buang", /\=/, "Assign"]
            ],
],
[
    /[ \r\n\t]+/
]);
var iterator = parser.iterator(),
    output = [],
    ol = 0;
var lexeme;

// //console.log(parser);

// iterator.set('Buang = (Chaching = Buang.Buang)');

// //iterator.set('Buang = 2 * Buang(4)');
// //iterator.set('2 * Buang');
// //iterator.set('Buang(4)');

// //iterator.set('Buang + 1 * 2');

// for (lexeme = iterator.next(); lexeme; lexeme = iterator.next()) {
//     output[ol++] = {
//         name: lexeme.name,
//         type: lexeme.type,
//         reduceCount: lexeme.reduceCount
//     };
//     console.log(lexeme.name,
//                 lexeme.value,
//                 lexeme.reduceCount);
//     //console.log('-----------', lexeme.name, lexeme.value);

// }

// //console.log(JSON.stringify(output));



// console.log(iterator);