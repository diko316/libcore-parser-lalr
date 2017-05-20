'use strict';


describe('Registers an Iterator using by calling ' +
    'registerIterator(name:String, Class:Function)',
    function () {
        function empty() {
            
        }
        
        function createSubclass() {
            var api = global.main,
                Base = api.Iterator,
                E = empty;
            
            function NewIterator() {
                Base.apply(this, arguments);
            }
            
            E.prototype = Base.prototype;
            NewIterator.prototype = new E();
            NewIterator.prototype.constructor = NewIterator;
            
            return NewIterator;
        }
        
        function register() {
            global.main.registerIterator('subclass',
                                         createSubclass());
        }
        
        function registerNonSubclass() {
            var api = global.main,
                Base = api.Iterator;
            
            function NewIterator() {
                Base.apply(this, arguments);
            }

            api.registerIterator('subclass', NewIterator);
        }
        
        function registerInvalidName() {
            global.main.registerIterator(null,
                                         createSubclass());
        }
        
        function registerInvalidName1() {
            global.main.registerIterator(100,
                                         createSubclass());
        }
        
        
        it('1. Should register an Iterator class only if it is a subclass of' +
            'api.Iterator base class.',
            function () {
                expect(register).not.toThrow();
            });
        
        it('2. Should not register Class that is not a subclass of ' +
           'api.Iterator base class.',
           function () {
                expect(registerNonSubclass).toThrow();
           });
        
        it('3. Should not register Class with invalid String iterator name',
           function () {
                expect(registerInvalidName).toThrow();
                expect(registerInvalidName1).toThrow();
           });
        
    });