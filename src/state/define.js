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
        STATE_FOLLOW_RECURSION = 5,
        STATE_DEFINE_LEXEME = 6,
        STATE_DEFINE_ENDER = 7,
        STATE_END_RULES = 8,
        Queue = List,
        defineState = STATE_START,
        start = new StateClass(registry, map.start),
        queue = new Queue('queue'),
        pending = new Queue('pending');

    var item, rules, rule, rindex, rlen, lexemes, tokens,
        id, token, lindex, llen, params,
        state, production, recursion, enqueue,
        ruleState, isRuleState, tagged,
        target, pointed,
        
        states, pointer, c, l;

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
            lindex = 0;
            llen = tokens.length;

            id = rule[0];
            token = tokens[0];
            state = ruleState;

            // find recursion
            target = state.findRecursion(id);


            // no recursion then proceed to define lexeme
            if (!target) {
                defineState = STATE_DEFINE_LEXEME;
                break;
            }

        /* falls through */
        case STATE_RUN_RECURSION:
            tagged = state.hasTag(id);
            if (!tagged) {
                state.tag(id);
            }

            // find pointed target
            pointed = state.pointed(token);
            if (!pointed) {
                state.pointTo(token, target.pointed(token).to);
            }

            recursion = registry.isRecursed(id);
            if (recursion && !tagged) {
                queue.push([state, recursion]);  
            }

            // follow lexeme rules without recursion
            if (pointed) {
                for (; llen--;) {
                    id = rule[lindex];
                    token = tokens[lindex++];
                    state.tag(id);
                    state = state.point(token, ruleState);
                }
                defineState = STATE_DEFINE_ENDER;
            }
            else {
                defineState = STATE_RUN_RULES;
            }
            break;

        case STATE_FOLLOW_RECURSION:
            break;

        /* falls through */
        case STATE_DEFINE_LEXEME:

            id = rule[lindex];
            state.tag(id);

            isRuleState = state === ruleState;

            if (!isRuleState) {
                state.rparent = ruleState;
            }

            if (!(llen--)) {
                defineState = STATE_DEFINE_ENDER;
                break;
            }
            
            
            token = tokens[lindex++];

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
        }
        
    }

    // generate state map
    states = registry.vstates;
    for (c = - 1, l = states.length; l--;) {
        state = states[++c];
        id = state.id;
        pointer = state.pointer;
        map.createState(id);

        // apply pointer
        for (; pointer; pointer = pointer.next) {
            map.createPointer(id, pointer.token, pointer.to.id);
        }

        // set end
        item = registry.isEnd(id);
        if (item) {
            map.setReduceState(id, item[0], item[1], item[2]);
        }
    }

    

    
    // generate report
    var states = registry.vstates,
        ends = registry.ends;
    var c, l, state, pointer, end;

    for (c = -1, l = states.length; l--;) {
        state = states[++c];
        pointer = state.pointer;
        if (!pointer) {
            console.log('no transitions in ', state.id);
        }
        for (;pointer; pointer = pointer.next) {
            target = pointer.to;
            end = target.id in ends ?
                    ' end: ' + ends[target.id].join(',') : '';
            console.log(state.id, ':', pointer.token, '->', target.id, end);
        }
    }
    console.log(registry.vstates);
    console.log(queue, pending);
    
}





export default define;