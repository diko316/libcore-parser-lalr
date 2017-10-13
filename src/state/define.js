'use strict';

import State from "./define/state.js";

function define(registry) {

    var map = registry.map,
        production = map.augmentedRoot,
        StateClass = State,
        STATE_END = 0,
        STATE_START = 1,
        STATE_RUN_RULES = 2,
        STATE_START_RULE = 3,
        STATE_DEFINE_LEXEME = 4,
        defineState = STATE_START,
        start = new StateClass(registry),
        state = start;
    var rules, rule, rindex, rlen, lexemes, tokens,
        id, token, lindex, llen;

    var limit = 10;


    for (; defineState;) {
        if (!--limit) {
            break;
        }

        switch (defineState) {
        case STATE_START:
            rules = registry.getRules(production);
            lexemes = rules[1];
            rules = rules[0];
            rindex = -1;
            rlen = rules.length;

            defineState = STATE_RUN_RULES;

        /* falls through */
        case STATE_RUN_RULES:
            if (!(rlen--)) {
                defineState = STATE_END;
                break;
            }

            rule = rules[++rindex];
            tokens = lexemes[rindex];
            console.log(rule);
            console.log(tokens);

            defineState = STATE_START_RULE;

        /* falls through */
        case STATE_START_RULE:
            lindex = -1;
            llen = rule.length;

            id = rule[0];
            token = tokens[0];

            console.log(id, ' = ', token);

        /* falls through */
        case STATE_DEFINE_LEXEME:
            if (!(llen--)) {
                defineState = STATE_END;
                break;    
            }

            id = rule[++lindex];
            token = tokens[lindex];

            console.log('processing ', id, ' = ', token);

            defineState = STATE_END;
        }



        
    }
    

    

}


export default define;