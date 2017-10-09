(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('libcore'), require('libcore-tokenizer')) :
	typeof define === 'function' && define.amd ? define(['exports', 'libcore', 'libcore-tokenizer'], factory) :
	(factory((global['libcore-parser-lalr'] = {}),global.libcore,global['libcore-tokenizer']));
}(this, (function (exports,libcore,Tokenizer) { 'use strict';

Tokenizer = Tokenizer && Tokenizer.hasOwnProperty('default') ? Tokenizer['default'] : Tokenizer;

function StateMap() {
    var start = "$start",
        end = "$end",
        tokenEnd = "$",
        states = {};

    this.stateGen =
        this.symbolGen =
        this.reduceGen = 0;

    states[start] = {};
    this.root = end;
    this.lookup = {};
    this.symbol = {};
    this.start = start;
    this.states = states;
    this.anchors = {};
    this.ends = {};
    this.exclude = {};
    this.finalized = false;
    this.rawStates = [];

    this.reduceLookup = {};
    this.reducers = {};

    this.augmentedRoot = this.generateSymbol(end);
    this.endSymbol = this.generateSymbol(tokenEnd);
    this.endToken = tokenEnd;

}


StateMap.prototype = {
    stateGen: 0,
    rawStates: null,
    
    constructor: StateMap,
    
    generateState: function () {
        var id = 's' + (++this.stateGen);
        this.states[id] = {};
        return id;
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
        id = 's>' + (++this.symbolGen);
    
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

        id = 'r>' + (++this.reduceGen);

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
    
    setAnchorState: function (state) {
        var anchors = this.anchors;
        
        if (!(state in anchors)) {
            this.anchors[state] = true;
        }
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
                                current[0] + ' ! <- ' + name);
            }
        }
        else {
            ends[state] = id;
        }
        
    },
    
    reset: function () {
        this.constructor();
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
        var start, states, anchors, ends, root, exclude, symbol, reducers,
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
        
        start = definition.start;
        if (!isString(start) || !(start in states)) {
            throw new Error(
                        'Invalid "start" state in definition parameter.');
        }
        
        anchors = definition.anchors;
        if (!isObject(anchors)) {
            throw new Error('Invalid "anchors" states in definition parameter.');
        }
        
        ends = definition.ends;
        if (!isObject(anchors)) {
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
        
        this.root = root;
        this.start = start;
        this.states = states;
        this.anchors = anchors;
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
                root: this.root,
                start: this.start,
                states: this.states,
                anchors: this.anchors,
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

function empty() {
}

function clone(obj) {
        var E = empty;
        E.prototype = obj;
        return new E();
    }

function Pointer(lexeme, state) {

    this.item = lexeme;

    // bind
    this.to = state;

}

Pointer.prototype = {
    constructor: Pointer,
    next: null,
    item: null,
    to: null

};

function Item(id, map) {
    var list = map.rawStates;
    
    this.map = map;
    this.state = id = id || map.generateState();
    this.base = this;
    this.watched = [];
    this.reduceList = [];
    this.recursion = {};

    this.references = [];

    // create default
    this.lexeme = map.augmentedRoot;

    // register as raw state
    list[list.length] = this;

}

Item.prototype = {
    state: null,
    constructor: Item,
    nextInQueue: null,
    parent: null,
    map: null,
    pointer: null,
    watched: null,
    contextPointer: null,
    reduceList: null,
    lexeme: null,
    recursion: null,
    finalized: false,

    getRecursionItem: function (ruleId) {
        var recursion = this.recursion;

        return ruleId in recursion ? recursion[ruleId] : null;

    },

    insertNextQueue: function (item) {
        var after = this.nextInQueue,
            last = item;

        this.nextInQueue = item;

        // connect last item with my next item
        for (; last.nextInQueue; last = last.nextInQueue) { }

        last.nextInQueue = after;

    },

    appendQueue: function (item) {
        var last = this;

        for (; last.nextInQueue; last = last.nextInQueue) { }

        last.nextInQueue = item;

    },

    createRecursion: function (ruleId, lexeme) {
        var item = clone(this),
            // common recursion
            recursion = this.recursion;

        item.parent = this;

        item.lexeme = lexeme;
        item.recursion = recursion;
        recursion[ruleId] = item;

        item.contextPointer =
            item.nextInQueue = null;

        return item;
    },

    getPointerItem: function getPointerItem(lexeme) {
        var pointer = this.pointer;

        // find from parent and up
        for (; pointer; pointer = pointer.next) {
            if (pointer.item === lexeme) {
                return pointer.to;
            }
        }

        return null;

    },

    point: function (lexeme) {

        var Class = Pointer,
            found = this.getPointerItem(lexeme);
        var list, c, len, item, has;

        // create if not found
        if (!found) {

            // create item
            found = new Item(null, this.map);
            found.lexeme = lexeme;

            // share recursion
            found.recursion = this.recursion;

            // create pointer
            this.onSetPointer(new Class(lexeme, found));

            // populate dependencies
            list = this.watched;

            for (c = -1, len = list.length; len--;) {
                item = list[++c];
                has = item.getPointerItem(lexeme);
                if (!has) {
                    item.onSetPointer(new Class(lexeme, found));
                }
            }
        }

        return found;

    },

    watchItem: function (item) {
        var list = this.watched,
            Class = Pointer;
        var pointer, lexeme, found;

        if (item.state !== this.state && list.indexOf(item) === -1) {
            
            list[list.length] = item;

            pointer = this.pointer;

            // add current pointers
            for (; pointer; pointer = pointer.next) {
                lexeme = pointer.item;
                found = item.getPointerItem(lexeme);

                if (!found) {
                    item.onSetPointer(new Class(lexeme, pointer.to));
                }
            }
        }
        
    },

    onSetPointer: function (pointer) {
        var last = this.pointer,
            context = this.contextPointer;
        var parent;

        // connect to last item
        if (last) {
            // connect last
            for (; last.next; last = last.next) {}
            last.next = pointer;

        }
        // new pointer
        else {
            // set base pointer
            this.base.pointer = pointer;
        }

        // populate context pointer across parents
        if (!context) {
            // populate parent context pointers
            parent = this;
            for (; parent; parent = parent.parent) {
                if (!parent.contextPointer) {
                    parent.contextPointer = pointer;
                }
            }
        }
    },

    finalize: function () {
        var map = this.map,
            id = this.state,
            stateObject = map.states[id];

        var list, c, len, item, lexeme;

        // finalize main pointers
        item = this.pointer;

        for (; item; item = item.next) {
            lexeme = item.item;

            if (!(lexeme in stateObject)) {
                stateObject[lexeme] = item.to.state;
            }
        }

        // reduce
        list = this.reduceList;
        for (c = -1, len = list.length; len--;) {
            item = list[++c];
            map.setReduceState(id, item[0], item[1], item[2]);
        }

    },

    reduce: function (production, params, group) {
        var list = this.reduceList;

        list[list.length] = [production, params, group];

    }

};

function define$1(grammar, map, exclude) {
    var STATE_END = 0,
        STATE_START = 1,
        STATE_RULE_ITERATE = 2,
        STATE_RULE_END = 5,

        defineState = STATE_START,
        ruleIndex = grammar.rules,
        ruleGroup = grammar.ruleGroup;

    var anchor, production, rule, lexeme, ruleId, params,
        queue, recursion, pendingRecursion, item;


    if (exclude) {
        map.setExcludes(exclude);
    }

    queue = new Item(map.start, map);
    
    for (; defineState;) {

        switch (defineState) {
        case STATE_START:
            if (!queue) {
                defineState = STATE_END;
                break;
            }

            anchor = queue;
            production = queue.lexeme;
            
            rule = ruleIndex[production];

            defineState = STATE_RULE_ITERATE;

            pendingRecursion = null;

        /* falls through */
        case STATE_RULE_ITERATE:
            // go to next pending
            if (!rule) {
                defineState = STATE_RULE_END;
                break;
            }
            
            ruleId = rule[0];
            lexeme = rule[1];

            // go to next rule
            rule = rule[2];

            // start of rule
            if (ruleId === false) {
                params = 0;
                queue = item = anchor;
                break;
            }

            // connect states
            params++;

            // non-terminal
            if (lexeme in ruleIndex) {

                // find recursion
                recursion = item.getRecursionItem(ruleId);
                
                // follow recursion
                if (recursion) {

                    // apply and watch updates
                    recursion.watchItem(item);

                    // end here
                    for (; rule && rule[0] !== false; rule = rule[2]) { }
                    break;

                }

                // create recursion
                recursion = item.createRecursion(ruleId, lexeme);

                // immediately insert if anchor
                if (queue === anchor) {
                    queue.insertNextQueue(recursion);

                }
                // add to pending
                else if (pendingRecursion) {
                    pendingRecursion.appendQueue(recursion);
                }
                // first pending recursion
                else {
                    pendingRecursion = recursion;
                }
                
            }
            
            item = item.point(lexeme);

            // reduce if no more next rules or end of lexer rule
            if (!rule || rule[0] === false) {
                item.reduce(production, params, ruleGroup[ruleId]);
            }
        
        break;
        case STATE_RULE_END:

            // insert pending recursions
            if (pendingRecursion) {
                queue.appendQueue(pendingRecursion);
            }

            // try next pending
            queue = queue.nextInQueue;
            defineState = STATE_START;

        break;
        }

    }
    
    // build state map
    return true;
    
}

var RULE_NAME_RE = /^([A-Z][a-zA-Z]+(\_?[a-zA-Z0-9])*|\$end|\$)$/;


function registerToken(grammar, definition, name) {
    var terminal = grammar.terminal,
        alias = grammar.tokenAlias,
        tokens = grammar.tokens,
        map = grammar.map,
        pendingTerminals = grammar.pendingTerminals;
    var reference, len;

    reference = map.generateSymbol('/' + definition.source + '/'); 
    if (!name) {
        name = reference;
    }
    
    // register alias as terminal
    if (!(reference in alias)) {
        alias[reference] = name;
        len = tokens.length;
        tokens[len++] = name;
        tokens[len++] = definition;

    }
    else if (alias[reference] !== name) {
        throw new Error("Token definition " + definition.source +
                        " is a duplicate of " +
                        map.lookupSymbol(alias[reference]));
    }
    
    if (!(name in terminal)) {
        terminal[name] = reference;
        
        if (pendingTerminals.indexOf(name) === -1) {
            pendingTerminals[pendingTerminals.length] = name;
        }
    }

    return [name, reference];
}

function defineTerminal(name, rule, grammar) {
    var map = grammar.map,
        setToken = registerToken,
        isRegex = libcore.regex,
        errorMessage = "Invalid terminal definitions in " +
                        map.lookupSymbol(name);

    var c, l, item;

    if (isRegex(rule)) {
        rule = [rule];
    }

    if (!libcore.array(rule)) {
        throw new Error(errorMessage);
    }

    for (c = -1, l = rule.length; l--;) {
        item = rule[++c];

        if (isRegex(item)) {
            setToken(grammar, item, name);
        }
        else {
            throw new Error(errorMessage);
        }
    }
}

function defineRule(name, rule, grammar) {
    var rules = grammar.rules,
        ruleIndex = grammar.ruleIndex,
        lexIndex = grammar.lexIndex,
        ruleNames = grammar.ruleNames,
        ruleNameRe = RULE_NAME_RE,
        map = grammar.map,
        pendingTerminals = grammar.pendingTerminals,
        registerTerminal = registerToken,
        isString = libcore.string,
        isRegex = libcore.regex;
    var l, item, lexemes, token, created,
        prefix, suffix, from, to, current, lexemeId;
    
    if (isString(rule) || isRegex(rule)) {
        rule = [rule];
    }
    
    if (!libcore.array(rule)) {
        throw new Error("Invalid grammar rule found in " + name);
    }
    
    from = to = null;
    lexemes = [];
    
    for (l = rule.length; l--;) {
        item = rule[l];

        if (isRegex(item)) {
            token = registerTerminal(grammar, item);
            item = token[0];

        }
        else if (!isString(item)) {
            throw new Error("Invalid token in grammar rule " + item);
        }
        // terminal
        else if (!ruleNameRe.test(item)) {

            item = map.generateSymbol(item);

            if (pendingTerminals.indexOf(item) === -1) {
                pendingTerminals[pendingTerminals.length] = item;
            }

        }
        else {
            item = map.generateSymbol(item);
        }
        
        lexemes[l] = item;
        lexemeId = 'r' + (++grammar.rgenId);
        lexIndex[lexemeId] = item;
        created = [lexemeId, item, from];
        
        if (!from) {
            to = created;
        }
        from = created;

    }
    
    suffix = ' -> ' + lexemes.join(',');
    prefix = name + ':';
    token = name + suffix;
    
    if (token in ruleIndex) {
        throw new Error("Grammar rule is already defined " + name + suffix);
    }
    else {
        ruleIndex[token] = true;
    }
    
    if (!(name in rules)) {
        rules[name] = null;
        ruleNames[ruleNames.length] = name;
    }
    
    // append
    from = [false, null, from];
    current = rules[name];
    
    if (current) {
        to[2] = current;
    }
    
    rules[name] = from;
    
    return [from[2][0], to[0]];
}


function build(root, stateMap, tokenizer, definitions, exclude) {
    var isString = libcore.string,
        isArray = libcore.array,
        isRegex = libcore.regex,
        registerRule = defineRule,
        registerTerminal = defineTerminal,
        defineToken = registerToken,
        rules = {},
        ruleNameRe = RULE_NAME_RE,
        ruleNames = [],
        grammarRoot = "$" + root,
        name = null,
        tokens = [],
        pendingTerminals = [],
        isTerminalName = false;
    var c, l, dc, dl, definition, pl,
        grammar, groups, group, index, terminal;

    stateMap.reset();
    
    stateMap.root = stateMap.generateSymbol(grammarRoot);

    grammar = {
        root: grammarRoot,
        rgenId: 0,
        map: stateMap,
        ruleNames: ruleNames = [],
        rules: rules,
        terminal: terminal = {},
        tokens: tokens,
        tokenAlias: {},
        pendingTerminals: pendingTerminals,
        lexIndex: index = {},
        ruleIndex: {},
        ruleGroup: groups = {}
    };
    
    // augment root
    definitions.splice(definitions.length,
                       0,
                       stateMap.lookupSymbol(stateMap.augmentedRoot),
                        [[ root,
                            stateMap.lookupSymbol(stateMap.endSymbol)]]);

    for (c = -1, l = definitions.length; l--;) {
        
        definition = definitions[++c];
        
        if (isString(definition)) {

            isTerminalName = !ruleNameRe.test(definition);
            name = stateMap.generateSymbol(definition);
        
        }
        else if (isArray(definition)) {
            
            // do not accept grammar rule if it doesn't have name
            if (!name) {
                throw new Error("Invalid grammar rules parameter.");
            }
            
            dc = -1;
            dl = definition.length;
            
            for (; dl--;) {

                if (isTerminalName) {
                    registerTerminal(name,
                                    definition[++dc],
                                    grammar);
                }
                else {
                    group = registerRule(name,
                                        definition[++dc],
                                        grammar,
                                        tokenizer);
                    // register group
                    groups[group[1]] = name + ':' + (dc + 1);
                }
            }

        }
        else {
            throw new Error("Invalid item in definitions parameter.");
        }
        
    }
    
    // add excludes
    if (exclude) {
        exclude = exclude.slice(0);
        pl = pendingTerminals.length;
        
        for (l = exclude.length; l--;) {
            definition = exclude[l];

            if (isString(definition)) {
                name = stateMap.generateSymbol(definition);

                if (pendingTerminals.indexOf(name) === -1) {
                    pendingTerminals[pl++] = name;
                }
                
            }
            else if (isRegex(definition)) {
                definition = defineToken(grammar, definition, null, true);
                name = definition[0];
            }
            else {
                throw new Error("Invalid exclude token parameter.");
            }

            // rename!
            exclude[l] = name;
        }
        
    }

    // resolve pending terminals
    pl = pendingTerminals.length;
    for (; pl--;) {
        name = pendingTerminals[pl];

        if (!(name in terminal)) {
            throw new Error("Terminal is not defined ",
                            stateMap.lookupSymbol(name));
        }
    }
    pendingTerminals.length = 0;

    // register
    if (tokens.length) {
        tokenizer.define(tokens);
    }

    
    if (!libcore.contains(rules, stateMap.generateSymbol(root))) {
        throw new Error("Invalid root grammar rule parameter.");
    }
    
    return define$1(grammar, stateMap, exclude) &&
            stateMap.finalize();

}

var TYPE = {
        terminal: 1,
        nonterminal: 2,
        compound: 3,
        end: 4
    };
    
    

function Lexeme(type) {
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
    
    useType: function (type) {
        var types = TYPE;
        this.type = libcore.contains(types, type) ?
                        types[type] : types.token;
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
        created.rule = reduce[2];
        last = null;
        
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
                created.rule = map.root;
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

function Parser(root, definition, exclude) {
    
    this.tokenizer = new Tokenizer();
    this.map = new StateMap();
    
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
	Parser: Parser,
	define: define,
	load: load,
	isParser: isParser,
	Iterator: BaseIterator,
	registerIterator: register
});

exports['default'] = moduleApi$1;
exports.Parser = Parser;
exports.define = define;
exports.load = load;
exports.isParser = isParser;
exports.Iterator = BaseIterator;
exports.registerIterator = register;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=libcore-parser-lalr.js.map
