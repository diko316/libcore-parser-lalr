'use strict';

function defineSampleParser() {
    var api = global.main,
        parser = api.define("Sentence",
                [
                    "Sentence", [
                                ["Subject", "IVerb"],
                                ["Subject", "TVerb", "Object"]
                            ],
                    
                    "Noun", [
                                /diko/,
                                /draegan/,
                                /cha/,
                                /aerin/,
                                /room/,
                                /car/,
                                /dvd\-drive/
                            ],
                    
                    "Subject", [
                                [ /the/, "Noun" ],
                                "Noun"
                            ],
                    
                    "Object", [
                                [ /of/, "Subject" ],
                                [ /to/, "Subject" ],
                                [ /on/, "Subject" ],
                                [ /about/, "Subject" ],
                                "Subject"
                            ],
                    
                    "TVerb", [
                                /jump/,
                                /run|walk/,
                                /look/
                            ],
                    
                    "IVerb", [
                                /jumped/,
                                /ran|walked/,
                                /looked/,
                                ["LVerb", "SCompliment"]
                            ],
                    
                    "SCompliment", [
                                /beautiful/,
                                /cute/,
                                /bare/
                            ],
                    
                    "LVerb", [
                                /is|are/
                            ]
                ],
                [
                    /[ \t]+/ // ignore space
                ]);
    
    return parser;
    
}

module.exports = defineSampleParser;