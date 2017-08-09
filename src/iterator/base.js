'use strict';

var libcore = require("libcore");

function BaseIterator(parser) {
    if (!libcore.object(parser)) {
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
            1: ':shift',
            2: ':reduce'
            
        },
        
        ':shift': {
            0: ':fail',
            1: ':start'
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
        var me = this,
            parser = me.parser,
            map = parser.map,
            states = map.states,
            ends = map.ends,
            exclude = map.exclude,
            tokenizer = parser.tokenizer,
            from = me.nextTokenIndex,
            state = me.pstate,
            token = tokenizer.tokenize(from, me.subject);
            
        var name, ref, to;
        
        for (; token; token = tokenizer.tokenize(from, me.subject)) {
            name = token[0];
            if (name in exclude) {
                from = token[2];
            }
            else {
                break;
            }
        }
        

        if (token) {
            ref = states[state];
            
            to = token[2];
            
            me.nextTokenIndex = to;
            
            // convert to lexeme
            me.params = me.createLexeme(name,
                                        token[1],
                                        null,
                                        0,
                                        from,
                                        to,
                                        null);
            
            // shift
            if (name in ref) {
                return 1;
            }
            
        }
        
        // reduce
        if (me.buffer.length) {
            
            if (state in ends) {
                return 2;
            }
            else {
                me.params = 'failed reduce!';
                return 0;
            }
        }
        
        me.params = 'Failed from start';
        return 0;
        
    },
    
    ':shift': function (lexeme) {
        var me = this,
            buffer = me.buffer,
            states = me.parser.map.states,
            state = me.pstate,
            name = lexeme.name;
        
        buffer[buffer.length] = [state, lexeme];
        
        me.pstate = states[state][name];
        me.current = lexeme;
        me.params = null;
        
        // do not return "$" token
        me.returns = name !== "$";
        
        return 1;

    },
    
    ':reduce': function (lexeme) {
        var me = this,
            map = me.parser.map,
            buffer = me.buffer,
            bl = buffer.length,
            ends = map.ends,
            states = map.states,
            state = me.pstate,
            reduce = ends[state],
            name = reduce[0],
            params = reduce[1],
            values = [],
            l = params,
            endIndex = l - 1;
            
        var litem, item, from, to, ref, created;
        
        for (; l--;) {
            item = buffer[--bl];
            state = item[0];
            litem = item[1];
            
            // create range
            from = litem.from;
            if (l === endIndex) {
                to = litem.to;
            }
            
            values[l] = litem;
            
        }
        
        buffer.length = bl;
        me.current = created = me.createLexeme(name,
                                               null,
                                               values,
                                               params,
                                               from,
                                               to,
                                               reduce[2]);
        
        // only if it ended
        if (name === '$end') {
            
            if (bl === 0) {
                created.params = 1;
                created.children = [created.children[0]];
                created.ruleIndex = true;
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
        
        name = lexeme.name;
        me.pstate = state;
        
        // shift
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
    
    createLexeme: function (name, value, morphemes, params, from, to, rIndex) {
        return {
                name: name,
                params: params,
                value: value,
                children: morphemes,
                from: from,
                to: to,
                ruleIndex: rIndex || name
            };
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
        if (!libcore.string(subject)) {
            throw new Error("Invalid String subject parameter.");
        }
        
        this.reset();
        this.subject = subject;
        this.ready = true;
        

    },
    
    next: function () {
        var me = this,
            actions = me.actions,
            number = libcore.number,
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
                if (!number(result)) {
                    throw new Error("Invalid result from state handler" +
                                    state);
                }
                    
                // can transition to next state
                ref = actions[state];
                
                if (!(result in ref)) {
                    throw new Error("Invalid result from state handler" +
                                    state);
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

module.exports = BaseIterator;
