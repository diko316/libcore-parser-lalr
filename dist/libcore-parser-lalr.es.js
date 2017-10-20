import { array, contains, method, number, object, regex, string } from 'libcore';
import Tokenizer from 'libcore-tokenizer';

function StateMap(debug) {
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
    this.ends = {};
    this.exclude = {};
    this.finalized = false;
    this.rawStates = [];

    this.reduceLookup = {};
    this.reducers = {};
    this.debugMode = debug === true;

    this.augmentedRoot = this.generateSymbol(end);
    this.endSymbol = this.generateSymbol(tokenEnd);
    this.endToken = tokenEnd;

}


StateMap.prototype = {
    stateGen: 0,
    rawStates: null,
    debugMode: false,
    
    constructor: StateMap,

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
                's' + (++this.symbolGen).toString(16);
        //id = name;
    
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
                '<' + (++this.reduceGen).toString(16);

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
        
        if (array(exclude)) {
            for (c = -1, l = exclude.length; l--;) {
                current[exclude[++c]] = true;
            }
        }
    },
    
    importStates: function (definition) {
        var isObject = object,
            isString = string;
        var start, states, ends, root, exclude, symbol, reducers,
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
        if (!array(list)) {
            throw new Error('Invalid "exclude" token in definition parameter.');
        }

        exclude = {};
        for (c = -1, l = list.length; l--;) {
            exclude[list[++c]] = true;
        }
        
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
        var has = contains,
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

var LEXEME_RE = /^([A-Z][a-zA-Z]+(\_?[a-zA-Z0-9])*|\$end|\$)$/;

function isTerminal(name) {
        return name === "$" || !LEXEME_RE.test(name);
    }

function defineTerminals(registry, name, definitions) {
        var isRegex = regex;
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
        var isString = string,
            isRegex = regex,
            isArray = array,
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

function State(registry, id) {
    var list = registry.vstates;

    id = id || 's' + (++registry.vstateIdGen);
    
    registry.vstateLookup[id] = 
        list[list.length] = this;
    
    this.id = id;
    this.registry = registry;
    this.tags = {};
    this.tagNames = [];
    this.pointer = new List();
    this.rparent = null;
    this.recursedAs = {};
    
}

State.prototype = {
    pointer: null,
    registry: null,
    constructor: State,

    tag: function (id) {
        var list = this.tags,
            names = this.tagNames;

        if (!(id in list)) {
            list[id] = true;
            names[names.length] = id;
        }

        return this;
    },

    hasTag: function (id) {
        return id in this.tags;
    },

    setRecursed: function (production) {
        var access = ':' + production,
            list = this.recursedAs;

        if (!(access in list)) {
            list[access] = true;
        }

        return this;
    },

    isRecursed: function (production) {
        var access = ':' + production,
            list = this.recursedAs;

        return access in list;
    },

    findRecursion: function (id) {
        var me = this,
            parent = me.rparent;

        for (; parent; parent = parent.rparent) {
            if (parent.hasTag(id)) {
                return parent;
            }
        }
        return null;
    },

    pointed: function (token) {
        var pointer = this.pointer.first;
        var item;

        for (; pointer; pointer = pointer[0]) {
            item = pointer[1];
            if (item[1] === token) {
                return item[0];
            }
        }
        
        return null;
    },

    pointTo: function (token, state) {
        this.pointer.push([state, token]);
        return state;
    },

    point: function (token, recurseState) {
        var pointed = this.pointed(token);
        var newState;

        // create
        if (!pointed) {
            newState = new State(this.registry);
            newState.rparent = recurseState;

            return this.pointTo(token, newState);

        }

        return pointed;
    }
};

function define$1(registry) {

    var map = registry.map,
        StateClass = State,
        STATE_END = 0,
        STATE_START = 1,
        STATE_RUN_RULES = 2,
        STATE_START_RULE = 3,
        STATE_DEFINE_LEXEME = 4,
        STATE_DEFINE_ENDER = 5,
        STATE_END_RULES = 6,
        Queue = List,
        defineState = STATE_START,
        start = new StateClass(registry, map.start),
        queue = new Queue('queue'),
        pending = new Queue('pending'),
        processed = {},
        iterations = 0;

    var item, rules, rule, rindex, rlen, lexemes, tokens,
        id, token, lindex, llen,
        state, production, recursion, enqueue,
        ruleState, tagged,
        pointed, target,
        pid,
        states, pointer, c, l;

    //var limit = 1000;

    queue.push([start, map.augmentedRoot]);

    for (; defineState;) {
        iterations++;
        // if (!--limit) {
        //     break;
        // }

        switch (defineState) {
        case STATE_START:
            item = queue.shift();

            production = item[1];
            ruleState = item[0];

            // go to next
            if (ruleState.isRecursed(production)) {
                defineState = STATE_END_RULES;
                break;
            }

            ruleState.setRecursed(production);
            rules = registry.getRules(production);
            if (!rules) {
                throw new Error("Production is not defined: " +
                                map.lookupSymbol(production));
            }
            lexemes = rules[1];
            rules = rules[0];
            rindex = -1;
            rlen = rules.length;
            defineState = STATE_RUN_RULES;
            

        /* falls through */
        case STATE_RUN_RULES:
            if (!(rlen--)) {
                defineState = STATE_END_RULES;
                break;
            }

            rule = rules[++rindex];
            tokens = lexemes[rindex];
            defineState = STATE_START_RULE;
            

        /* falls through */
        case STATE_START_RULE:
            lindex = -1;
            llen = tokens.length;

            id = rule[0];
            token = tokens[0];
            state = ruleState;

            if (state.hasTag(id)) {
                defineState = STATE_RUN_RULES;
                break;
            }
            
            target = state.findRecursion(id, token);
            if (target) {
                pointed = target.pointed(token);
                if (pointed && !state.pointed(token)) {
                    state.pointTo(token, pointed);
                }
            }

            defineState = STATE_DEFINE_LEXEME;

        /* falls through */
        case STATE_DEFINE_LEXEME:

            id = rule[++lindex];
            tagged = state.hasTag(id);
            

            // dont redefine, go to next rule
            if (!(llen--) || tagged) {
                defineState = tagged ?
                                STATE_RUN_RULES : STATE_DEFINE_ENDER;
                break;
            }

            //console.log("define id! ", id);

            token = tokens[lindex];

            // recursion
            recursion = registry.isRecursed(id);
            pid = state.id + ':' + recursion;

            // dont send to pending if already processed
            if (recursion && !(pid in processed)) {
                processed[pid] = true; 
                (state === ruleState ?
                    queue : pending).push([state, recursion]);
            }

            state.tag(id);
            state = state.pointed(token) || state.point(token, ruleState);

            break;

        /* falls through */
        case STATE_DEFINE_ENDER:
            id = rule[lindex];
            state.tag(id);
            registry.setEnd(state.id, production, lindex, id);
            defineState = STATE_RUN_RULES;
            break;
        
        case STATE_END_RULES:
            enqueue = queue.last;

            if (!enqueue && pending.last) {
                queue.push(enqueue = pending.shift());
            }

            defineState = enqueue ? STATE_START : STATE_END;
            // if (!enqueue) {
            //     console.log("ended! iterations: ", 1000 - limit);
            // }
        }
        
    }

    if (map.debugMode) {
        console.log("define iterations: ", iterations);
        console.log("generated states: ", registry.vstates.length);
    }
    //console.log("iterations: ", 1000 - limit);

    // generate state map
    states = registry.vstates;
    
    for (c = - 1, l = states.length; l--;) {
        state = states[++c];
        id = state.id;
        pointer = state.pointer.first;
        map.createState(id);

        // apply pointer
        for (; pointer; pointer = pointer[0]) {
            item = pointer[1];
            map.createPointer(id, item[1], item[0].id);
        }

        // set end
        item = registry.isEnd(id);
        if (item) {
            map.setReduceState(id, item[0], item[1], item[2]);
        }
    }

    

    
    // generate report
    // var states = registry.vstates,
    //     ends = registry.ends;
    // var c, l, state, pointer, end;

    // for (c = -1, l = states.length; l--;) {
    //     state = states[++c];
    //     pointer = state.pointer.first;
    //     if (!pointer) {
    //         console.log('no transitions in ', state.id);
    //     }
    //     for (;pointer; pointer = pointer[0]) {
    //         item = pointer[1];
    //         target = item[0];
    //         end = target.id in ends ?
    //                 ' end: ' + ends[target.id].join(',') : '';

    //         console.log(state.id, ':', item[1], '->', target.id, end);
    //     }
    // }
    // console.log(registry.vstates);
    // console.log(queue, pending);
    
}

function Registry(map, tokenizer) {
    this.tokenizer = tokenizer;
    this.map = map;

    this.productions = {};
    this.lexemes = {};

    this.stateIndex = {};
    this.vstateIdGen = 0;
    this.vstateLookup = {};
    this.vstates = [];
    this.ends = {};


    this.recursions = {};
    
    this.terminals = [];
    this.terminalLookup = {};

    this.symbolGen = 0;
    this.symbol = {};
    this.lookup = {};

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
                't' + (++this.stateTagIdGen).toString(16);

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
                '>' + (++this.symbolGen).toString(16);
    
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

        return string(terminal) ?
                    contains(lookup, terminal) :
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
            else if (!contains(lookup, name)) {
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

        var states = this.stateIndex,
            recursions = this.recursions,
            productions = this.productions,
            lexemes = this.lexemes,
            rules = [],
            rl = 0,
            c = -1,
            total = mask.length,
            l = total + 1;
        var items, id, lexeme, list, index;

        if (!(name in productions)) {
            productions[name] = [];
            lexemes[name] = [];
        }

        list = productions[name];
        index = list.length;
        list[index] = rules;
        lexemes[name][index] = mask;
        
        //console.log("------------------------------- Rules for: " + name);

        for (; l--;) {
            lexeme = mask[++c];

            items = mask.slice(0);
            items.splice(c, 0, '.');
            id = this$1.hashState(name + ' -> ' + items.join(' '));

            if (id in states) {
                throw new Error("Duplicate Grammar Rule found " +
                            this$1.lookupState(id) + " in production: " +
                            this$1.map.lookupSymbol(name));
            }

            rules[rl++] = id;

            states[id] = id;

            // non-terminal
            if (l && !(c in terminals)) {
                //console.log("recusion? ", id, " is ", lexeme);
                recursions[id] = lexeme;
            }

        }

    },

    getRules: function (production) {
        var list = this.productions;

        return production in list ?
                    [list[production], this.lexemes[production]] : null;
    },

    isRecursed: function (id) {
        var recursions = this.recursions;
        return id in recursions && recursions[id];
    },

    setEnd: function (id, production, params, ruleId) {
        var ends = this.ends,
            map = this.map,
            state = this.vstateLookup[id];

        if (!(id in ends)) {
            ends[id] = [production, params, ruleId];
        }
        else if (ends[id][0] !== production) {
            throw new Error("Reduce conflict! " + state.id +
                                ":" + map.lookupSymbol(ends[id][0]) + ' <- ' +
                                map.lookupSymbol(production));
        }
        
    },

    isEnd: function (id) {
        var ends = this.ends;
        return id in ends && ends[id];
    }
};

function build(root, map, tokenizer, definitions, exclude) {
    var isString = string,
        isArray = array,
        isRegex = regex,
        
        isTerm = isTerminal,
        defTerminal = defineTerminals,
        defRule = defineRules,
        name = null,
        original = name,
        
        terminalDefinition = true;

    var c, l, definition, registry, excludes;


    map.reset();
    
    map.root = map.generateSymbol("$" + root);

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
        this.type = type = contains(types, type) ?
                                types[type] : types.token;
        if (type === TYPE.terminal) {
            this.terminal = true;
        }
    }
};

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
        created.rule = lookup[reduce[2]];
        last = null;
        
        //console.log("reduce count? ", params, " from ", reduce);
        
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
        //console.log('shift? ', name, 'lexeme', lexeme, ' in ', ref);
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
        
        if (!string(name)) {
            throw new Error("Invalid iterator name parameter.");
        }
        
        if (!method(Class) ||
            (Class !== Base && !(Class.prototype instanceof Base))) {
            throw new Error("Invalid iterator Class parameter.");
        }
        
        ITERATORS[':' + name] = Class;
        
        return true;
    }

function get(name) {
        var list = ITERATORS;
        
        if (string(name)) {
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
        var isArray = array;
        var ready;
        
        if (!isArray(exclude)) {
            exclude = [];
        }
        
        if (!string(root)) {
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
        var isObject = object;
        var tokenMap;
        
        if (string(json)) {
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
        var isString = string,
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
        
        if (!object(reducer)) {
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
        
        if (string(json)) {
            try {
                json = JSON.parse(json);
            }
            catch (e) {
                throw new Error(
                    "Unable to load from invalid json JSON String parameter: " +
                    e.toString());
            }
        }
        else if (!object(json)) {
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

export { debug, Parser, define, load, isParser, BaseIterator as Iterator, register as registerIterator };
export default moduleApi$1;
//# sourceMappingURL=libcore-parser-lalr.es.js.map
