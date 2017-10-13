'use strict';

import Item from "./item.js";



function define(grammar, map, exclude) {
    var STATE_END = 0,
        STATE_START = 1,
        STATE_RULE_ITERATE = 2,
        STATE_RULE_END = 5,

        defineState = STATE_START,
        ruleIndex = grammar.rules,
        ruleGroup = grammar.ruleGroup,
        reducables = grammar.reducables,
        recursionObject = {},
        pending = null,
        watchNames = [],
        wl = 0;

    var anchor, production, rule, lexeme, ruleId, params,
        queue, last, lastPending, item, newItem, id, c, l;

    if (exclude) {
        map.setExcludes(exclude);
    }

    item = new Item(map, recursionObject, map.start);

    queue = last = [null, item, map.augmentedRoot];

    lastPending = pending;
    
    
    for (; defineState;) {

        switch (defineState) {
        case STATE_START:
            if (!queue) {
                defineState = STATE_END;
                break;
            }

            anchor = queue[1];
            production = queue[2];
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
                item = anchor;
                break;
            }

            // connect states
            params++;

            // non-terminal
            if (lexeme in ruleIndex) {

                // create pilot recursion
                if (!item.hasRecursion(ruleId)) {

                    // create watcher
                    watchNames[wl++] = ruleId;

                    item.setRecursion(ruleId);
                    newItem = [null, item, lexeme];

                    // high priority, insert to queue
                    if (item === anchor) {
                        
                        if (last) {
                            last[0] = newItem;
                        }

                        last = newItem;

                    }
                    // insert to pending...
                    else {
                        if (pending) {
                            lastPending[0] = newItem;
                        }
                        else {
                            pending = newItem;
                        }
                        lastPending = newItem;
                    }

                }
                // observe
                else {
                    id = item.state;

                    recursionObject[ruleId].observe(item, ruleId);

                }

                //console.log(lexeme, ' in ', ruleIndex, ' = ', ruleIndex[lexeme]);

                // find recursion
                // recursion = item.getRecursionItem(ruleId);

                // // create recursion
                // if (!recursion) {
                //     recursion = item.setRecursion(ruleId);

                //     if (item)
                // }
                
            }
            
            var before = item;
            item = item.point(lexeme, ruleId);

            if (lexeme === 'buang') {

                console.log("rule ", lexeme, ruleId, " -> ", production);
            }

            //if (before.state === 's6' && lexeme === 'buang') {
            //console.log("pointing ", before.state, ":", lexeme, '->', item.state, ' reduce? ', !rule || rule[0] === false, ' production ', production);
            //}

            if (ruleId in reducables) {
                console.log("reducable! ", before.state, ":", lexeme, '->', item.state, ' verify? ', !rule || rule[0] === false);
            }

            // reduce if no more next rules or end of lexer rule
            if (!rule || rule[0] === false) {
                //console.log("reduce params ", ruleGroup[ruleId]);
                item.reduce(production, params, ruleGroup[ruleId]);
            }
        
        break;
        case STATE_RULE_END:

            queue = queue[0];

            // try pending
            if (!queue) {
                if (!pending) {
                    lastPending = pending;
                }
                else {
                    queue = [null, pending[1], pending[2]];
                    pending = pending[0];
                }
                last = queue;
            }

            defineState = STATE_START;

        break;
        }

    }

    // finalize watched states
    function define(grammar, map, exclude) {
        var STATE_END = 0,
            STATE_START = 1,
            STATE_RULE_ITERATE = 2,
            STATE_RULE_END = 5,
    
            defineState = STATE_START,
            ruleIndex = grammar.rules,
            ruleGroup = grammar.ruleGroup,
            reducables = grammar.reducables,
            recursionObject = {},
            pending = null,
            watchNames = [],
            wl = 0;
    
        var anchor, production, rule, lexeme, ruleId, params,
            queue, last, lastPending, item, newItem, id, c, l;
    
        if (exclude) {
            map.setExcludes(exclude);
        }
    
        item = new Item(map, recursionObject, map.start);
    
        queue = last = [null, item, map.augmentedRoot];
    
        lastPending = pending;
        
        
        for (; defineState;) {
    
            switch (defineState) {
            case STATE_START:
                if (!queue) {
                    defineState = STATE_END;
                    break;
                }
    
                anchor = queue[1];
                production = queue[2];
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
                    item = anchor;
                    break;
                }
    
                // connect states
                params++;
    
                // non-terminal
                if (lexeme in ruleIndex) {
    
                    // create pilot recursion
                    if (!item.hasRecursion(ruleId)) {
    
                        // create watcher
                        watchNames[wl++] = ruleId;
    
                        item.setRecursion(ruleId);
                        newItem = [null, item, lexeme];
    
                        // high priority, insert to queue
                        if (item === anchor) {
                            
                            if (last) {
                                last[0] = newItem;
                            }
    
                            last = newItem;
    
                        }
                        // insert to pending...
                        else {
                            if (pending) {
                                lastPending[0] = newItem;
                            }
                            else {
                                pending = newItem;
                            }
                            lastPending = newItem;
                        }
    
                    }
                    // observe
                    else {
                        id = item.state;
    
                        recursionObject[ruleId].observe(item, ruleId);
    
                    }
    
                    //console.log(lexeme, ' in ', ruleIndex, ' = ', ruleIndex[lexeme]);
    
                    // find recursion
                    // recursion = item.getRecursionItem(ruleId);
    
                    // // create recursion
                    // if (!recursion) {
                    //     recursion = item.setRecursion(ruleId);
    
                    //     if (item)
                    // }
                    
                }
                
                var before = item;
                item = item.point(lexeme, ruleId);
    
                if (lexeme === 'buang') {
    
                    console.log("rule ", lexeme, ruleId, " -> ", production);
                }
    
                //if (before.state === 's6' && lexeme === 'buang') {
                //console.log("pointing ", before.state, ":", lexeme, '->', item.state, ' reduce? ', !rule || rule[0] === false, ' production ', production);
                //}
    
                if (ruleId in reducables) {
                    console.log("reducable! ", before.state, ":", lexeme, '->', item.state, ' verify? ', !rule || rule[0] === false);
                }
    
                // reduce if no more next rules or end of lexer rule
                if (!rule || rule[0] === false) {
                    //console.log("reduce params ", ruleGroup[ruleId]);
                    item.reduce(production, params, ruleGroup[ruleId]);
                }
            
            break;
            case STATE_RULE_END:
    
                queue = queue[0];
    
                // try pending
                if (!queue) {
                    if (!pending) {
                        lastPending = pending;
                    }
                    else {
                        queue = [null, pending[1], pending[2]];
                        pending = pending[0];
                    }
                    last = queue;
                }
    
                defineState = STATE_START;
    
            break;
            }
    
        }
        
        // build state map
        return true;
        
    }
    
    // build state map
    return true;
    
}

