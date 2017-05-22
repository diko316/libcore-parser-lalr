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
                    params: 0
                }));
                
                
                expect(iterator.next()).toEqual(joc({
                    name: 'Noun',
                    params: 1
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: 'Subject',
                    params: 1
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: '/is|are/',
                    value: 'is',
                    params: 0
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: 'LVerb',
                    params: 1
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: '/beautiful/',
                    value: 'beautiful',
                    params: 0
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: 'SCompliment',
                    params: 1
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: 'IVerb',
                    params: 2
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: 'Sentence',
                    params: 2
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: '$',
                    params: 0
                }));
                
                expect(iterator.next()).toEqual(joc({
                    name: '$Root',
                    params: 2
                }));
                
                
            });
        
        
        
    });