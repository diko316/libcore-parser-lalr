'use strict';

import State from "./define/state.js";

import List from "./define/list.js";

function define(registry) {

    var map = registry.map,
        StateClass = State,
        productionStatesIndex = registry.productions,
        closureDefinitions = registry.closureItems,
        stateDefineQueue = new List(),
        STATE_END = 0,
        STATE_CREATE_INITIAL = 1,
        STATE_CREATE_GOTO = 2,
        STATE_CREATE_STATE = 3,
        defineState = STATE_CREATE_INITIAL,
        production = map.augmentedRoot,
        states = [],
        sl = 0;

    var list, c, l, item, items, token, total, tokens, transitionToken,
        stateBefore, state;


    var limit = 100;

    
    for (; defineState;) {
        switch (defineState) {

        // create initial closure from production
        //  - requires "production" set
        case STATE_CREATE_INITIAL:
            // new closures
            item = registry.createClosure(productionStatesIndex[production]);
            list = item[1];

            // create state from closure
            sl = states.length;
            state = states[sl] = new StateClass(registry,
                                                sl.toString(32),
                                                item[0]);

            // queue transitions
            c = -1;
            l = list.length;
            for (; l--;) {
                item = list[++c];
                stateDefineQueue.push([state, item[1], item[0]]);
            }


            if (!stateDefineQueue.first) {
                defineState = STATE_END;
                break;
            }

            defineState = STATE_CREATE_GOTO;
            break;
            

        /* falls through */
        // requires "list"
        case STATE_CREATE_GOTO:
            item = stateDefineQueue.shift();
            stateBefore = item[0];
            list = item[1];
            transitionToken = item[2];
            item = registry.createClosure(list);
            items = item[0];
            tokens = item[1];

            // find states having the same closure items
            total = sl = states.length;
            state = null;
            for (; sl--;) {
                item = states[sl];
                if (item.containsItems(items)) {
                    state = item;
                    break;
                }
            }

            // create state if no state found
            if (!state) {
                sl = total++;
                state = states[sl] = new StateClass(registry,
                                                    sl.toString(32),
                                                    list);

                // queue transitions
                c = -1;
                l = tokens.length;
                for (; l--;) {
                    item = tokens[++c];
                    stateDefineQueue.push([state, item[1], item[0]]);
                }
            }

            // apply end state for each end items
            c = -1;
            l = list.length;
            for (; l--;) {
                console.log('point ', stateBefore.id, ':', transitionToken, '->', state.id);
            }
            //console.log('point ', stateBefore, ':', transitionToken, ' -> ', list);


            // create next state
            defineState = stateDefineQueue.first ?
                                STATE_CREATE_GOTO : STATE_END;
            break;

            
        /* falls through */
        case STATE_END:
            defineState = null;
        }

        

        if (!--limit) {
            console.log("limit reached");
            break;
        }
    }

    console.log("states: ", states);
    console.log("registry ", registry);
    
    
}





export default define;