function oldDefine1(grammar, map, exclude) {
    var STATE_END = 0,
        STATE_START = 1,
        STATE_RULE_ITERATE = 2,
        STATE_RULE_END = 5,

        defineState = STATE_START,
        ruleIndex = grammar.rules,
        ruleGroup = grammar.ruleGroup,
        reducables = grammar.reducables,
        recursionObject = {},
        pending = null,
        watchNames = [],
        wl = 0;

    var anchor, production, rule, lexeme, ruleId, params,
        queue, last, lastPending, item, newItem, id, c, l;

    if (exclude) {
        map.setExcludes(exclude);
    }

    item = new Item(map, recursionObject, map.start);

    queue = last = [null, item, map.augmentedRoot];

    lastPending = pending;
    
    
    for (; defineState;) {

        switch (defineState) {
        case STATE_START:
            if (!queue) {
                defineState = STATE_END;
                break;
            }

            anchor = queue[1];
            production = queue[2];
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
                item = anchor;
                break;
            }

            // connect states
            params++;

            // non-terminal
            if (lexeme in ruleIndex) {

                // create pilot recursion
                if (!item.hasRecursion(ruleId)) {

                    // create watcher
                    watchNames[wl++] = ruleId;

                    item.setRecursion(ruleId);
                    newItem = [null, item, lexeme];

                    // high priority, insert to queue
                    if (item === anchor) {
                        
                        if (last) {
                            last[0] = newItem;
                        }

                        last = newItem;

                    }
                    // insert to pending...
                    else {
                        if (pending) {
                            lastPending[0] = newItem;
                        }
                        else {
                            pending = newItem;
                        }
                        lastPending = newItem;
                    }

                }
                // observe
                else {
                    id = item.state;

                    recursionObject[ruleId].observe(item, ruleId);

                }

                //console.log(lexeme, ' in ', ruleIndex, ' = ', ruleIndex[lexeme]);

                // find recursion
                // recursion = item.getRecursionItem(ruleId);

                // // create recursion
                // if (!recursion) {
                //     recursion = item.setRecursion(ruleId);

                //     if (item)
                // }
                
            }
            
            var before = item;
            item = item.point(lexeme, ruleId);

            if (lexeme === 'buang') {

                console.log("rule ", lexeme, ruleId, " -> ", production);
            }

            //if (before.state === 's6' && lexeme === 'buang') {
            //console.log("pointing ", before.state, ":", lexeme, '->', item.state, ' reduce? ', !rule || rule[0] === false, ' production ', production);
            //}

            if (ruleId in reducables) {
                console.log("reducable! ", before.state, ":", lexeme, '->', item.state, ' verify? ', !rule || rule[0] === false);
            }

            // reduce if no more next rules or end of lexer rule
            if (!rule || rule[0] === false) {
                //console.log("reduce params ", ruleGroup[ruleId]);
                item.reduce(production, params, ruleGroup[ruleId]);
            }
        
        break;
        case STATE_RULE_END:

            queue = queue[0];

            // try pending
            if (!queue) {
                if (!pending) {
                    lastPending = pending;
                }
                else {
                    queue = [null, pending[1], pending[2]];
                    pending = pending[0];
                }
                last = queue;
            }

            defineState = STATE_START;

        break;
        }

    }

    // finalize watched states
    for (c = -1, l = watchNames.length; l--;) {
        recursionObject[watchNames[++c]].finalizeObserved();
    }

    //console.log("recursion ", recursionObject);
    
    // build state map
    return true;
    
}


