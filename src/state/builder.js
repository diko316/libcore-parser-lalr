'use strict';

import {
            string,
            regex,
            array,
            contains
            
        } from "libcore";
        


import  {
            isTerminal,
            defineTerminals,
            defineRules
        } from "./builder/rule.js";

import define from "./define.js";

import Registry from "./builder/registry.js";


        


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

    define(registry);

    // register excludes
    if (isArray(exclude)) {
        excludes = [];

        console.log("excludes! ", exclude);
        for (c = -1, l = exclude.length; l--;) {
            definition = exclude[++c];
            if (!isRegex(definition)) {
                throw new Error("Invalid [exclude] pattern parameter.");
            }
            excludes[c] = registry.registerTerminal(definition);

        }

        map.setExcludes(excludes);
    }
}





// function build(root, stateMap, tokenizer, definitions, exclude) {
//     var isString = string,
//         isArray = array,
//         isRegex = regex,
//         registerRule = defineRule,
//         registerTerminal = defineTerminal,
//         defineToken = registerToken,
//         rules = {},
//         ruleNameRe = RULE_NAME_RE,
//         ruleNames = [],
//         grammarRoot = "$" + root,
//         name = null,
//         tokens = [],
//         pendingTerminals = [],
//         isTerminalName = false;
//     var c, l, dc, dl, definition, pl, original,
//         grammar, groups, group, index, terminal,
//         callback;

//     stateMap.reset();
    
//     stateMap.root = stateMap.generateSymbol(grammarRoot);

//     grammar = {
//         reducables: {},
//         root: grammarRoot,
//         rgenId: 0,
//         map: stateMap,
//         ruleNames: ruleNames = [],
//         rules: rules,
//         terminal: terminal = {},
//         tokens: tokens,
//         tokenAlias: {},
//         pendingTerminals: pendingTerminals,
//         lexIndex: index = {},
//         ruleIndex: {},
//         ruleGroup: groups = {}
//     };
    
//     // augment root
//     definitions.splice(definitions.length,
//                        0,
//                        stateMap.lookupSymbol(stateMap.augmentedRoot),
//                         [[ root,
//                             stateMap.lookupSymbol(stateMap.endSymbol)]]);

//     for (c = -1, l = definitions.length; l--;) {
        
//         definition = definitions[++c];
        
//         if (isString(definition)) {

//             isTerminalName = !ruleNameRe.test(definition);
//             name = stateMap.generateSymbol(definition);
//             original = definition;
        
//         }
//         else if (isArray(definition)) {
            
//             // do not accept grammar rule if it doesn't have name
//             if (!name) {
//                 throw new Error("Invalid grammar rules parameter.");
//             }
            
//             dc = -1;
//             dl = definition.length;

//             callback = isTerminalName ? registerTerminal : registerRule;
            
//             for (; dl--;) {

//                 group = callback(name, definition[++dc], grammar);

//                 // register group
//                 if (!isTerminalName) {
//                     groups[group[1]] = stateMap.generateSymbol((dc + 1) +
//                                                                 ':' +
//                                                                 original);
//                 }

//             }

//         }
//         else {
//             throw new Error("Invalid item in definitions parameter.");
//         }
        
//     }
    
//     // add excludes
//     // if (exclude) {
//     //     exclude = exclude.slice(0);
//     //     pl = pendingTerminals.length;
        
//     //     for (l = exclude.length; l--;) {
//     //         definition = exclude[l];

//     //         if (isString(definition)) {
//     //             name = stateMap.generateSymbol(definition);

//     //             if (pendingTerminals.indexOf(name) === -1) {
//     //                 pendingTerminals[pl++] = name;
//     //             }
                
//     //         }
//     //         else if (isRegex(definition)) {
//     //             definition = defineToken(grammar, definition, null, true);
//     //             name = definition[0];
//     //         }
//     //         else {
//     //             throw new Error("Invalid exclude token parameter.");
//     //         }

//     //         // rename!
//     //         exclude[l] = name;
//     //     }
        
//     // }

//     // // resolve pending terminals
//     // pl = pendingTerminals.length;
//     // for (; pl--;) {
//     //     name = pendingTerminals[pl];

//     //     if (!(name in terminal)) {
//     //         throw new Error("Terminal is not defined ",
//     //                         stateMap.lookupSymbol(name));
//     //     }
//     // }
//     // pendingTerminals.length = 0;

