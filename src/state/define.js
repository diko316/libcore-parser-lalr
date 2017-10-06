'use strict';

import Item from "./define/item.js";

import StateObject from "./object.js";

import { clone } from "../helper.js";


function define(grammar, map, exclude) {
    var SO = StateObject,
        DI = Item,

        STATE_END = 0,
        STATE_START = 1,
        STATE_RULE_ITERATE = 2,
        STATE_RULE_RECURSE_SETUP = 3,
        STATE_RULE_START = 4,
        STATE_RULE_END = 5,

        duplicate = clone,
        defineState = STATE_START,
        ruleIndex = grammar.rules,
        ruleGroup = grammar.ruleGroup,
        vstate = new SO(map, map.start),
        item = new DI(new SO(map, map.start), null);

    var anchor, production, rule, lexeme, ruleId, params,
        recursion, pendingRecursion;

    map.reset();
    map.root = grammar.root;

    if (exclude) {
        map.setExcludes(exclude);
    }

    console.log(grammar);

    var limit = 1000;
    
    for (; defineState;) {

        if (!--limit) {
            console.log("limit reached!!!! ", l);
            break;
        }

        switch (defineState) {
        case STATE_START:
            if (!item) {
                defineState = STATE_END;
                break;
            }

            anchor = item.state;
            production = item.lexeme;
            
            rule = ruleIndex[production];

            defineState = STATE_RULE_ITERATE;

            pendingRecursion = null;

        /* falls through */
        case STATE_RULE_ITERATE:
            // go to next pending
            if (!rule) {
                defineState = STATE_RULE_END;
                break;
            }
            
            ruleId = rule[0];
            lexeme = rule[1];

            // go to next rule
            rule = rule[2];

            // start of rule
            if (ruleId === false) {
                params = 0;
                vstate = anchor;
                break;
            }

            // connect states
            params++;

            // non-terminal
            if (lexeme in ruleIndex) {

                // find recursion
                recursion = item.getRecursionRule(ruleId);
                
                // follow recursion
                if (recursion) {

                    // merge pointers pointed by recursion
                    item.merge(recursion);

                    // end here
                    for (; rule && rule[0] !== false; rule = rule[2]) { }
                    break;

                }

                // create recursion
                recursion = item.createRecursion(vstate, ruleId, lexeme);

                // immediately insert if anchor
                if (vstate === anchor) {
                    item.insertNext(recursion);

                }
                // add to pending
                else if (pendingRecursion) {
                    pendingRecursion.append(recursion);
                }
                // first pending recursion
                else {
                    pendingRecursion = recursion;
                }
                
            }

            // if (!(lexeme in vpointer)) {
            //     //vstate.point(lexeme, new SO(map));
            // }

            // vstate = vpointer[lexeme];
            // vpointer = vstate.pointer;

            // reduce if no more next rules or end of lexer rule
            // if (!rule || rule[0] === false) {
            //     map.setReduceState(vstate.id,
            //                         production,
            //                         params,
            //                         ruleGroup[ruleId]);
                
            // }
        
        break;
        case STATE_RULE_END:
            // insert pending recursions
            if (pendingRecursion) {
                item.append(pendingRecursion);
            }

            // try next pending
            item = item.next;
            defineState = STATE_START;
        break;
        }

    }        
}
