function oldDefine(grammar, map, exclude) {
    var STATE_END = 0,
        STATE_START = 1,
        STATE_RULE_ITERATE = 2,
        STATE_RULE_END = 5,

        defineState = STATE_START,
        ruleIndex = grammar.rules,
        ruleGroup = grammar.ruleGroup,
        recursionObject = {};

    var anchor, production, rule, lexeme, ruleId, params,
        queue, recursion, pendingRecursion, item, stopped;


    var followItem;


    if (exclude) {
        map.setExcludes(exclude);
    }

    queue = new Item(map.start, map, recursionObject, grammar);
    
    for (; defineState;) {

        switch (defineState) {
        case STATE_START:
            if (!queue) {
                defineState = STATE_END;
                break;
            }

            anchor = queue;
            production = queue.lexeme;
            
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
                queue = item = anchor;
                stopped = false;
                break;
            }

            // connect states
            params++;

            // non-terminal
            if (!stopped && lexeme in ruleIndex) {

                //console.log(lexeme, ' in ', ruleIndex, ' = ', ruleIndex[lexeme]);

                // find recursion
                recursion = item.getRecursionItem(ruleId);
                
                // follow recursion
                if (recursion) {

                    // apply and watch updates
                    recursion.watchItem(item);
                    stopped = true;
                    

                    // follow and end here
                    // for (; rule && rule[0] !== false; rule = rule[2]) {
                    //     ruleId = rule[0];
                    //     lexeme = rule[1];
                    // }
                    // break;

                }
                else {

                    // create recursion
                    recursion = item.createRecursion(ruleId, lexeme);

                    // immediately insert if anchor
                    if (queue === anchor) {
                        queue.insertNextQueue(recursion);

                    }
                    // add to pending
                    else if (pendingRecursion) {
                        pendingRecursion.appendQueue(recursion);
                    }
                    // first pending recursion
                    else {
                        pendingRecursion = recursion;
                    }
                }
                
            }
            
            item = item.point(lexeme);

            // reduce if no more next rules or end of lexer rule
            //if (!stopped) {
                if (!rule || rule[0] === false) {
                    item.reduce(production, params, ruleGroup[ruleId]);
                }
            //}
        
        break;
        case STATE_RULE_END:

            // insert pending recursions
            if (pendingRecursion) {
                queue.appendQueue(pendingRecursion);
            }

            // try next pending
            queue = queue.nextInQueue;
            defineState = STATE_START;

        break;
        }

    }
    
    // build state map
    return true;
    
}

export default define;