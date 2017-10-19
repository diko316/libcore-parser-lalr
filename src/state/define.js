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
        STATE_DEFINE_LEXEME = 4,
        STATE_DEFINE_ENDER = 5,
        STATE_END_RULES = 6,
        Queue = List,
        defineState = STATE_START,
        start = new StateClass(registry, map.start),
        queue = new Queue('queue'),
        pending = new Queue('pending');

    var item, rules, rule, rindex, rlen, lexemes, tokens,
        id, token, lindex, llen,
        state, production, recursion, enqueue,
        ruleState, tagged,
        pointed, target,
        
        states, pointer, c, l;

    //var limit = 1000;

    queue.push([start, map.augmentedRoot]);

    for (; defineState;) {
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
            if (recursion) {
                (state === ruleState ?
                    queue : pending).push([state, recursion]);
            }

            state.tag(id);
            pointed = state.pointed(token);
            state = pointed || state.point(token, ruleState);

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

    //console.log("iterations: ", 1000 - limit);

    // generate state map
    states = registry.vstates;
    console.log("generated states: ", states.length);
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





export default define;