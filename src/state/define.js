'use strict';

import State from "./define/state.js";

import List from "./define/list.js";


function define(registry) {

    var map = registry.map,
        StateClass = State,
        STATE_END = 0,
        STATE_START = 1,
        STATE_RUN_RULES = 2,
        STATE_START_RULE = 3,
        STATE_RUN_RECURSION = 4,
        STATE_DEFINE_LEXEME = 5,
        STATE_DEFINE_ENDER = 6,
        STATE_END_RULES = 7,
        Queue = List,
        defineState = STATE_START,
        start = new StateClass(registry),
        queue = new Queue('queue'),
        pending = new Queue('pending');
    var item, rules, rule, rindex, rlen, lexemes, tokens,
        id, token, lindex, llen,
        state, production, recursion, enqueue,
        ruleState, isRuleState, tagged;

    var limit = 100;

    queue.push([start, map.augmentedRoot]);

    for (; defineState;) {
        if (!--limit) {
            break;
        }

        switch (defineState) {
        case STATE_START:
            item = queue.shift();

            production = item[1];
            ruleState = item[0];

            rules = registry.getRules(production);
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

            // find recursion
            if (state.findRecursion(id)) {
                defineState = STATE_RUN_RECURSION;
            }
            else {
                defineState = STATE_DEFINE_LEXEME;
                break;
            }

        /* falls through */
        case STATE_RUN_RECURSION:
            tagged = state.hasTag(id);
            if (!tagged) {
                state.tag(id);
            }

            if (!state.pointed(token)) {
                state.pointTo(token, state);  
            }

            // apply the rest of the rules
            recursion = registry.isRecursed(id);
            if (recursion && !tagged) {
                queue.push([state, recursion]);  
            }
            
            defineState = STATE_RUN_RULES;
            break;

        /* falls through */
        case STATE_DEFINE_LEXEME:

            id = rule[++lindex];
            state.tag(id);

            isRuleState = state === ruleState;

            if (!isRuleState) {
                state.rparent = ruleState;
            }

            if (!(llen--)) {
                defineState = STATE_DEFINE_ENDER;
                break;
            }
            
            
            token = tokens[lindex];

            // recursion
            recursion = registry.isRecursed(id);
            if (recursion) {
                (isRuleState ?
                    queue : pending).push([state, recursion]);
            }

            state = state.point(token, ruleState);
            break;

        /* falls through */
        case STATE_DEFINE_ENDER:
            id = rule[++lindex];
            defineState = STATE_RUN_RULES;
            break;
        
        case STATE_END_RULES:
            enqueue = queue.last;

            if (!enqueue && pending.last) {
                queue.push(enqueue = pending.shift());
            }

            defineState = enqueue ? STATE_START : STATE_END;
        }
        
    }
    
    // generate report
    var states = registry.vstates;
    var c, l, state, pointer;

    for (c = -1, l = states.length; l--;) {
        state = states[++c];
        pointer = state.pointer;
        for (;pointer; pointer = pointer.next) {
            console.log(state.id, ':', pointer.token, '->', pointer.to.id);
        }
    }
    console.log(registry.vstates);
    console.log(queue, pending);
    
}





export default define;