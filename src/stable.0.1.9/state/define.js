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
        pending = new Queue('pending'),
        processed = {},
        endStateList = [],
        esl = 0,
        iterations = 0;

    var item, rules, rule, rindex, rlen, lexemes, tokens,
        id, token, lindex, llen,
        state, production, recursion, enqueue,
        ruleState, tagged,
        pointed, target,
        pid, empties, redirectStates, emptyStatesByReducer, endState, reduceId,
        states, pointer, c, l;

    var count = 30;

    //var limit = 1000;
    if (map.debugMode) {
        console.log("registry: ", registry);
    }


    queue.push([start, map.augmentedRoot]);
    esl = 0;

    mainLoop: for (; defineState;) {
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
                //console.log("found recursion ", state.id, " for ", production, ' -> ', id);
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
            endStateList[esl++] = state;
            defineState = STATE_RUN_RULES;
            break;
        
        case STATE_END_RULES:
            enqueue = queue.last;

            if (!enqueue && pending.last) {
                queue.push(enqueue = pending.shift());
            }

            

            // if (!count--) {
            //     //console.log("created 3 rules ", registry);
            //     //break mainLoop;
            // }

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

    //console.log(registry);



    // generate state map
    states = registry.vstates;
    empties = 0;
    //var endstates = 0;
    redirectStates = {};
    emptyStatesByReducer = {};

    // generate redirections to end states
    for (; esl--;) {
        state = endStateList[esl];

        // no pointer! then this is a very good candidate
        if (!state.pointer.first) {
            id = state.id;
            endState = registry.isEnd(id);
            reduceId = map.generateReduceId(endState[0],
                                            endState[1],
                                            endState[2]);
            // register as reduce state
            if (!(reduceId in emptyStatesByReducer)) {
                emptyStatesByReducer[reduceId] = id;
            }
            // create redirection
            else {
                redirectStates[id] = emptyStatesByReducer[reduceId];
            }
        }
    }

    for (c = - 1, l = states.length; l--;) {
        state = states[++c];
        id = state.id;
        pointer = state.pointer.first;

        if (pointer) {
            map.createState(id);
            for (; pointer; pointer = pointer[0]) {
                item = pointer[1];
                target = item[0].id;

                // change target state id
                if (target in redirectStates) {
                    target = redirectStates[target];
                }

                map.createPointer(id, item[1], target);
            }
        }
        
        item = registry.isEnd(id);
        if (item && !(id in redirectStates)) {
            map.createState(id);
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