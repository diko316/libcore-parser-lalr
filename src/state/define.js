'use strict';

import StateObject from "./object.js";

import { clone } from "../helper.js";

function define(grammar, map, exclude) {
    
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