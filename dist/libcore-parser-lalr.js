(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('libcore'), require('libcore-tokenizer')) :
	typeof define === 'function' && define.amd ? define(['exports', 'libcore', 'libcore-tokenizer'], factory) :
	(factory((global['libcore-parser-lalr'] = {}),global.libcore,global['libcore-tokenizer']));
}(this, (function (exports,libcore,Tokenizer) { 'use strict';

Tokenizer = Tokenizer && Tokenizer.hasOwnProperty('default') ? Tokenizer['default'] : Tokenizer;

function StateMap(debug) {
    var start = "0",
        end = "End",
        tokenEnd = "$",
        states = {};

    this.stateGen =
        this.symbolGen =
        this.reduceGen = 0;

    states[start] = {};
    this.lookup = {};
    this.symbol = {};
    this.start = start;
    this.states = states;
    this.ends = {};
    this.exclude = {};
    this.finalized = false;
    this.rawStates = [];

    this.reduceLookup = {};
    this.reducers = {};
    this.debugMode = debug === true;

    this.setRoot(end);
    this.endSymbol = this.generateSymbol(tokenEnd);
    this.endToken = tokenEnd;

}


StateMap.prototype = {
    stateGen: 0,
    rawStates: null,
    debugMode: false,
    
    constructor: StateMap,

    setRoot: function (name) {
        this.root = this.generateSymbol(name);
        this.augmentedRoot = this.generateSymbol(name + "'");
    },

    createState: function (id) {
        var states = this.states;

        if (id in states) {
            return states[id];
        }
        return (states[id] = {});
    },
    
    createPointer: function (id, token, target) {
        var state = this.createState(id);

        state[token] = target;

        return state;

    },

    generateSymbol: function (name) {

        var lookup = this.lookup,
            symbols = this.symbol,
            access = ':' + name;
        var id;
        
        if (access in lookup) {
            return lookup[access];
        }
    
        // create symbol
        id = this.debugMode ?
                '[' + name + ']' :
                (++this.symbolGen).toString(36);

        lookup[access] = id;
        symbols[id] = name;
    
        return id;
    
    },

    generateReduceId: function (name, params, ruleIndex) {
        var lookup = this.reduceLookup,
            all = this.reducers,
            access = name + ':' + params + ':' + ruleIndex;
        var id;

        if (access in lookup) {
            return lookup[access];
        }

        id = this.debugMode ?
                '[' + name + ':' + params + '>' + ruleIndex + ']' :
                (++this.reduceGen).toString(36);

        lookup[access] = id;
        all[id] = [name, params, ruleIndex];

        return id;
    },

    lookupReducer: function (id) {
        var all = this.reducers;
        
        if (id in all) {
            return all[id];
        }

        return false;
    },

    lookupSymbol: function lookupSymbol(name) {
        var symbols = this.symbol;

        if (name in symbols) {
            return symbols[name];
        }

        return false;

    },
    
    setReduceState: function (state, name, params, ruleIndex) {
        var ends = this.ends,
            id = this.generateReduceId(name, params, ruleIndex),
            all = this.reducers;
        var current;
        
        if (state in ends) {
            current = all[ends[state]];
            if (current[0] !== name || current[1] !== params) {
                throw new Error("Reduce conflict found " +
                                this.lookupSymbol(current[0]) + ' ! <- ' +
                                this.lookupSymbol(name));
            }
        }
        else {
            ends[state] = id;
        }
        
    },
    
    reset: function () {
        this.constructor(this.debugMode);
    },

    finalize: function() {
        var list = this.rawStates;
        var c, l;

        if (!this.finalized && list) {
            this.finalized = true;

            for (c = -1, l = list.length; l--;) {
                list[++c].finalize();
            }

            // remove raw states
            list.length = 0;

            // remove lookup
            delete this.lookup;
        }
        
        return this.finalized;
    },
    
    setExcludes: function (exclude) {
        var current = this.exclude;
        var c, l;
        
        if (libcore.array(exclude)) {
            for (c = -1, l = exclude.length; l--;) {
                current[exclude[++c]] = true;
            }
        }
    },
    
    importStates: function (definition) {
        var isObject = libcore.object,
            isString = libcore.string;
        var start, states, ends, root, exclude, symbol, reducers, augmentedRoot,
            list, c, l;
        
        if (!isObject(definition)) {
            throw new Error("Invalid Object definition parameter.");
        }
        
        states = definition.states;
        if (!isObject(states)) {
            throw new Error(
                        'Invalid "states" Object in definition parameter.');
        }
        
        root = definition.root;
        if (!isString(root)) {
            throw new Error(
                        'Invalid "root" grammar rule in definition parameter.');
        }

        augmentedRoot = definition.augmentedRoot;
        if (!isString(augmentedRoot)) {
            throw new Error(
            'Invalid "augmentedRoot" grammar rule in definition parameter.');
        }
        
        start = definition.start;
        if (!isString(start) || !(start in states)) {
            throw new Error(
                        'Invalid "start" state in definition parameter.');
        }
        
        ends = definition.ends;
        if (!isObject(ends)) {
            throw new Error('Invalid "ends" states in definition parameter.');
        }

        reducers = definition.reducers;
        if (!isObject(reducers)) {
            throw new Error('Invalid production "reducers" in definition.');
        }

        symbol = definition.symbol;
        if (!isObject(symbol)) {
            throw new Error('Invalid "symbol" map in definition parameter.');
        }

        list = definition.exclude;
        if (!libcore.array(list)) {
            throw new Error('Invalid "exclude" token in definition parameter.');
        }

        exclude = {};
        for (c = -1, l = list.length; l--;) {
            exclude[list[++c]] = true;
        }


        this.augmentedRoot = augmentedRoot;
        this.root = root;
        this.start = start;
        this.states = states;
        this.ends = ends;
        this.reducers = reducers;
        this.exclude = exclude;
        this.symbol = symbol;
        
        return true;
    },
    
    toObject: function () {
        var has = libcore.contains,
            exclude = this.exclude,
            list = [],
            len = 0;
        var name;

        // export exclude
        for (name in exclude) {
            if (has(exclude, name)) {
                list[len++] = name;
            }
        }


        return {
                augmentedRoot: this.augmentedRoot,
                root: this.root,
                start: this.start,
                states: this.states,
                reducers: this.reducers,
                ends: this.ends,
                exclude: list,
                symbol: this.symbol
            };
    },
    
    exportStates: function (json) {
        var current = this.toObject();
            
        if (json === true) {
            try {
                return JSON.stringify(current);
            }
            catch (e) {
                return null;
            }
        }
        
        return current;
    }
    
    
};

var NONTERMINAL_RE = /^([A-Z][a-zA-Z]+(\_?[a-zA-Z0-9])*\'?)$/;

function isTerminal(name) {
        return name === "$" || !NONTERMINAL_RE.test(name);
    }

function defineTerminals(registry, name, definitions) {
        var isRegex = libcore.regex;
        var c, l, terminal;

        for (c = -1, l = definitions.length; l--;) {
            terminal = definitions[++c];

            if (!isRegex(terminal)) {
                throw new Error("Invalid Terminal pattern: " + terminal);
            }

            if (!registry.registerTerminal(terminal, name)) {
                throw new Error("Invalid Terminal pattern: " + terminal);
            }

        }

    }



function defineRules(registry, name, definitions) {
        var isString = libcore.string,
            isRegex = libcore.regex,
            isArray = libcore.array,
            isTerm = isTerminal;

        var c, l, rl, rule, lexeme, ruleMask, terminals, isTerminalToken;

        for (c = -1, l = definitions.length; l--;) {
            rule = definitions[++c];
            if (isString(rule) || isRegex(rule)) {
                rule = [rule];
            }
            else if (!isArray(rule)) {
                throw new Error("Invalid Grammar rule declared in " + name);
            }

            //console.log("define rules: ", name, " definitions ", rule);

            // create rule mask
            rl = rule.length;
            ruleMask = [];
            terminals = {};

            for (; rl--;) {
                lexeme = rule[rl];

                if (isRegex(lexeme)) {

                    if (!registry.terminalExist(lexeme)) {
                        registry.registerTerminal(lexeme);
                    }

                    lexeme = '/' + lexeme.source + '/';
                    isTerminalToken = true;
                }
                else if (!isString(lexeme)) {
                    throw new Error("Invalid Grammar rule declared in " + name);
                }
                else {
                    isTerminalToken = isTerm(lexeme);
                }

                
                //console.log("hashed! ", ruleMask[rl]);
                ruleMask[rl] = registry.map.generateSymbol(lexeme);//registry.hashLexeme(lexeme);

                if (isTerminalToken) {
                    terminals[rl] = true;
                }
                
            }

            // define states from ruleMask
            registry.registerRule(name, ruleMask, terminals);

        }



    }

//import List from "./list.js";

function State(registry, id, items) {

    this.id = id;
    this.registry = registry;
    this.items = items || [];
    this.end = null;

    this.tokens = [];
    this.pointers = {};
}

State.prototype = {
    constructor: State,
    
    containsItems: function (items) {
        var myItems = this.items,
            total = myItems.length;
        var subject, mylen, len;

        if (items.length === total) {
            mylen = total;
            mainLoop: for (; mylen--;) {
                subject = myItems[mylen];
                len = total;
                for (; len--;) {
                    if (subject === items[len]) {
                        continue mainLoop;
                    }
                }
                return false;
            }
            return true;
        }
        return false;
    },

    pointTo: function (token, targetState) {
        var names = this.tokens,
            pointers = this.pointers;

        if (token in pointers) {
            if (pointers[token] !== targetState) {
                throw new Error("Invalid state target from " + this.id +
                                        " -> " + token + " -> " + targetState);
            }
        }
        else {
            pointers[token] = targetState;
            names[names.length] = token;
        }
    },

    setEnd: function (item) {
        var current = this.end;
        if (current) {
            throw new Error("There is reduce-reduce conflict in: " +
                                item.id + " <- " + item.production +
                                " from state: ", this.id);
        }
        
        this.end = [item.params, item.production, item.id];
    }

};

function List(name) {
    this.name = name;
}

List.prototype = {
    constructor: List,
    first: null,
    last: null,

    shift: function () {
        var item = this.first;
        var first;

        if (item) {
            this.first = first = item[0];
            if (!first) {
                this.last = first;
            }
            return item[1];
        }
        

        return null;
    },

    pop: function () {
        var item = this.last;
        var last;

        if (item) {
            this.last = last = item[0];
            if (!last) {
                this.first = last;
            }
            return item[1];
        }
        

        return null;
    },

    push: function (item) {
        item = [null, item];

        if (this.last) {
            this.last[0] = item;
        }
        else {
            this.first = item;
        }

        this.last = item;

        return this;
    }
};

function define$1(registry) {

    var map = registry.map,
        StateClass = State,
        productionStatesIndex = registry.productions,
        closureDefinitions = registry.closureItems,
        stateDefineQueue = new List(),
        STATE_END = 0,
        STATE_CREATE_INITIAL = 1,
        STATE_CREATE_GOTO = 2,
        STATE_CREATE_STATE = 3,
        defineState = STATE_CREATE_INITIAL,
        production = map.augmentedRoot,
        states = [],
        sl = 0;

    var list, c, l, item, items, token, total, tokens, id, lookup,
        stateBefore, state, end;


    //var limit = 100;

    
    for (; defineState;) {
        switch (defineState) {

        // create initial closure from production
        //  - requires "production" set
        case STATE_CREATE_INITIAL:
            // new closures
            item = registry.createClosure(productionStatesIndex[production]);
            list = item[1];

            // create state from closure
            sl = states.length;
            state = states[sl] = new StateClass(registry,
                                                sl.toString(32),
                                                item[0]);

            // queue transitions
            c = -1;
            l = list.length;
            for (; l--;) {
                item = list[++c];
                stateDefineQueue.push([state, item[1], item[0]]);
            }


            if (!stateDefineQueue.first) {
                defineState = STATE_END;
                break;
            }

            defineState = STATE_CREATE_GOTO;
            break;
            

        /* falls through */
        // requires "list"
        case STATE_CREATE_GOTO:
            item = stateDefineQueue.shift();
            stateBefore = item[0];
            list = item[1];
            token = item[2];
            item = registry.createClosure(list);
            items = item[0];
            tokens = item[1];

            // find states having the same closure items
            total = sl = states.length;
            state = null;
            for (; sl--;) {
                item = states[sl];
                if (item.containsItems(items)) {
                    state = item;
                    break;
                }
            }

            // create state if no state found
            if (!state) {
                sl = total++;
                state = states[sl] = new StateClass(registry,
                                                    sl.toString(32),
                                                    items);

                // queue transitions
                c = -1;
                l = tokens.length;
                for (; l--;) {
                    item = tokens[++c];
                    stateDefineQueue.push([state, item[1], item[0]]);
                }

                // apply end state for each end items
                c = -1;
                l = items.length;
                for (; l--;) {
                    item = closureDefinitions[items[++c]];
                    if (!item.after) {
                        state.setEnd(item);
                    }
                }

            }

            



            // point state before to new state
            stateBefore.pointTo(token, state);

            // create next state
            defineState = stateDefineQueue.first ?
                                STATE_CREATE_GOTO : STATE_END;
            break;

            
        /* falls through */
        case STATE_END:
            defineState = null;
        }

        

        // if (!--limit) {
        //     console.log("limit reached");
        //     break;
        // }
    }

    // finalize map
    sl = states.length;
    for (; sl--;) {
        item = states[sl];
        id = item.id;
        state = map.createState(id);
        tokens = item.tokens;
        lookup = item.pointers;
        c = -1;
        l = tokens.length;
        for (; l--;) {
            token = tokens[++c];
            map.createPointer(id, token, lookup[token].id);
        }
        
        item = item.end;
        if (item) {
            map.setReduceState(id, item[1], item[0], item[2]);
        }
    }
    
}

function Registry(map, tokenizer) {
    this.tokenizer = tokenizer;
    this.map = map;

    this.ruleLookup = {};
    this.productions = {};
    this.closureItems = {};

    // this.productions = {};
    // this.productionNames = [];
    // this.lexemes = {};
    // this.closures = {};

    // this.stateIndex = {};
    // this.vstateIdGen = 0;
    // this.vstateLookup = {};
    // this.vstates = [];
    // this.ends = {};

    // this.rules = {};
    // this.recursions = {};
    
    this.terminals = [];
    this.terminalLookup = {};

    // this.symbolGen = 0;
    // this.symbol = {};
    // this.lookup = {};

    this.stateTagIdGen = 0;
    this.stateTagId = {};
    this.stateTagIdLookup = {};

    

}

Registry.prototype = {
    constructor: Registry,

    startRule: null,
    rules: null,

    hashState: function (name) {
        var lookup = this.stateTagIdLookup,
            access = ':' + name;
        var id;

        if (access in lookup) {
            return lookup[access];
        }

        id = this.map.debugMode ?
                ':' + name :
                (++this.stateTagIdGen).toString(36);

        lookup[access] = id;
        this.stateTagId[id] = name;

        return id;

    },

    lookupState: function (id) {
        var list = this.stateTagId;
        
        return id in list ? list[id] : null;
    },

    hashLexeme: function (name) {
        
        var lookup = this.lookup,
            symbols = this.symbol,
            access = ':' + name;
        var id;
        
        if (access in lookup) {
            return lookup[access];
        }
    
        // create symbol
        id = this.map.debugMode ?
                '[' + name + ']' :
                (++this.symbolGen).toString(36);
    
        lookup[access] = id;
        symbols[id] = name;
    
        return id;
    
    },

    lookupLexeme: function (id) {
        var lookup = this.lookup;
        return id in lookup ? lookup[id] : null;
    },

    terminalExist: function (terminal) {
        var lookup = this.terminalLookup;

        return libcore.string(terminal) ?
                    libcore.contains(lookup, terminal) :
                    '/' + terminal.source + '/' in lookup;
    },

    registerTerminal: function (terminal, name) {
        var lookup = this.terminalLookup,
            names = this.terminals,
            access = this.map.generateSymbol('/' + terminal.source + '/');
        var list;

        if (!name) {
            name = access;
        }

        // allow register
        if (!(access in lookup)) {
            
            lookup[access] = name;

            // register named
            if (access === name) {
                names[names.length] = name;

            }
            else if (!libcore.contains(lookup, name)) {
                names[names.length] = name;
                lookup[name] = [access];

            }
            else {
                list = lookup[name];
                list[list.length] = access;
            }

            this.tokenizer.define([name, terminal]);

            return name;
            
        }

        return false;


    },

    registerRule: function (name, mask, terminals) {
        var this$1 = this;

        var closureItems = this.closureItems,
            rules = this.productions,
            ruleIndex = this.ruleLookup,
            c = -1,
            l = mask.length + 1,
            before = null,
            params = 0;
        var items, state, item;

        if (!(name in rules)) {
            rules[name] = [];
        }

        rules = rules[name];

        for (; l--;) {
            items = mask.slice(0);
            items.splice(++c, 0, '.');
            state = this$1.hashState(name + '->' + items.join(' '));

            // first
            if (!c) {
                if (state in ruleIndex) {
                    throw new Error("Duplicate Grammar Rule found " +
                                    this$1.lookupState(state) +
                                    " in production: " +
                                    this$1.map.lookupSymbol(name));
                }
                ruleIndex[state] = name;

                // register production state
                rules[rules.length] = state;
            }

            closureItems[state] =
                item = {
                    id: state,
                    production: name,
                    before: null,
                    after: null,
                    terminal: false,
                    token: null
                };

            if (before) {
                item.before = before.id;
                before.after = state;
            }
            
            before = item;

            // has token lookup
            if (l) {
                params++;
                item.terminal = c in terminals;
                item.token = mask[c];
            }
            else {
                item.params = params;
            }
            
        }

    },

    createClosure: function (items) {
        var definitions = this.closureItems,
            productionItems = this.productions,
            created = {},
            processed = {},
            tokens = [],
            tl = 0,
            c = -1,
            l = items.length;
        var item, token, terminal, list, additional;

        items = items.slice(0);

        for (; l--;) {
            item = items[++c];
            if (item in created) {
                items.splice(c--, 1);
                continue;
            }
            created[item] = true;
            item = definitions[item];
            token = item.token;
            terminal = item.terminal;

            if (token) {
                
                if (token in processed) {
                    list = tokens[processed[token]][1];
                    list[list.length] = item.after;
                }
                else {
                    processed[token] = tl;
                    tokens[tl++] = [token, [item.after]];

                    // non-terminal
                    if (!terminal) {
                        // recurse get additional production first states
                        additional = productionItems[token];
                        items.push.apply(items, additional);
                        l += additional.length;

                    }
                }

            }
        }

        return [items, tokens];

    }
};

function build(root, map, tokenizer, definitions, exclude) {
    var isString = libcore.string,
        isArray = libcore.array,
        isRegex = libcore.regex,
        
        isTerm = isTerminal,
        defTerminal = defineTerminals,
        defRule = defineRules,
        name = null,
        original = name,
        
        terminalDefinition = true;

    var c, l, definition, registry, excludes;


    map.reset();
    map.setRoot(root);

    registry = new Registry(map, tokenizer);

    // augment root
    definitions.splice(definitions.length,
                       0,
                       map.lookupSymbol(map.augmentedRoot),
                        [[ root, map.lookupSymbol(map.endSymbol)]]);

    for (c = -1, l = definitions.length; l--;) {
        
        definition = definitions[++c];
        
        if (isString(definition)) {

            terminalDefinition = isTerm(definition);
            name = map.generateSymbol(definition);
            original = definition;

        }
        else if (name && isArray(definition)) {

            (terminalDefinition ?
                defTerminal :
                defRule)(registry, name, definition);

        }
        else {
            throw new Error("Invalid item in definitions parameter.");
        }
    }

    define$1(registry);

    // register excludes
    if (isArray(exclude)) {
        excludes = [];

        //console.log("excludes! ", exclude);
        for (c = -1, l = exclude.length; l--;) {
            definition = exclude[++c];
            if (isRegex(definition)) {
                definition = registry.registerTerminal(definition);
            }
            else if (isString(definition)) {
                definition = map.generateSymbol(definition);
            }
            else {
                throw new Error("Invalid [exclude] pattern parameter.");
            }
            
            excludes[c] = definition;

        }

        map.setExcludes(excludes);
    }

    return true;
}

var TYPE = {
        terminal: 1,
        nonterminal: 2,
        compound: 3,
        end: 4
    };
    
    

function Lexeme(type) {
    this.terminal = false;
    this.useType(type);
}


Lexeme.prototype = {
    constructor: Lexeme,
    name: null,
    rule: null,
    value: null,
    reduceCount: 0,
    from: 0,
    to: 0,
    
    parent: null,
    first: null,
    last: null,
    next: null,
    previous: null,
    terminal: false,
    
    useType: function (type) {
        var types = TYPE;
        this.type = type = libcore.contains(types, type) ?
                                types[type] : types.token;
        if (type === TYPE.terminal) {
            this.terminal = true;
        }
    }
};

var INVALID_STATE_HANDLER = "Invalid result from state handler";

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

            //console.log("token accepted! ", token, name, ' shift? ', ref);

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

        //console.log("shift from ! ", state, lexeme.value, " to ", me.pstate);
        
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
        last = null;
        
        //console.log("reduce count? ", state, "?", params, " from ", reduce, " buffer ", buffer.slice(0));
        
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
                created.reduceCount = 1;
                
                me.params = created;
                
                return 3;
            }
            else {
                me.params = 'Failed last reduce';
                return 0;
            }
            
        }
        //console.log("reduced: ", state, ' <- ', created);
        buffer[bl++] = [state, created];
        me.returns = true;
        
        // iterate
        state = states[state][name];
        ref = states[state];
        
        name = lexeme.symbol;
        me.pstate = state;
       
        // shift
        //console.log('shift? ', name, 'lexeme', lexeme, ' in ', state, ':', ref);
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
            isNumber = libcore.number,
            completed = me.completed,
            returns = false;
        var state, params, result, ref, current;

        if (!me.ready) {
            throw new Error("Iterator is not yet ready, nothing to Parse.");
        }

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

var defaultIteratorName = "base";
var ITERATORS = {};

function register(name, Class) {
        var Base = BaseIterator;
        
        if (!libcore.string(name)) {
            throw new Error("Invalid iterator name parameter.");
        }
        
        if (!libcore.method(Class) ||
            (Class !== Base && !(Class.prototype instanceof Base))) {
            throw new Error("Invalid iterator Class parameter.");
        }
        
        ITERATORS[':' + name] = Class;
        
        return true;
    }

function get(name) {
        var list = ITERATORS;
        
        if (libcore.string(name)) {
            name = ':' + name;
            if (name in list) {
                return list[name];
            }
        }
        
        return null;
    }

register(defaultIteratorName, BaseIterator);

var debugMode = false;

function Parser(root, definition, exclude) {
    
    this.tokenizer = new Tokenizer();
    this.map = new StateMap(debugMode);
    
    if (arguments.length) {
        this.define(root, definition, exclude);
    }
}


Parser.prototype = {
    subject: '',
    tokenizer: null,
    map: null,
    ready: false,
    constructor: Parser,
    
    iterator: function (name) {
        var get$$1 = get;
        var Iterator;
        
        if (arguments.length) {
            Iterator = get$$1(name);
            if (!Iterator) {
                throw new Error("Invalid iterator name parameter.");
            }
        }
        else {
            Iterator = get$$1(defaultIteratorName);
        }
        
        return new Iterator(this);
    },
    
    define: function (root, definition, exclude) {
        var isArray = libcore.array;
        var ready;
        
        if (!isArray(exclude)) {
            exclude = [];
        }
        
        if (!libcore.string(root)) {
            throw new Error("Invalid root grammar rule parameter.");
        }
        
        if (!isArray(definition)) {
            throw new Error("Invalid grammar rules definition parameter");
        }
        
        
        this.ready = ready = build(root,
                                    this.map,
                                    this.tokenizer,
                                    definition,
                                    exclude);
        
        return ready;

    },
    
    fromJSON: function (json) {
        var isObject = libcore.object;
        var tokenMap;
        
        if (libcore.string(json)) {
            try {
                json = JSON.parse(json);
            }
            catch (e) {
                throw new Error("Invalid JSON String json parameter.");
            }
        }
        
        if (!isObject(json)) {
            throw new Error("Invalid Object json parameter.");
        }
        
        tokenMap = json.tokens;
        
        if (!isObject(tokenMap)) {
            throw new Error('Invalid "tokens" property of json parameter.');
        }
        
        this.tokenizer.fromJSON(tokenMap);
        this.map.importStates(json);
        
        return this;
        
    },
    
    toJSON: function () {
        return JSON.stringify(this.toObject());
    },
    
    toObject: function () {
        var object$$1;
        
        if (!this.ready) {
            throw new Error("Grammar rules is not yet defined.");
        }
        
        object$$1 = this.map.toObject();
        object$$1.tokens = this.tokenizer.toObject();
        
        return object$$1;
    },
    
    parse: function (subject, reducer, iterator) {
        var isString = libcore.string,
            rpn = [],
            rl = 0;
        var lexeme, name, value;
        
        if (!isString(subject)) {
            throw new Error("Invalid string subject parameter");
        }
        
        iterator = isString(iterator) ?
                        this.iterator(iterator) :
                        this.iterator();
        
        if (!iterator) {
            throw new Error("Invalid Iterator parameter.");
        }
        
        if (!libcore.object(reducer)) {
            reducer = {};
        }
        
        iterator.set(subject);
        
        for (lexeme = iterator.next(); lexeme; lexeme = iterator.next()) {
            rpn[rl++] = lexeme;
            
            name = lexeme.name;
            if (name in reducer) {
                value = reducer[name](name, lexeme.value, lexeme);
                
                if (typeof value !== "undefined") {
                    lexeme.value = value;
                }
                else if (lexeme.params !== 0) {
                    lexeme.value = null;
                }
                
            }
            
        }
        
        return iterator.error ? false : rpn;
        
    }
};


function debug(isDebugMode) {
        debugMode = isDebugMode !== false;
    }

function define(root, definitions, exclusions) {
        return new Parser(root, definitions, exclusions);
    }

function load(json) {
        var parser;
        
        if (libcore.string(json)) {
            try {
                json = JSON.parse(json);
            }
            catch (e) {
                throw new Error(
                    "Unable to load from invalid json JSON String parameter: " +
                    e.toString());
            }
        }
        else if (!libcore.object(json)) {
            throw new Error("Unable to load from invalid json Object parameter.");
        }
        
        parser = new Parser();
        
        try {
            parser.fromJSON(json);
        }
        catch (e) {
            throw new Error(e);
        }
        
        return parser;
    }
function isParser(parser) {
        return parser instanceof Parser;
    }




// integrate to libcore
//module.exports = libcore.lalr = {
//    Parser: Parser,
//    Iterator: iteratorManager.Base,
//    isParser: isParser,
//    define: define,
//    load: load,
//    registerIterator: iteratorManager.register
//};

var moduleApi$1 = Object.freeze({
	debug: debug,
	Parser: Parser,
	define: define,
	load: load,
	isParser: isParser,
	Iterator: BaseIterator,
	registerIterator: register
});

exports['default'] = moduleApi$1;
exports.debug = debug;
exports.Parser = Parser;
exports.define = define;
exports.load = load;
exports.isParser = isParser;
exports.Iterator = BaseIterator;
exports.registerIterator = register;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=libcore-parser-lalr.js.map
