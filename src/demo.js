'use strict';

var Parser = require("./parser.js");
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

var parser = new Parser("Expr", // root grammar rule
                        [ // grammar rules
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
                        // ignore these tokens
                        [
	                        /[ \r\n\t]+/
                        ]);



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

var iterator = parser.iterator();
var lexeme;

iterator.set('1 + 2 * 3');

for (lexeme = iterator.next(); lexeme; lexeme = iterator.next()) {
    console.log(lexeme.name,
                lexeme.rule,
                lexeme.value,
                lexeme.reduceCount,
                lexeme);
}
