'use strict';


describe('Parser can create Iterator by using iterator([namedIterator:String])',
    function () {
        
        var Base = global.main.Iterator,
            createParser = require('./setup.sample.js');
        
        it('1. Should create default iterator with empty parameter.',
            function () {
                var iterator;
                
                function createIterator() {
                    iterator = createParser().iterator();
                }
                
                expect(createIterator).not.toThrow();
                expect(iterator instanceof Base).toBe(true);
            });
        
        it('2. Should create registered iterator with String name parameter.',
            function () {
                var iterator;
                
                function empty() {
                }
                
                function SubClass() {
                    Base.apply(this, arguments);
                }
                
                function createAndRegisterIteratorSubClass() {
                    var E = empty;
                    var proto;
                    
                    E.prototype = Base.prototype;
                    SubClass.prototype = proto = new E();
                    proto.constructor = SubClass;
                    
                    global.main.registerIterator("custom", SubClass);
                }
                
                
                function createIterator() {
                    iterator = createParser().iterator("custom");
                }
                
                expect(createAndRegisterIteratorSubClass).not.toThrow();
                
                expect(createIterator).not.toThrow();
                expect(iterator instanceof SubClass).toBe(true);
            });
        
        it('3. Should not create iterator that is not registered.',
            function () {
                var iterator;
                
                function createIterator() {
                    iterator = createParser().iterator("buang");
                }
                
                expect(createIterator).toThrow();
            });
    });