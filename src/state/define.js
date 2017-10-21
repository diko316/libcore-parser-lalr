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
        states = [];

    var list, c, l, item, id,
        productionLookup, state, found, sl, subject, next, processed,
        token, additional, total;


    var limit = 20;

    
    for (; defineState;) {
        switch (defineState) {

        // create initial closure from production
        //  - requires "production" set
        case STATE_CREATE_INITIAL:
            sl = states.length;
            state = states[sl] = new StateClass(registry, sl);

            list = productionStatesIndex[production];

            productionLookup = {};
            productionLookup[production] = true;

            c = -1;
            l = list.length;

            // gather closure items
            for (; l--;) {
                item = list[++c];

                state.addItem(item = closureDefinitions[item]);

                // non-terminals
                if (!item.terminal) {
                    token = item.token;

                    // include start rules in this production
                    if (!(token in productionLookup)) {
                        productionLookup[token] = true;

                        // recurse get additional production first states
                        additional = productionStatesIndex[token];
                        list.push.apply(list, additional);
                        l += additional.length;
                    }
                }
                
            }

            defineState = STATE_CREATE_GOTO;
            list = state.items;

        /* falls through */
        // requires "list"
        case STATE_CREATE_GOTO:
            c = -1;
            l = list.length;
            total = states.length;
            processed = {};

            for (; l--;) {
                id = list[++c];
                item = closureDefinitions[id];
                next = item.after;
                found = null;
                token = item.token;

                // has transition
                if (next && !(token in processed)) {
                    processed[token] = true;

                    sl = total;
                    for (; sl--;) {
                        subject = states[sl];
                        if (subject.hasItem(next)) {
                            console.log('can use state for item: ', id);
                            found = subject;
                            break;
                        }
                    }

                    if (!found) {
                        stateDefineQueue.push([]);

                    }

                }
                //console.log("item ", item);
                
            }
            
            
            // if (list) {
            //     list = list.slice(0);
            //     l = list.length;

            //     // replace item with next
            //     for (; l--;) {
            //         item = list[l];

            //         token = item.token;
            //         if (!item.terminal) {
            //             console.log("is non terminal ", item);
            //         }

            //         item = item.after;
                    
            //         if (item) {
            //             list[l] = item;
            //         }
            //         else {
            //             list.splice(l, 1);
            //         }
            //     }

            //     if (!list.length) {
            //         list = null;
            //     }
            // }

            // if (!list) {
            //     defineState = stateDefineQueue.first ?
            //                         STATE_CREATE_GOTO : STATE_END;
            // }
            // else {
            //     console.log("creating state! ", sl);
            //     defineState = STATE_CREATE_CLOSURE;
            //     productionLookup = {};
            //     state = states[sl] = new StateClass(registry, sl);
            //     sl++;
            // }

            // break;
            
        /* falls through */
        case STATE_END:
            defineState = null;
        }

        

        if (!--limit) {
            console.log("limit reached");
            break;
        }
    }

    console.log(states);
    console.log("registry ", registry);
    
    
}





export default define;