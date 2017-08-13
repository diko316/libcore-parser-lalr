'use strict';


describe('Base Iterator must have next() method that returns '+
        'next created lexeme based from token or reduced lexemes',
    function () {
        var defineSampleParser = require("./setup.sample.js");
        
        it('1. Should return created lexeme from token',
            function () {
                var joc = jasmine.objectContaining,
                    subject = 'diko is beautiful';
                var parser, iterator;
                
                function createIterator() {
                    parser = defineSampleParser();
                    iterator = parser.iterator();
                    iterator.set(subject);
                }
                
                expect(createIterator).not.toThrow();

                expect(iterator.next()).toEqual(joc({
                    name: '/diko/',
                    value: 'diko',
                    reduceCount: 0
                }));
                
                
                expect(iterator.next()).toEqual(joc({
                    name: 'Noun',
                    reduceCount: 1
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: 'Subject',
                    reduceCount: 1
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: '/is|are/',
                    value: 'is',
                    reduceCount: 0
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: 'LVerb',
                    reduceCount: 1
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: '/beautiful/',
                    value: 'beautiful',
                    reduceCount: 0
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: 'SCompliment',
                    reduceCount: 1
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: 'IVerb',
                    reduceCount: 2
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: 'Sentence',
                    reduceCount: 2
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: '$end',
                    reduceCount: 1
                }));
                
                
            });
        
        
        
    });