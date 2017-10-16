'use strict';

import {
            string,
            regex,
            array
            
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

        //console.log("excludes! ", exclude);
        for (c = -1, l = exclude.length; l--;) {
            definition = exclude[++c];
            if (!isRegex(definition)) {
                throw new Error("Invalid [exclude] pattern parameter.");
            }
            excludes[c] = registry.registerTerminal(definition);

        }

        map.setExcludes(excludes);
    }

    return true;
}


export default build;

