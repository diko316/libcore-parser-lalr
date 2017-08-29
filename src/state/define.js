'use strict';

import StateObject from "./object.js";

function define(grammar, map, exclude) {
    
    var SO = StateObject,
        ruleIndex = grammar.rules,
        ruleGroup = grammar.ruleGroup,
        vstate = new SO(map, map.start),
        rootName = "$end",
        pending = [[ vstate, rootName]],
        l = 1;
    var item, production, rule, lexeme, anchorState, ruleId, params,
        recurse, ident, next;
        
    map.reset();
    
    map.root = grammar.root;
    
    if (exclude) {
        map.setExcludes(exclude);
    }
    
    for (; l--;) {
        item = pending.splice(0, 1)[0];
        anchorState = item[0];
        production = item[1];
        
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
                
                
                // for non-terminal
                if (lexeme in ruleIndex) {
                    
                    ident = vstate.rid;
                    ident = ident ?
                                ident + '-' + ruleId : ruleId;
                    
                    // recurse
                    if (!(ident in vstate)) {
                        
                        recurse = vstate.clone(ruleId);
                        recurse[ident] = recurse;
                        pending[l++] = [recurse, lexeme];
                        
                    }
                    
                }
                
                // only if not skipped
                vstate = vstate.point(lexeme);
                
                // set reduce state
                if (!next || next[0] === false) {
                    vstate.reduce(production, params, ruleGroup[ruleId]);
                }
                
            }
            
        }

        
    }
    
    return true;
}


export default define;