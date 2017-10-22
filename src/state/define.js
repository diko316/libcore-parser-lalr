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
        before, tokens, tl, closureItems, cl,
        productionLookup, state, found, sl, subject, next, processed,
        token, additional, total, terminal;


    var limit = 20;

    
    for (; defineState;) {
        switch (defineState) {

        // create initial closure from production
        //  - requires "production" set
        case STATE_CREATE_INITIAL:
            processed = {};
            sl = states.length;
            state = states[sl] = new StateClass(registry, sl);

            list = productionStatesIndex[production];
            tokens = [];
            tl = 0;

            productionLookup = {};
            productionLookup[production] = true;

            c = -1;
            l = list.length;

            // gather closure items
            for (; l--;) {
                item = list[++c];

                state.addItem(item = closureDefinitions[item]);

                token = item.token;
                terminal = item.terminal;

                if (token && !(token in processed)) {
                    processed[token] = true;
                    tokens[tl++] = token;
                }

                // non-terminals
                if (!terminal) {

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

            // prepare go state
            c = -1;
            l = tokens.length;
            for (; l--;) {
                token = tokens[++c];
                stateDefineQueue.push([state,
                                        token,
                                        state.getTokenStates(token)]);
            }

            if (!stateDefineQueue.first) {
                defineState = STATE_END;
                break;
            }

            defineState = STATE_CREATE_GOTO;
            

        /* falls through */
        // requires "list"
        case STATE_CREATE_GOTO:
            item = stateDefineQueue.shift();
            before = item[0];
            closureItems = item[2].slice(0);

            console.log('creating closure items: ', closureItems);

            // create lookups
            processed = {};
            productionLookup = {};
            if (!terminal) {
                productionLookup[token] = true;
            }

            // create closure from list
            c = -1;
            l = closureItems.length;
            for (; l--;) {
                item = closureDefinitions[closureItems[++c]];
                token = item.token;
                terminal = item.terminal;

                if (token && !(token in processed)) {
                    processed[token] = true;
                    tokens[tl++] = token;
                }

                // non-terminals
                if (item.after && !terminal) {
                    
                    // include start rules in this production
                    if (!(token in productionLookup)) {
                        productionLookup[token] = true;

                        // recurse get additional production first states
                        additional = productionStatesIndex[token];
                        closureItems.push.apply(closureItems, additional);
                        l += additional.length;
                    }
                }
            }
            

            console.log("> new closures ", closureItems);
            // find state having only the following items
            state = null;
            sl = states.length;

            for (; sl--;) {
                found = states[sl];
                if (found.containsItems(closureItems)) {
                    state = found;
                    break;
                }
            }

            // use this state instead
            if (state) {
                console.log('found: ', state);
            }
            // create state containing the items
            else {
                tokens = [];
                tl = 0;

                sl = states.length;
                state = states[sl] = new StateClass(registry, sl);
                c = -1;
                l = closureItems.length;
                for (; l--;) {
                    item = closureItems[++c];
                    item = closureDefinitions[item];
                    state.addItem(item);
                }
                console.log("created state ", state);

            }

            // // create next state
            defineState = stateDefineQueue.first ?
                                STATE_CREATE_GOTO : STATE_END;
            defineState = null;
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

    console.log(states);
    console.log("registry ", registry);
    
    
}





export default define;