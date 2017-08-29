'use strict';

import createParser from "./setup.sample.js";

describe("Parser can export Lexer data using toJSON() or toObject() methods",
    function () {
        
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
                var parser;
                
                function exportToObject() {
                    parser = createParser();
                    return parser.toObject();
                }
                
                expect(exportToObject).not.toThrow();
                expect(Object.prototype.toString.call(exportToObject())).
                        toBe('[object Object]');
                
                
            });
        
    });