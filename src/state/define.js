'use strict';

import State from "./define/state.js";

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
        defineState = STATE_START,
        start = new StateClass(registry),
        queue = [null, start, map.augmentedRoot];
    var rules, rule, rindex, rlen, lexemes, tokens,
        id, token, lindex, llen,
        anchor, state, production, recursion, last;

    var limit = 10;


    for (; defineState;) {
        if (!--limit) {
            break;
        }

        switch (defineState) {
        case STATE_START:

            production = queue[2];
            anchor = queue[1];
            console.log("processing production ", production);

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
            state = anchor;
            

            console.log("start! ", state);
            defineState = STATE_DEFINE_LEXEME;

        /* falls through */
        case STATE_DEFINE_LEXEME:
            id = rule[++lindex];
            state.tag(id);

            if (!(llen--)) {
                defineState = STATE_DEFINE_ENDER;
                break;
            }
            

            token = tokens[lindex];

            // recursion
            recursion = registry.isRecursed(id);
            if (recursion) {
                last = queue;
                for (; last[0]; last = last[0]) { }
                last[0] = [null, state, recursion];
                console.log("recursion found? ", id, " is ", recursion);
            }

            state = state.point(token);



            console.log('processing ', id, ' = ', token, 'len', llen);

            break;

        /* falls through */
        case STATE_DEFINE_ENDER:
            id = rule[++lindex];
            console.log('processing last', id, lindex, anchor);

            defineState = STATE_RUN_RULES;
            break;
        
        case STATE_END_RULES:
            queue = queue[0];
            console.log("ended rules recurse to? ", queue);
            defineState = queue ? STATE_START : STATE_END;
            if (!queue) {
                console.log("end!");
            }
        }



        
    }
    

    

}


export default define;