function oldDefine2(grammar, map, exclude) {
    var SO = StateObject,
        STATE_END = 0,
        STATE_START = 1,
        STATE_RULE_ITERATE = 2,
        STATE_RULE_RECURSE_SETUP = 3,
        STATE_RULE_START = 4,
        STATE_RULE_END = 5,

        rootName = "$end",
        duplicate = clone,
        defineState = STATE_START,
        ruleIndex = grammar.rules,
        ruleGroup = grammar.ruleGroup,
        vstate = new SO(map, map.start),
        pending = [[vstate, rootName, {}]],
        l = 1,
        states = [vstate],
        sl = 1,
        pendingRecursions = [];

    var anchor, production, item,
        rule, ruleId, params, c, pl, recursionRuleId, 
        recursion, recurseObject, recursionId, recursionRef,
        lexeme, pointer, vpointer, state;

    map.reset();
    map.root = grammar.root;

    console.log(grammar);

    if (exclude) {
        map.setExcludes(exclude);
    }

    var limit = 1000;

    for (; defineState;) {

        if (!--limit) {
            console.log("limit reached!!!! ", l);
            break;
        }

        switch (defineState) {
        case STATE_START:
            if (!(l--)) {
                defineState = STATE_END;
                break;
            }

            item = pending.splice(0, 1)[0];
            anchor = item[0];
            production = item[1];
            recursion = item[2];
            
            rule = ruleIndex[production];

            defineState = STATE_RULE_ITERATE;

            

        /* falls through */
        case STATE_RULE_ITERATE:
            // go to next pending
            if (!rule) {
                defineState = STATE_RULE_END;
                break;
            }
            
            ruleId = rule[0];
            lexeme = rule[1];

            // go to next rule
            rule = rule[2];

            // start of rule
            if (ruleId === false) {
                params = 0;
                vstate = anchor;
                break;
            }

            // connect states
            params++;

            // non-terminal
            if (lexeme in ruleIndex) {
                
                // follow recursion
                if (ruleId in recursion) {

                    //console.log(recursions[ruleId].id, ' copy pointers to ', vstate.id);
                    //console.log("found? ", ruleId, " in ", recursion);

                    recurseObject = recursion[ruleId];
                    recurseObject.merge(vstate);

                    // end here
                    for (; rule && rule[0] !== false; rule = rule[2]) { }
                    break;

                }
                // create recursion
                else {
                    recurseObject = duplicate(recursion);
                    recurseObject[ruleId] = vstate;
                    //pendingRecursions[pl++] = [vstate, lexeme, recurseObject];


                    //console.log("recursing ", vstate.id, ':', lexeme, ' rule ', ruleId);
                }
                
            }
            
            // create vstate and point to it
            state = vstate.getTarget(lexeme);
            if (!state) {
                vstate = vstate.point(lexeme);
                states[sl++] = vstate;
            }
            else {
                vstate = state;
            }
            

            // if (!(lexeme in vpointer)) {
            //     //vstate.point(lexeme, new SO(map));
            // }

            // vstate = vpointer[lexeme];
            // vpointer = vstate.pointer;

            // reduce if no more next rules or end of lexer rule
            if (!rule || rule[0] === false) {
                map.setReduceState(vstate.id,
                                    production,
                                    params,
                                    ruleGroup[ruleId]);
                //console.log("reduced! ", anchor.id, " <- ", production, vstate.id);
            }
            
            break;


        case STATE_RULE_END:
            // process pending recursions
            // if (pl) {
            //     l += pendingRecursions.length;
            //     pending.push.apply(pending, pendingRecursions);
            // }
            
            // for (c = -1; pl--;) {
            //     recurseObject = pendingRecursions[++c];
            //     pending[l++] = recurseObject;
            // }
            
            
            // try next pending
            defineState = STATE_START;
            break;

        }


        
    }


    // finalize
    // for (c = -1; sl--;) {
    //     states[++c].finalize();
    // }

}


function oldDefine(grammar, map, exclude) {
    
    var SO = StateObject,
        ruleIndex = grammar.rules,
        ruleGroup = grammar.ruleGroup,
        vstate = new SO(map, map.start),
        rootName = "$end",
        pending = [[vstate, rootName, {}]],
        l = 1,
        duplicate = clone;

    var item, production, rule, lexeme, anchorState, ruleId, params, next,
        recursions, current, nextState;
        
    map.reset();
    
    map.root = grammar.root;
    
    if (exclude) {
        map.setExcludes(exclude);
    }

    var limit = 205;
    
    for (; l--;) {

        if (!--limit) {
            console.log("limit reached!!!! ", l);
            break;
        }

        item = pending.splice(0, 1)[0];
        anchorState = item[0];
        production = item[1];
        recursions = item[2];
        
        // iterate rules
        rule = ruleIndex[production];


        for (; rule; rule = next) {
            ruleId = rule[0];
            next = rule[2];
            
            // reset
            if (ruleId === false) {
                params = 0;
                vstate = anchorState;
                
            }
            // run rule
            else {
                lexeme = rule[1];
                params++;

                nextState = false;

                // for non-terminal
                if (lexeme in ruleIndex) {

                    // recurse
                    if (!(ruleId in recursions)) {
                        current = duplicate(recursions);
                        console.log("recurse ", lexeme, " as ", vstate.id);
                        current[ruleId] = vstate;
                        pending[l++] = [vstate,
                                        lexeme,
                                        current];

                    }
                    // point to recursion
                    else {
                        nextState = vstate.point(ruleId,
                                                lexeme,
                                                recursions[ruleId]);
                    }
                    
                    
                }

                // point to next state 
                vstate = nextState || vstate.point(ruleId, lexeme);
                
                // point!
                //vstate = vstate.point(lexeme, recursions);
                
                // set reduce state
                if (!next || next[0] === false) {
                    console.log("reduce ", production, " from ", vstate.id);
                    console.log("---- ", production, params, ruleGroup[ruleId]);
                    //vstate.reduce(production, params, ruleGroup[ruleId]);
                    map.setReduceState(vstate.id,
                                        production,
                                        params,
                                        ruleGroup[ruleId]);
                }
                
            }
            
        }

        
    }

    console.log(map);
    
    return true;
}


export default define;