'use strict';


describe('Base Iterator must have next() method that returns '+
        'next created lexeme based from token or reduced lexemes',
    function () {
        
        function defineIterator() {
            var api = global.main,
                parser = api.define("Sentence", [
                            "Sentence", [
                                        ["Subject", "IVerb"],
                                        ["Subject", "TVerb", "IObject", "DObject"],
                                        ["Subject", "TVerb", "Object"],
                                        ["Subject", "LVerb", "SComplement"]
                                    ],
                            
                            "Subject", [
                                        /diko/,
                                        /draegan/,
                                        /cha/,
                                        /aerin/
                                    ],
                            
                            "TVerb", [
                                        /jump/,
                                        /run|walk/,
                                        /look/
                                    ],
                            "IVerb", [
                                        /jumped/,
                                        /ran|walked/,
                                        /looked/
                                    ],
                            "LVerb", [
                                        /is|are/
                                    ]
                        ]);
            
            
        }
        
        it('1. Should return created lexeme from token',
            function () {
                
                
                
                
            });
        
        
        
    });