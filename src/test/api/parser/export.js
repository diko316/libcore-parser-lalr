'use strict';


describe("Parser can export Lexer data using toJSON() or toObject() methods",
    function () {
        var createParser = require('./setup.sample.js');
        
        it('1. Should export JSON String lexer data.',
            function () {
                var parser, json;
                
                function exportToJSON() {
                    parser = createParser();
                    return parser.toJSON();
                }
                
                expect(exportToJSON).not.toThrow();
                json = exportToJSON();
                
                expect(typeof json).toBe('string');
                expect(json).not.toBe("");
                
                
            });
        
        it('2. Should export Object lexer data.',
            function () {
                var parser, json;
                
                function exportToObject() {
                    parser = createParser();
                    return parser.toObject();
                }
                
                expect(exportToObject).not.toThrow();
                expect(Object.prototype.toString.call(exportToObject())).
                        toBe('[object Object]');
                
                
            });
        
    });