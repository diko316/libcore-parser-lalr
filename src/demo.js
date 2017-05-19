'use strict';


var Parser = require("./parser.js");
var parser = new Parser("Expr",
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

var iterator = parser.iterator();
var lexeme;

iterator.set('     1 + 2 * 3');

for (lexeme = iterator.next(); lexeme; lexeme = iterator.next()) {
    console.log(lexeme.name, lexeme.value, lexeme.params);
}

console.log(iterator);

//
//iterator.next();
//
//iterator.next();
//
//iterator.next();
//
//iterator.next();
//
//iterator.next();
//
//iterator.next();
//
//iterator.next();
//
//iterator.next();
//
//iterator.next();
//
//iterator.next();
//
//iterator.next();

//console.log(iterator);


//var parser = new Parser("Expr",
//                        [
//                            "Expr", [
//                                        "Add"
//                                    ],
//                            
//                            "Add",  [
//                                        ["Add", /\+/, "Mul"],
//                                        "Mul"
//                                    ],
//                            
//                            "Mul",  [
//                                        ["Mul", /\*/, "Unit"],
//                                        "Unit"
//                                    ],
//                                    
//                            "Unit", [
//                                        "Number",
//                                        [/\(/, "Expr", /\)/]
//                                    ],
//                            
//                            "Number", [
//                                        /(\+|\-)?[0-9]+(\.[0-9]+)?/
//                                    ]
//                        ]);
    

//console.log(parser);


//var builder = require("./state/builder.js"),
//    Tokenizer = require("libcore-tokenizer"),
//    map = builder("Expr",
//            new Tokenizer(),
//            [
//                "Expr", [
//                            "Add"
//                        ],
//                
//                "Add",  [
//                            ["Add", /\+/, "Mul"],
//                            "Mul"
//                        ],
//                
//                "Mul",  [
//                            ["Mul", /\*/, "Unit"],
//                            "Unit"
//                        ],
//                        
//                "Unit", [
//                            "Number",
//                            [/\(/, "Expr", /\)/]
//                        ],
//                
//                "Number", [
//                            /(\+|\-)?[0-9]+(\.[0-9]+)?/
//                        ]
//            ]);
//    
//console.log(map);

//builder("Expr",
//        new Tokenizer(),
//        [
//            "Expr", [
//                        "Add"
//                    ],
//            
//            "Add",  [
//                        ["Add", /\+/, "Number"],
//                        "Number"
//                    ],
//            
//            "Number", [
//                        /(\+|\-)?[0-9]+(\.[0-9]+)?/
//                    ]
//        ]);