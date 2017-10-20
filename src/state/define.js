'use strict';

import State from "./define/state.js";

import List from "./define/list.js";


function define(registry) {

    var map = registry.map,
        ruleIndex = registry.productions,
        queue = new List(),
        STATE_START = 1,
        STATE_END = 2,
        STATE_START_RULE = 3,
        STATE_START_RULESTATE = 4,
        STATE_END_RULESTATE = 6,
        STATE_END_RULE= 6,
        STATE_DEFINE_STATE = 5,
        defineState = STATE_START;
    var anchor, state, production,
        rules, rulesLen, rulesIndex,
        states, statesLen, statesIndex, ruleState,
        item, before;

    var limit = 10;

    console.log("registry ", registry);

    queue.push([new State(registry, map.start),
                map.augmentedRoot,
                null]);
    
    for (; defineState;) {
        if (!--limit) {
            defineState = null;
        }

        switch (defineState) {
        case STATE_START:
            item = queue.shift();

            production = item[1];
            anchor =
                state = item[0];

            before = item[2]; 
            
            rules = ruleIndex[production];
            rulesLen = rules.length;
            rulesIndex = 0;
            defineState = STATE_START_RULE;

            console.log(production, rules);

        /* falls through */
        case STATE_START_RULE:
            states = rules[rulesIndex++];
            statesIndex = 0;
            statesLen = states.length;
            defineState = STATE_START_RULESTATE;

        /* falls through */
        case STATE_START_RULESTATE:
            ruleState = states[0];

            console.log("first ruleState", ruleState);
            defineState = STATE_DEFINE_STATE;

        /* falls through */
        case STATE_DEFINE_STATE:
            ruleState = states[statesIndex++];
            console.log("ruleState", ruleState);

            // next
            if (--statesLen) {
                break;
            }
            defineState = STATE_END_RULESTATE;

        /* falls through */
        case STATE_END_RULESTATE:
            
            // end of state
            console.log("ended, last ruleState ", ruleState);

            // next rule
            if (--rulesLen) {
                defineState = STATE_START_RULE;
                break;
            }
            defineState = STATE_END_RULE;


        /* falls through */
        case STATE_END_RULE:

            console.log("ended all rules in production, next rule ", ruleState);
            // next in queue
            if (queue.first) {
                defineState = STATE_START;
                break;
            }

            defineState = STATE_END;

        /* falls through */
        case STATE_END:
            defineState = null;
        }
    }
    
    
}





export default define;