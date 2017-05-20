'use strict';


describe("Parser can load Lexer data using fromJSON(fsm:Object|String)",
    function () {
        var createParser = require('./setup.sample.js');
        
        it("1. Should load Object lexer data by calling fromJSON() method",
            function () {
                var object, parser;
                
                function exportToObject() {
                    object = createParser().toObject();
                }
                
                function importObject() {
                    parser = createParser();
                    parser.fromJSON(object);
                }
                
                expect(exportToObject).not.toThrow();
                expect(Object.prototype.toString.call(object)).
                        toBe('[object Object]');
                expect(importObject).not.toThrow();
                expect(parser.ready).toBe(true);
                
            });
        
        it("2. Should load JSON String lexer data by calling fromJSON() method",
            function () {
                var json, parser;
                
                function exportToObject() {
                    json = createParser().toJSON();
                }
                
                function importObject() {
                    parser = createParser();
                    parser.fromJSON(json);
                }
                
                expect(exportToObject).not.toThrow();
                expect(importObject).not.toThrow();
                expect(typeof json).toBe('string');
                expect(parser.ready).toBe(true);
                
            });
        
        
    });