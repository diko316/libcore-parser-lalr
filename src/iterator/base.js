'use strict';

import {
            string,
            number,
            object
        } from "libcore";
        
import Lexeme from "../lexeme.js";

var INVALID_STATE_HANDLER = "Invalid result from state handler";

function BaseIterator(parser) {
    if (!object(parser)) {
        throw new Error("Invalid parser parameter.");
    }
    
    this.parser = parser;
    this.reset();
    
    this.start = ':start';
}


BaseIterator.prototype = {
    constructor: BaseIterator,
    subject: '',
    returns: false,
    current: null,
    ready: false,
    completed: false,
    error: null,
    
    actions: {
        ':start': {
            0: ':fail',
            1: ':tokenize'
            
        },
        
        ':tokenize': {
            0: ':fail',
            1: ':tokenize',
            2: ':shift',
            3: ':reduce'
        },
        
        ':shift': {
            0: ':fail',
            1: ':tokenize'
        },
        
        ':reduce': {
            0: ':fail',
            1: ':shift',
            2: ':reduce',
            3: ':success'
        },
        ':fail': {},
        ':success': {}
    },
    
    ':start': function () {
        var me = this;
        
        me.params = me.nextTokenIndex;
        
        return 1;
    },
    
    ':tokenize': function (from) {
        var me = this,
            parser = me.parser,
            map = parser.map,
            ends = map.ends,
            states = map.states,
            state = me.pstate,
            token = parser.tokenizer.tokenize(from,
                                              me.subject),
            endToken = map.endToken;
            
        var name, to, ref, lexeme, literal;

        
        
        if (token) {
            name = token[0];
            to = token[2];
            
            // tokenize again
            if (!this.isAcceptableToken(token)) {
                me.params = to;
                return 1;
            }

            
            
            lexeme = new Lexeme('terminal');

            // end token is not symbolized!
            literal = name;
            if (name === endToken) {
                name = map.endSymbol;
            }
            else {
                literal = map.symbol[name];
            }

            
            
            lexeme.name = literal;
            lexeme.symbol = name;
            lexeme.value = token[1];
            lexeme.from = from;
            lexeme.to = to;
            
            me.nextTokenIndex = to;
            me.params = lexeme;
            
            // found shift state
            ref = states[state];

            console.log("token accepted! ", token, name, ' shift? ', ref);

            if (name in ref) {
                return 2;
            }

        }
        
        // can reduce remaining buffer
        if (me.buffer.length && state in ends) {
            return 3;
        }
        
        // failed
        me.params = 'Invalid token';
        return 0;
        
    },
    
    ':shift': function (lexeme) {
        var me = this,
            buffer = me.buffer,
            map = me.parser.map,
            states = map.states,
            state = me.pstate,
            name = lexeme.symbol;
        
        buffer[buffer.length] = [state, lexeme];
        
        me.pstate = states[state][name];
        me.current = lexeme;
        me.params = null;
        
        // do not return "$" token
        me.returns = name !== map.endSymbol;
        me.params = me.nextTokenIndex;

        console.log("shift from ! ", state, lexeme.value, " to ", me.pstate);
        
        return 1;

    },
    
    ':reduce': function (lexeme) {
        var me = this,
            map = me.parser.map,
            buffer = me.buffer,
            bl = buffer.length,
            ends = map.ends,
            states = map.states,
            lookup = map.symbol,
            state = me.pstate,
            reduce = map.lookupReducer(ends[state]),
            name = reduce[0],
            params = reduce[1],
            l = params,
            endIndex = l - 1,
            created = new Lexeme('nonterminal'),
            values = [];
            
        var litem, item, from, to, ref, last;
        
        created.name = lookup[name];
        created.symbol = name;
        created.rule = lookup[reduce[2]];
        last = null;
        
        console.log("reduce count? ", params, " from ", reduce);
        
        for (; l--;) {
            item = buffer[--bl];
            state = item[0];
            litem = item[1];
            
            // create range
            from = litem.from;
            if (l === endIndex) {
                to = litem.to;
            }
            
            // create connection
            litem.parent = created;
             
            if (last) {
                last.previous = litem;
                litem.next = last;
            }
            else {
                created.last = litem;
            }
            created.first = last = litem;
            values[l] = litem.value;
        }
        
        created.value = values;
        created.from = from;
        created.to = to;
        
        buffer.length = bl;
        
        me.current = created;
        
        created.reduceCount = params;
        
        // only if it ended
        if (name === map.augmentedRoot) {
            
            // end
            if (bl === 0) {
                litem = created.first;
                
                created.useType('end');
                created.last = litem;
                created.value = [litem.value];
                created.rule = lookup[map.root];
                created.reduceCount = 1;
                
                me.params = created;
                
                return 3;
            }
            else {
                me.params = 'Failed last reduce';
                return 0;
            }
            
        }
        
        buffer[bl++] = [state, created];
        me.returns = true;
        
        // iterate
        state = states[state][name];
        ref = states[state];
        
        name = lexeme.symbol;
        me.pstate = state;
       
        // shift
        console.log('shift? ', name, 'lexeme', lexeme, ' in ', ref);
        if (name in ref) {
            return 1;
        
        }
        // reduce
        else if (state in ends) {
            return 2;
        }
        
        me.params = 'failed reduce! inside :reduce';
        return 0;
        
    },
    
    ':success': function (lexeme) {
        var me = this;
        
        me.completed =
            me.returns = true;

        me.current = lexeme;
        
        return false;
    },
    
    ':fail': function (error) {
        var me = this;
        
        me.error = error;
        me.completed = true;
        
        return false;
    },
    
    isAcceptableToken: function (token) {
        return !(token[0] in this.parser.map.exclude);
    },
    
    update: function (value) {
        var me = this,
            current = me.current;
        
        if (!me.error && current) {
            
            current.value = value;
            
        }
        
        return this;
    },
    
    reset: function () {
        var parser = this.parser;
        
        this.nextTokenIndex = 0;
        this.cursor = 0;
        this.buffer = [];
        
        this.state = this.start;
        this.pstate = parser.map.start;
        this.params = null;
        
        if (!this.subject) {
            delete this.ready;
        }
        
        delete this.complete;
        delete this.error;
        
        delete this.returns;
        delete this.current;
        
    },
    
    set: function (subject) {
        if (!string(subject)) {
            throw new Error("Invalid String subject parameter.");
        }
        
        this.reset();
        this.subject = subject;
        this.ready = true;
        

    },
    
    next: function () {
        var me = this,
            actions = me.actions,
            isNumber = number,
            completed = me.completed,
            returns = false;
        var state, params, result, ref, current;

        // reset current
        if (!completed) {
            delete me.current;
        }
        
        for (; !completed;) {
            
            state = me.state;
            params = me.params;
            
            // check if it action can be transitioned
            if (!(state in me)) {
                throw new Error("No handler found for state " + state);
            }
            
            // handle transition
            result = me[state](params);
            returns = me.returns;
            delete me.returns;
            current = me.current;
            completed = me.completed;
            
            // break on error
            if (me.error) {
                break;
            }
            
            // after transition, may error caught or successfully completed
            if (!completed) {
                
                // accepts number result
                if (!isNumber(result)) {
                    throw new Error(INVALID_STATE_HANDLER + state);
                }
                    
                // can transition to next state
                ref = actions[state];
                
                if (!(result in ref)) {
                    throw new Error(INVALID_STATE_HANDLER + state);
                }
                
                me.state = ref[result];
            }
            
            // return params
            if (returns === true) {
                return current;
            }
            
            
        }
        
        return me.error || !completed ? false : null;
        
    }
};

export default BaseIterator;
