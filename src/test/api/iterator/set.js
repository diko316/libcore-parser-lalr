'use strict';

import defineSampleParser from "./setup.sample.js";

describe('Base Iterator must have set(subject:String) method that ' +
         ' sets String subject to parse.',
         
    function () {
        
        it('1. Should create iterator and set String subject with ' +
            'set(subject:String) method.',
            function () {
                var joc = jasmine.objectContaining,
                    subject = 'diko is beautiful';
                var parser, iterator, lexeme;
                
                function createIterator() {
                    parser = defineSampleParser();
                    iterator = parser.iterator();
                    iterator.set(subject);
                }
                
                expect(createIterator).not.toThrow();

                expect(iterator.error).toBe(null);
                
            });
        
        
        
    });