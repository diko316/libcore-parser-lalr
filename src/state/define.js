'use strict';

import Item from "./item.js";

function define(grammar, map, exclude) {
    var STATE_END = 0,
        STATE_START = 1,
        STATE_RULE_ITERATE = 2,
        STATE_RULE_END = 5,

        defineState = STATE_START,
        ruleIndex = grammar.rules,
        ruleGroup = grammar.ruleGroup;

    var anchor, production, rule, lexeme, ruleId, params,
        queue, recursion, pendingRecursion, item;

    map.reset();
    map.root = grammar.root;

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
    map.finalize();
    
}

export default define;