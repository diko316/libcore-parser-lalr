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

var simple = true;

simple = false;

if (simple) {

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

}
else {
parser = Parser.define("Joqx",
[

// Lexical Grammars
    

// keywords
    "this",             [/this/],
    "boolean",          [
                            /true/,
                            /false/
                        ],
    "null",             [/null/],
    "undefined",        [/undefined/],

    "new",              [/new/],
    "delete",           [/delete/],
    "typeof",           [/typeof/],
    

// transformer
    "transform",        [
                            /\-\>/,
                            /then/
                        ],

// arithmetic operators
    "++",               [/\+\+/],
    "--",               [/\-\-/],
    "**",               [/\*\*/],

    "+",                [/\+/],
    "-",                [/\-/],
    "%",                [/\%/],
    "*",                [/\*/],
    "/",                [/\//],

// object access
    ".",                [/\./],

// comparison
    "instanceof",       [/instanceof/],
    "and",              [/and/],
    "or",               [/or/],
    "in",               [/in/],

    "gt",               [/gt/],
    "gte",              [/gte/],

    "lt",               [/lt/],
    "lte",              [/lte/],

    ">=",               [/\>=/],
    "<=",               [/<=/],

    ">",                [/\>/],
    "<",                [/</],

// logical
    

    "&&",               [/\&\&/],
    "||",               [/\|\|/],
    "!",                [/!/],


    "?",                [/\?/],
    ":",                [/\:/],

// equality
    "==",               [/==/],
    "!=",               [/!=/],
    "===",              [/===/],
    "!==",              [/!==/],

//  assignment
    "=",                [/=/],
    "**=",              [/\*\*=/],
    "*=",               [/\*=/],
    "/=",               [/\/=/],
    "%=",               [/\%=/],
    "+=",               [/\+=/],
    "-=",               [/\-=/],

// literals
    "string",           [
                            /\"(\\\"|[^\"])*\"/,
                            /\'(\\\'|[^\'])*\'/
                        ],

    "decimal",          [
                            /[0-9]+/,
                            /\.[0-9]+/,
                            /[0-9]+\.[0-9]+/,

                            // with exponent
                            /[0-9]+[eE][\+\-]?[0-9]+/,
                            /\.[0-9]+[eE][\+\-]?[0-9]+/,
                            /[0-9]+\.[0-9]+[eE][\+\-]?[0-9]+/
                        ],

    "hex",              [/[\+\-]?0[xX][0-9a-fA-F]+/],
    "octal",            [/[\+\-]?0[oO][0-7]+/],
                        
    "binary",           [/[\+\-]?0[bB][01]+/],

    "json_path",        [/\@[^ \r\n\t\.\[]+(\.[^ \r\n\t\.\[]+|\[\'(\\\'|[^\'])+\'\]|\[\"(\\\"|[^\"])+\"\]|\[[^\]]+\])*/],

// enclosures
    "[",                [/\[/],
    "]",                [/\]/],
    "{",                [/\{/],
    "}",                [/\}/],
    "(",                [/\(/],
    ")",                [/\)/],
    ",",                [/\,/],

    "comment",          [
                            /\/\/[^ \n]*/,
                            /\#[^ \n]*/
                        ],

    "white_space",      [
                            /[ \r\n\t]+/
                        ],
    
        
    "void(",            [/void\(/],

    "intent",           [/\?[a-zA-Z\$][a-zA-Z0-9\$]*(\-[a-zA-Z0-9\$]+)*/],

// last priority
    "identifier",       [/[a-zA-Z\_\$][a-zA-Z0-9\_\$]*/],

    

// Root Expression
    "Joqx",             [
                            
                            "Transform",
                            ["intent", "Transform"]
                        ],
    
// Number
    "Number",           [
                            "decimal",
                            "hex",
                            "octal"
                        ],

// Group
    "Group",            [
                            ["(", "Javascript", ")"]
                        ],

// Array
    "Array",            [
                            ["[", "]"],
                            ["[", "Elements", "]"]
                        ],

    "Elements",         [
                            "Javascript",
                            ["Elements", ",", "Javascript"],
                        ],

// Object
    "Object",           [
                            ["{", "}"],
                            ["{", "Properties", "}"]
                        ],

    "Properties",       [
                            "Property",
                            ["Properties", ",", "Property"]
                        ],

    "Property",         [
                            ["identifier", ":", "Javascript"],
                            ["string", ":", "Javascript"],
                            ["Number", ":", "Javascript"]
                        ],

// Function Call
    "Arguments",        [
                            ["(", ")"],
                            ["(", "ArgumentList", ")"]
                        ],

    "ArgumentList",     [
                            "Javascript",
                            ["ArgumentList", ",", "Javascript"]
                        ],

    "Delete",           [
                            ["delete", "Updatable"]
                        ],

    "Void",             [
                            ["void(", "Javascript", ")"]
                        ],

// Function Call
    
    "Primary",          [
                            "identifier",

                            "this",
                            "boolean",
                            "null",
                            "undefined",
                            "string",

                            "Number",
                            "Array",
                            "Object",
                            "Void",
                            "Group",

                            ["Primary", "Arguments"],
                            ["new", "Primary"],
                            ["Primary", ".", "identifier"],
                            ["Primary", "[", "Javascript", "]"]
                        ],

    "PostFix",          [
                            "Primary",
                            ["Primary", "++"],
                            ["Primary", "--"]
                            
                        ],

    "Unary",            [
                            "PostFix",
                            ["++", "PostFix"],
                            ["--", "PostFix"],
                            ["+",  "Number"],
                            ["-", "Number"],
                            ["typeof", "Primary"],
                            ["!", "Primary"]
                        ],

    "Exponential",      [
                            "Unary",
                            ["Exponential", "**", "Unary"]
                        ],

    "Multiplicative",   [
                            "Exponential",
                            ["Multiplicative", "*", "Exponential"],
                            ["Multiplicative", "/", "Exponential"],
                            ["Multiplicative", "%", "Exponential"]
                        ],

    "Additive",         [
                            "Multiplicative",
                            ["Additive", "-", "Multiplicative"],
                            ["Additive", "+", "Multiplicative"]
                        ],

    "Relational",       [
                            "Additive",

                            ["Relational", "<", "Additive"],
                            ["Relational", "lt", "Additive"],

                            ["Relational", ">", "Additive"],
                            ["Relational", "gt", "Additive"],

                            ["Relational", "<=", "Additive"],
                            ["Relational", "lte", "Additive"],

                            ["Relational", ">=", "Additive"],
                            ["Relational", "gte", "Additive"],

                            ["Relational", "instanceof", "Additive"],
                            ["Relational", "in", "Additive"]
                        ],

    "Equality",         [
                            "Relational",

                            ["Equality", "==", "Relational"],
                            ["Equality", "!=", "Relational"],
                            ["Equality", "===", "Relational"],
                            ["Equality", "!==", "Relational"]
                            
                        ],

    "LogicalAnd",       [
                            "Equality",
                            ["LogicalAnd", "&&", "Equality"],
                            ["LogicalAnd", "and", "Equality"]
                        ],

    "LogicalOr",        [
                            "LogicalAnd",
                            ["LogicalOr", "||", "LogicalAnd"],
                            ["LogicalOr", "or", "LogicalAnd"]
                        ],
// Ternary
    "Conditional",      [
                            "LogicalOr",
                            ["LogicalOr", "?", "Javascript", ":", "Javascript"]
                        ],


    "Assignment",       [
                            "Conditional",
                            ["Primary", "=", "Assignment"],
                            ["Primary", "**=", "Assignment"],
                            ["Primary", "*=", "Assignment"],
                            ["Primary", "/=", "Assignment"],
                            ["Primary", "%=", "Assignment"],
                            ["Primary", "+=", "Assignment"],
                            ["Primary", "-=", "Assignment"]
                        ],

    "Javascript",       [
                            "Assignment"
                        ],

// Transform Redirection
    "Namespace",        [
                            "identifier",
                            ["Namespace", ".", "identifier"]
                        ],

    "Transformer",      [
                            "Namespace",
                            ["Namespace", "Arguments"]
                        ],

    "Transform",        [
                            "Javascript",
                            ["Transform", "transform", "Transformer"]
                        ]
        
        
],
[
    'white_space',
    'comment'
]);
}
var iterator = parser.iterator(),
    output = [],
    ol = 0;
var lexeme;

console.log(parser.map);

//console.log(parser);

 //iterator.set('Buang = (Chaching = Buang.Buang)');

//iterator.set('Buang = 2 * Buang(4)');
// iterator.set('2 * Buang');
// iterator.set('Buang(4)');

iterator.set('Chaching = Buang + 1 * 2 -> test');

for (lexeme = iterator.next(); lexeme; lexeme = iterator.next()) {
    output[ol++] = {
        name: lexeme.name,
        type: lexeme.type,
        reduceCount: lexeme.reduceCount
    };

    console.log(lexeme.name,
                lexeme.value,
                lexeme.reduceCount);
    //console.log('-----------', lexeme.name, lexeme.value);

}

// //console.log(JSON.stringify(output));




console.log(iterator);





// var parser = Parser.define("Expr",
// [
//     "Expr", [
//                 "Assign"
//             ],

//     "buang", [
//                 /Buang/,
//                 /Chaching/
//             ],

//     "number",[
//                 /[0-9]+/
//             ],

//     "+",    [/\+/],

//     "*",    [/\*/],
    
//     "Basic",  [
//                 "buang",
//                 "number",
//                 [/\(/, "Expr", /\)/]
//             ],

//     "Additive", [
//                 "Basic",
//                 ["Additive", '+', "Basic"]
//             ],

//     "Assign",   [
//                 "Additive",
//                 ["buang", /\=/, "Assign"]
//             ],
// ],
// [
//     /[ \r\n\t]+/
// ]);

// console.log(parser);