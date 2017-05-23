(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("libcore"), require("libcore-tokenizer"));
	else if(typeof define === 'function' && define.amd)
		define("libcore-parser-lalr", ["libcore", "libcore-tokenizer"], factory);
	else if(typeof exports === 'object')
		exports["libcore-parser-lalr"] = factory(require("libcore"), require("libcore-tokenizer"));
	else
		root["libcore-parser-lalr"] = factory(root["libcore"], root["libcoreTokenizer"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_10__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/assets/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var libcore = __webpack_require__(0),
    BaseIterator = __webpack_require__(4),
    defaultIteratorName = "base",
    ITERATORS = {};

function register(name, Class) {
    var lib = libcore,
        Base = BaseIterator;
    
    if (!lib.string(name)) {
        throw new Error("Invalid iterator name parameter.");
    }
    
    if (!lib.method(Class) ||
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

module.exports = {
    defaultIterator: defaultIteratorName,
    Base: BaseIterator,
    register: register,
    get: get
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";



var libcore = __webpack_require__(0),
    Parser = __webpack_require__(5),
    iteratorManager = __webpack_require__(1);
    
function define(root, definitions, exclusions) {
    return new Parser(root, definitions, exclusions);
}

function load(json) {
    var lib = libcore;
    var parser;
    
    if (lib.string(json)) {
        try {
            json = JSON.parse(json);
        }
        catch (e) {
            throw new Error(
                "Unable to load from invalid json JSON String parameter: " +
                e.toString());
        }
    }
    else if (!lib.object(json)) {
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



module.exports = {
    Parser: Parser,
    Iterator: iteratorManager.Base,
    isParser: isParser,
    define: define,
    load: load,
    registerIterator: iteratorManager.register
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function empty() {
}

function clone(obj) {
    var E = empty;
    E.prototype = obj;
    return new E();
}

module.exports = {
    clone: clone
};

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var libcore = __webpack_require__(0);

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
                                        to);
            
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
                                               to);
        
        // only if it ended
        if (name === '$end') {
            
            if (bl === 0) {
                created.params = 1;
                created.children = [created.children[0]];
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
    
    createLexeme: function (name, value, morphemes, params, from, to) {
        return {
                name: name,
                params: params,
                value: value,
                children: morphemes,
                from: from,
                to: to
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


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var libcore = __webpack_require__(0),
    Tokenizer = __webpack_require__(10),
    StateMap = __webpack_require__(8),
    builder = __webpack_require__(6),
    iteratorManager = __webpack_require__(1);

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
        var mgr = iteratorManager;
        var Iterator;
        
        if (arguments.length) {
            Iterator = mgr.get(name);
            if (!Iterator) {
                throw new Error("Invalid iterator name parameter.");
            }
        }
        else {
            Iterator = mgr.get(mgr.defaultIterator);
        }
        
        return new Iterator(this);
    },
    
    define: function (root, definition, exclude) {
        var lib = libcore,
            array = lib.array;
        var ready;
        
        if (!array(exclude)) {
            exclude = [];
        }
        
        if (!lib.string(root)) {
            throw new Error("Invalid root grammar rule parameter.");
        }
        
        if (!array(definition)) {
            throw new Error("Invalid grammar rules definition parameter");
        }
        
        
        this.ready = ready = builder(root,
                                    this.map,
                                    this.tokenizer,
                                    definition,
                                    exclude);
        
        return ready;

    },
    
    fromJSON: function (json) {
        var lib = libcore,
            object = lib.object;
        var tokenMap;
        
        if (lib.string(json)) {
            try {
                json = JSON.parse(json);
            }
            catch (e) {
                throw new Error("Invalid JSON String json parameter.");
            }
        }
        
        if (!object(json)) {
            throw new Error("Invalid Object json parameter.");
        }
        
        tokenMap = json.tokens;
        
        if (!object(tokenMap)) {
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
        var object;
        
        if (!this.ready) {
            throw new Error("Grammar rules is not yet defined.");
        }
        
        object = this.map.toObject();
        object.tokens = this.tokenizer.toObject();
        
        return object;
    },
    
    parse: function (subject, reducer, iterator) {
        var lib = libcore,
            string = lib.string,
            rpn = [],
            rl = 0;
        var lexeme, name, value;
        
        if (!string(subject)) {
            throw new Error("Invalid string subject parameter");
        }
        
        iterator = lib.string(iterator) ?
                        this.iterator(iterator) :
                        this.iterator();
        
        if (!iterator) {
            throw new Error("Invalid Iterator parameter.");
        }
        
        if (!lib.object(reducer)) {
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


module.exports = Parser;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var libcore = __webpack_require__(0),
    defineStates = __webpack_require__(7),
    RULE_NAME_RE = /^([A-Z][a-zA-Z]+(\_?[a-zA-Z0-9])*|\$end|\$)$/;

function define(name, rule, grammar, tokenizer) {
    var rules = grammar.rules,
        ruleIndex = grammar.ruleIndex,
        terminal = grammar.terminal,
        lexIndex = grammar.lexIndex,
        ruleNames = grammar.ruleNames,
        ruleNameRe = RULE_NAME_RE,
        lib = libcore,
        string = lib.string,
        regex = lib.regex;
    var l, item, lexemes, token, tokenId, created,
        prefix, suffix, from, to, current, lexemeId;
    
    if (string(rule) || regex(rule)) {
        rule = [rule];
    }
    
    if (!lib.array(rule)) {
        throw new Error("Invalid grammar rule found in " + name);
    }
    
    from = to = null;
    lexemes = [];
    
    
    for (l = rule.length; l--;) {
        item = rule[l];
        
        if (regex(item)) {
            token = item.source;
            tokenId = '/' + item.source + '/';
            
            // register token
            if (!(tokenId in terminal)) {
                tokenizer.define([ tokenId, item ]);
                terminal[tokenId] = tokenId;
            }
            
            item = tokenId;
        }
        else if (!string(item)) {
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

}


function build(root, stateMap, tokenizer, definitions, exclude) {
    var lib = libcore,
        string = lib.string,
        array = lib.array,
        defineRule = define,
        ruleNameRe = RULE_NAME_RE,
        ruleNames = [];
    var c, l, dc, dl, name, definition, rules, grammar, index, regex, terminal;
        
    name = null;
    rules = {};
    grammar = {
        rgenId: 0,
        ruleNames: ruleNames = [],
        rules: rules,
        terminal: terminal = {},
        lexIndex: index = {},
        ruleIndex: {}
    };
    
    // augment root
    definitions.splice(definitions.length,
                       0,
                       "$end", [
                            [ root, "$" ]
                        ]);
    
    for (c = -1, l = definitions.length; l--;) {
        
        definition = definitions[++c];
        
        if (string(definition)) {
            
            if (!ruleNameRe.test(definition)) {
                throw new Error("Invalid grammar rule name " + definition);
            }
            name = definition;
        
        }
        else if (array(definition)) {
            
            // do not accept grammar rule if it doesn't have name
            if (!name) {
                throw new Error("Invalid grammar rules parameter.");
            }
            
            dc = -1;
            dl = definition.length;
            
            for (; dl--;) {
                defineRule(name, definition[++dc], grammar, tokenizer);
            }

        }
        else {
            throw new Error("Invalid item in definitions parameter.");
        }
        
    }
    
    // add excludes
    if (exclude) {
        exclude = exclude.slice(0);
        regex = lib.regex;
        
        for (l = exclude.length; l--;) {
            definition = exclude[l];
            
            if (!regex(definition)) {
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
    
    if (!lib.contains(rules, root)) {
        throw new Error("Invalid root grammar rule parameter.");
    }

    return defineStates(grammar, stateMap, exclude);

}


module.exports = build;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var StateObject = __webpack_require__(9);

function define(grammar, map, exclude) {
    
    var SO = StateObject,
        ruleIndex = grammar.rules,
        vstate = new SO(map, map.start),
        rootName = "$end",
        pending = [[ vstate, rootName]],
        l = 1;
    var item, production, rule, lexeme, anchorState, ruleId, params,
        recurse, ident, next;
        
    map.reset();
    if (exclude) {
        map.setExcludes(exclude);
    }
    
    for (; l--;) {
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
                    
                    ident = vstate.rid;
                    ident = ident ?
                                ident + '-' + ruleId : ruleId;
                    
                    // recurse
                    if (!(ident in vstate)) {
                        
                        recurse = vstate.clone(ruleId);
                        recurse[ident] = recurse;
                        pending[l++] = [recurse, lexeme];
                        
                    }
                    
                }
                
                // only if not skipped
                vstate = vstate.point(lexeme);
                
                // set reduce state
                if (!next || next[0] === false) {
                    vstate.reduce(production, params);
                }
                
            }
            
        }

        
    }
    
    return true;
}


module.exports = define;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var libcore = __webpack_require__(0);


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
    
    setReduceState: function (state, name, params) {
        var ends = this.ends;
        var current;
        
        if (state in ends) {
            current = ends[state];
            if (current[0] !== name || current[1] !== params) {
                console.log(this);
                throw new Error("Reduce conflict found " +
                                current[0] + ' ! <- ' + name);
            }
        }
        else {
            ends[state] = [name, params];
        }
        
    },
    
    reset: function () {
        var start = '$start',
            states = {};
        
        states[start] = {};
        
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
        var lib = libcore,
            object = lib.object;
        var start, states, anchors, ends;
        
        if (!object(definition)) {
            throw new Error("Invalid Object definition parameter.");
        }
        
        states = definition.states;
        if (!object(states)) {
            throw new Error(
                        'Invalid "states" Object in definition parameter.');
        }
        
        start = definition.start;
        if (!lib.string(start) || !(start in states)) {
            throw new Error(
                        'Invalid "start" state in definition parameter.');
        }
        
        anchors = definition.anchors;
        if (!object(anchors)) {
            throw new Error('Invalid "anchors" states in definition parameter.');
        }
        
        ends = definition.ends;
        if (!object(anchors)) {
            throw new Error('Invalid "ends" states in definition parameter.');
        }
        
        this.start = start;
        this.states = states;
        this.anchors = anchors;
        this.ends = ends;
        
        return true;
    },
    
    toObject: function () {
        return {
                start: this.start,
                states: this.states,
                anchors: this.anchors,
                ends: this.ends
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


module.exports = StateMap;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var helper = __webpack_require__(3);

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
        var dupe = helper.clone(this);
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
    
    reduce: function (rule, params) {
        this.map.setReduceState(this.id, rule, params);
    }
};


module.exports = StateObject;

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_10__;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(2);


/***/ })
/******/ ]);
});