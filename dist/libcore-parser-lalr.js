(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('libcore'), require('libcore-tokenizer')) :
	typeof define === 'function' && define.amd ? define(['exports', 'libcore', 'libcore-tokenizer'], factory) :
	(factory((global['libcore-parser-lalr'] = {}),global.libcore,global['libcore-tokenizer']));
}(this, (function (exports,libcore,Tokenizer) { 'use strict';

Tokenizer = Tokenizer && Tokenizer.hasOwnProperty('default') ? Tokenizer['default'] : Tokenizer;

function StateMap() {
    this.reset();
}


StateMap.prototype = {
    stateGen: 0,
    
    constructor: StateMap,
    
    generateState: function () {
        var id = 's' + (++this.stateGen);
        this.states[id] = {};
        return id;
    },
    
    setAnchorState: function (state) {
        var anchors = this.anchors;
        
        if (!(state in anchors)) {
            this.anchors[state] = true;
        }
    },
    
    setReduceState: function (state, name, params, ruleIndex) {
        var ends = this.ends;
        var current;
        
        if (state in ends) {
            current = ends[state];
            if (current[0] !== name || current[1] !== params) {
                throw new Error("Reduce conflict found " +
                                current[0] + ' ! <- ' + name);
            }
        }
        else {
            ends[state] = [name, params, ruleIndex];
        }
        
    },
    
    reset: function () {
        var start = '$start',
            states = {};
        
        states[start] = {};
        this.root = '$end';
        this.start = start;
        this.states = states;
        this.anchors = {};
        this.ends = {};
        this.exclude = {};
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
        var start, states, anchors, ends, root, exclude;
        
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

        exclude = definition.exclude;
        if (!isObject(exclude)) {
            throw new Error('Invalid "exclude" token in definition parameter.');
        }
        
        this.root = root;
        this.start = start;
        this.states = states;
        this.anchors = anchors;
        this.ends = ends;
        this.exclude = exclude;
        
        return true;
    },
    
    toObject: function () {
        return {
                root: this.root,
                start: this.start,
                states: this.states,
                anchors: this.anchors,
                ends: this.ends,
                exclude: this.exclude
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

function StateObject(map, id) {
    this.id = id;
    this.map = map;
    this.pointer = {};
    this.lexemes = [];
}

StateObject.prototype = {
    constructor: StateObject,
    id: null,
    pointer: null,
    parent: null,
    rid: null,
    lexemes: null,
    
    clone: function (rid) {
        var dupe = clone(this);
        if (rid) {
            dupe.rid = rid;
        }
        dupe.parent = this;

        return dupe;
    },
    
    point: function (lexeme) {
        var pointer = this.pointer,
            lexemes = this.lexemes,
            map = this.map;
        var vstate, state;
        
        if (!(lexeme in pointer)) {
            state = this.map.generateState();
            vstate = this.clone();
            vstate.id = state;
            vstate.pointer = {};
            vstate.lexemes = [];
            
            lexemes[lexemes.length] = lexeme;
            
            pointer[lexeme] = vstate;
            //console.log(this.id, ':', lexeme, '-> ', state);
            map.states[this.id][lexeme] = state;
        }
        
        return pointer[lexeme];
        
    },
    
    reduce: function (rule, params, ruleIndex) {
        this.map.setReduceState(this.id, rule, params, ruleIndex);
    }
};

function define$2(grammar, map, exclude) {
    
    var SO = StateObject,
        ruleIndex = grammar.rules,
        ruleGroup = grammar.ruleGroup,
        vstate = new SO(map, map.start),
        rootName = "$end",
        pending = [[vstate, rootName]],
        l = 1;
    var item, production, rule, lexeme, anchorState, ruleId, params,
        recurse, ident, next;
        
    map.reset();
    
    map.root = grammar.root;
    
    if (exclude) {
        map.setExcludes(exclude);
    }

    //var limit = 1000;
    
    for (; l--;) {

        // if (!--limit) {
        //     //console.log("limit reached!!!! ", l);
        //     break;
        // }

        item = pending.splice(0, 1)[0];
        anchorState = item[0];
        production = item[1];
        
        // iterate rules
        rule = ruleIndex[production];


        for (; rule; rule = next) {
            ruleId = rule[0];
            next = rule[2];
            
            // reset
            if (ruleId === false) {
                params = 0;
                vstate = anchorState;
                
            }
            // run rule
            else {
                lexeme = rule[1];
                params++;
                
                // for non-terminal
                if (lexeme in ruleIndex) {

                    ident = production + ':' + ruleId;

                    

                    //console.log("ident ", ident, "lexeme ", lexeme, " = ", ruleIndex[lexeme]);
                    
                    // ident = vstate.rid;
                    // ident = ident ?
                    //             ident + '-' + ruleId : ruleId;

                    // // recurse
                    if (!(ident in vstate)) {
                        
                        recurse = vstate.clone();
                        recurse[ident] = recurse;
                        pending[l++] = [recurse, lexeme];
                        
                    }
                    
                }
                
                // only if not skipped
                vstate = vstate.point(lexeme);
                
                // set reduce state
                if (!next || next[0] === false) {
                    vstate.reduce(production, params, ruleGroup[ruleId]);
                }
                
            }
            
        }

        
    }
    
    return true;
}

var RULE_NAME_RE = /^([A-Z][a-zA-Z]+(\_?[a-zA-Z0-9])*|\$end|\$)$/;

function define$1(name, rule, grammar, tokenizer) {
    var rules = grammar.rules,
        ruleIndex = grammar.ruleIndex,
        terminal = grammar.terminal,
        lexIndex = grammar.lexIndex,
        ruleNames = grammar.ruleNames,
        ruleNameRe = RULE_NAME_RE,
        isString = libcore.string,
        isRegex = libcore.regex;
    var l, item, lexemes, token, tokenId, created,
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
            token = item.source;
            tokenId = '/' + item.source + '/';
            
            // register token
            if (!(tokenId in terminal)) {
                tokenizer.define([ tokenId, item ]);
                terminal[tokenId] = tokenId;
            }
            
            item = tokenId;
        }
        else if (!isString(item)) {
            throw new Error("Invalid token in grammar rule " + item);
        }
        else if (!ruleNameRe.test(item)) {
            throw new Error("Invalid grammar rule name format: " + item);
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
    tokenId = name + suffix;
    
    if (tokenId in ruleIndex) {
        throw new Error("Grammar rule is already defined " + name + suffix);
    }
    else {
        ruleIndex[tokenId] = true;
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
        defineRule = define$1,
        ruleNameRe = RULE_NAME_RE,
        ruleNames = [];
    var c, l, dc, dl, name, definition,
        rules, grammar, groups, group, index, terminal;
        
    name = null;
    rules = {};
    grammar = {
        root: '$' + root,
        rgenId: 0,
        ruleNames: ruleNames = [],
        rules: rules,
        terminal: terminal = {},
        lexIndex: index = {},
        ruleIndex: {},
        ruleGroup: groups = {}
    };
    
    // augment root
    definitions.splice(definitions.length,
                       0,
                       "$end", [
                            [ root, "$" ]
                        ]);

    for (c = -1, l = definitions.length; l--;) {
        
        definition = definitions[++c];
        
        if (isString(definition)) {
            
            if (!ruleNameRe.test(definition)) {
                throw new Error("Invalid grammar rule name " + definition);
            }
            name = definition;
        
        }
        else if (isArray(definition)) {
            
            // do not accept grammar rule if it doesn't have name
            if (!name) {
                throw new Error("Invalid grammar rules parameter.");
            }
            
            dc = -1;
            dl = definition.length;
            
            for (; dl--;) {
                group = defineRule(name,
                                   definition[++dc],
                                   grammar,
                                   tokenizer);
                // register group
                groups[group[1]] = name + (dc + 1);
            }

        }
        else {
            throw new Error("Invalid item in definitions parameter.");
        }
        
    }
    
    // add excludes
    if (exclude) {
        exclude = exclude.slice(0);
        
        for (l = exclude.length; l--;) {
            definition = exclude[l];
            
            if (!isRegex(definition)) {
                throw new Error("Invalid exclude token parameter.");
            }
            
            name = '/' + definition.source + '/';
            if (!(name in terminal)) {
                tokenizer.define([ name, definition ]);
                terminal[name] = name;
                exclude[l] = name;
            }
            else {
                exclude.splice(l, 1);
            }
            
        }
        
    }
    
    if (!libcore.contains(rules, root)) {
        throw new Error("Invalid root grammar rule parameter.");
    }
    
    return define$2(grammar, stateMap, exclude);

}

var TYPE = {
        terminal: 1,
        nonterminal: 2,
        compound: 3
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
                                              me.subject);
            
        var name, to, ref, lexeme;
        
        
        if (token) {
            name = token[0];
            to = token[2];
            
            // tokenize again
            if (!this.isAcceptableToken(token)) {
                me.params = to;
                return 1;
            }
            
            lexeme = new Lexeme('terminal');
            lexeme.name = name;
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
            states = me.parser.map.states,
            state = me.pstate,
            name = lexeme.name;
        
        buffer[buffer.length] = [state, lexeme];
        
        me.pstate = states[state][name];
        me.current = lexeme;
        me.params = null;
        
        // do not return "$" token
        me.returns = name !== "$";
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
            state = me.pstate,
            reduce = ends[state],
            name = reduce[0],
            params = reduce[1],
            l = params,
            endIndex = l - 1,
            created = new Lexeme('nonterminal'),
            values = [];
            
        var litem, item, from, to, ref, last;
        
        created.name = name;
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
        if (name === '$end') {
            
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