//     // // register
//     // if (tokens.length) {
//     //     tokenizer.define(tokens);
//     // }

    
//     // if (!contains(rules, stateMap.generateSymbol(root))) {
//     //     throw new Error("Invalid root grammar rule parameter.");
//     // }
    
//     // return defineStates(grammar, stateMap, exclude) &&
//     //         stateMap.finalize();

// }
// function registerToken(grammar, definition, name) {
//     var terminal = grammar.terminal,
//         alias = grammar.tokenAlias,
//         tokens = grammar.tokens,
//         map = grammar.map,
//         pendingTerminals = grammar.pendingTerminals;
//     var reference, len;

//     reference = map.generateSymbol('/' + definition.source + '/'); 
//     if (!name) {
//         name = reference;
//     }
    
//     // register alias as terminal
//     if (!(reference in alias)) {
//         alias[reference] = name;
//         len = tokens.length;
//         tokens[len++] = name;
//         tokens[len++] = definition;

//     }
//     else if (alias[reference] !== name) {
//         throw new Error("Token definition " + definition.source +
//                         " is a duplicate of " +
//                         map.lookupSymbol(alias[reference]));
//     }
    
//     if (!(name in terminal)) {
//         terminal[name] = reference;
        
//         if (pendingTerminals.indexOf(name) === -1) {
//             pendingTerminals[pendingTerminals.length] = name;
//         }
//     }

//     return [name, reference];
// }

// function defineTerminal(name, rule, grammar) {
//     var map = grammar.map,
//         setToken = registerToken,
//         isRegex = regex,
//         errorMessage = "Invalid terminal definitions in " +
//                         map.lookupSymbol(name);

//     var c, l, item;

//     if (isRegex(rule)) {
//         rule = [rule];
//     }

//     if (!array(rule)) {
//         throw new Error(errorMessage);
//     }

//     for (c = -1, l = rule.length; l--;) {
//         item = rule[++c];

//         if (isRegex(item)) {
//             setToken(grammar, item, name);
//         }
//         else {
//             throw new Error(errorMessage);
//         }
//     }
// }

// function defineRule(name, rule, grammar) {
//     var rules = grammar.rules,
//         ruleIndex = grammar.ruleIndex,
//         lexIndex = grammar.lexIndex,
//         ruleNames = grammar.ruleNames,
//         ruleNameRe = RULE_NAME_RE,
//         map = grammar.map,
//         pendingTerminals = grammar.pendingTerminals,
//         registerTerminal = registerToken,
//         isString = string,
//         isRegex = regex;
//     var l, item, lexemes, token, created,
//         prefix, suffix, from, to, current, lexemeId;
    
//     if (isString(rule) || isRegex(rule)) {
//         rule = [rule];
//     }
    
//     if (!array(rule)) {
//         throw new Error("Invalid grammar rule found in " + name);
//     }
    
//     from = to = null;
//     lexemes = [];
    
//     for (l = rule.length; l--;) {
//         item = rule[l];

//         if (isRegex(item)) {
//             token = registerTerminal(grammar, item);
//             item = token[0];

//         }
//         else if (!isString(item)) {
//             throw new Error("Invalid token in grammar rule " + item);
//         }
//         // terminal
//         else if (!ruleNameRe.test(item)) {

//             item = map.generateSymbol(item);

//             if (pendingTerminals.indexOf(item) === -1) {
//                 pendingTerminals[pendingTerminals.length] = item;
//             }

//         }
//         else {
//             item = map.generateSymbol(item);
//         }
        
//         lexemes[l] = item;
//         lexemeId = 'r' + (++grammar.rgenId);
//         lexIndex[lexemeId] = item;
//         created = [lexemeId, item, from];
        
//         if (!from) {
//             to = created;
//         }
//         from = created;

//     }
    
//     suffix = ' -> ' + lexemes.join(',');
//     prefix = name + ':';
//     token = name + suffix;
    
//     if (token in ruleIndex) {
//         throw new Error("Grammar rule is already defined " + name + suffix);
//     }
//     else {
//         ruleIndex[token] = true;
//     }
    
//     if (!(name in rules)) {
//         rules[name] = null;
//         ruleNames[ruleNames.length] = name;
//     }

//     //console.log("rules? ", name, " = ", from, " to ", to.slice(0));
//     grammar.reducables[to[0]] = name;
    
//     // append
//     from = [false, null, from];
//     current = rules[name];
    
//     if (current) {
//         to[2] = current;
//     }
    
//     rules[name] = from;
    
    
//     return [from[2][0], to[0]];
// }

export default build;

