'use strict';

import {
            string,
            regex,
            array,
            contains
            
        } from "libcore";
        
import defineStates from "./define.js";
        
var RULE_NAME_RE = /^([A-Z][a-zA-Z]+(\_?[a-zA-Z0-9])*|\$end|\$)$/;

function define(name, rule, grammar, tokenizer) {
    var rules = grammar.rules,
        ruleIndex = grammar.ruleIndex,
        terminal = grammar.terminal,
        lexIndex = grammar.lexIndex,
        ruleNames = grammar.ruleNames,
        ruleNameRe = RULE_NAME_RE,
        map = grammar.map,
        isString = string,
        isRegex = regex;
    var l, item, lexemes, token, tokenId, created,
        prefix, suffix, from, to, current, lexemeId;

    
    
    if (isString(rule) || isRegex(rule)) {
        rule = [rule];
    }
    
    if (!array(rule)) {
        throw new Error("Invalid grammar rule found in " + name);
    }
    
    from = to = null;
    lexemes = [];
    
    for (l = rule.length; l--;) {
        item = rule[l];
        
        if (isRegex(item)) {
            token = item.source;
            tokenId = map.generateSymbol('/' + item.source + '/');
            
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

    // generate name symbol
    //name = map.generateSymbol(name);

    
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
    var isString = string,
        isArray = array,
        isRegex = regex,
        defineRule = define,
        ruleNameRe = RULE_NAME_RE,
        ruleNames = [],
        grammarRoot = "$" + root;
    var c, l, dc, dl, name, definition,
        rules, grammar, groups, group, index, terminal;

    stateMap.reset();
    
    stateMap.root = stateMap.generateSymbol(grammarRoot);
        
    name = null;
    rules = {};
    grammar = {
        root: grammarRoot,
        rgenId: 0,
        map: stateMap,
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
                       stateMap.lookupSymbol(stateMap.augmentedRoot),
                        [[ root,
                            stateMap.lookupSymbol(stateMap.endSymbol)]]);

    for (c = -1, l = definitions.length; l--;) {
        
        definition = definitions[++c];
        
        if (isString(definition)) {
            
            if (!ruleNameRe.test(definition)) {
                throw new Error("Invalid grammar rule name " + definition);
            }
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
                group = defineRule(name,
                                   definition[++dc],
                                   grammar,
                                   tokenizer);
                // register group
                groups[group[1]] = name + ':' + (dc + 1);
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
            
            name = stateMap.generateSymbol('/' + definition.source + '/');
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

    
    if (!contains(rules, stateMap.generateSymbol(root))) {
        throw new Error("Invalid root grammar rule parameter.");
    }
    
    return defineStates(grammar, stateMap, exclude) &&
            stateMap.finalize();

}

export default build;

