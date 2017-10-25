# libcore-parser-lalr
LALR(1) Parser for LALR grammar


# Installation

Tokenizer can be installed from NPM by running the lines below in your working directory containing package.json file for use in NodeJS, browserify or webpack.


```shell
npm install libcore-lalr --save
```

# Usage

The following lines defines a parser declaring grammar rules composed of tokens (RegExp),  recursion of rules, and a combination of both.

```javascript
var lalr = require("libcore-parser-lalr");
var parser = lalr.define("Expr", // Root production
                [
                    // Lexical grammar
                    "+",    [
                                /\+/
                            ],

                    "*",    [
                                /\*/
                            ],

                    "(",    [/\(/],

                    ")",    [/\)/],

                    "number",   [/(\+|\-)?[0-9]+(\.[0-9]+)?/],

                    "whitespace", [/[ \r\n\t]+/],

                    "identifier", [/[a-zA-Z\_\$][a-zA-Z0-9\_\$]*/],

                    // Grammar rules
                    "Expr", [
                                "Ass"                   // 1:Expr rule
                            ],

                    "Ass",  [
                                "Add",                  // 1:Ass rule
                                                        // 2:Ass rule
                                ["identifier", /\=/, "Ass"]
                            ],

                    "Add",  [
                                "Mul",                  // Add1 rule
                                ["Add", "+", "Mul"],    // Add2 rule
                            ],
                    "Mul",  [
                                "Unit"                  // Mul1 rule
                                ["Mul", "*", "Unit"],   // Mul2 rule
                            ],
                    "Unit", [
                                "number",               // Unit1 rule
                                ["(", "Expr", ")"]      // Unit2 rule
                            ]
                    
                ],
                // ignore these tokens
                [
                        "whitespace"
                ]);

```

You can set parse subject to the iterator before you can parse. The following lines defines default iterator and parse the String subject.

```javascript
var iterator = parser.iterator();
var lexeme;

// set string subject to parse
iterator.set('1 + 2 * 3');

// iterate
for (lexeme = iterator.next(); lexeme; lexeme = iterator.next()) {
    console.log(lexeme.name,            // grammar rule name
                lexeme.rule,            // grammar rule id (e.g. Mul1, Unit2)
                lexeme.value,           // lexeme value - you update this with lexeme.update("value")
                lexeme.reduceCount,     // number of lexemes popped to reduce
                lexeme);
}
```


For supported Regex operators for tokenizer, please refer to [libcore-tokenizer](https://github.com/diko316/libcore-tokenizer)

## License

This Project is fully Open Source [MIT](https://opensource.org/licenses/MIT) licensed.