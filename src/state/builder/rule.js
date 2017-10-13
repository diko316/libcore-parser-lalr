'use strict';

import {
            regex,
            string,
            array
        } from "libcore";

var LEXEME_RE = /^([A-Z][a-zA-Z]+(\_?[a-zA-Z0-9])*|\$end|\$)$/;

export
    function isTerminal(name) {
        return name === "$" || !LEXEME_RE.test(name);
    }

export 
    function defineTerminals(registry, name, definitions) {
        var isRegex = regex;
        var c, l, terminal;

        for (c = -1, l = definitions.length; l--;) {
            terminal = definitions[++c];

            if (!isRegex(terminal)) {
                throw new Error("Invalid Terminal pattern: " + terminal);
            }

            if (!registry.registerTerminal(terminal, name)) {
                throw new Error("Invalid Terminal pattern: " + terminal);
            }

        }

    }



export 
    function defineRules(registry, name, definitions) {
        var isString = string,
            isRegex = regex,
            isArray = array,
            isTerm = isTerminal;

        var c, l, rl, rule, lexeme, ruleMask, terminals;

        for (c = -1, l = definitions.length; l--;) {
            rule = definitions[++c];
            if (isString(rule) || isRegex(rule)) {
                rule = [rule];
            }
            else if (!isArray(rule)) {
                throw new Error("Invalid Grammar rule declared in " + name);
            }

            //console.log("define rules: ", name, " definitions ", rule);

            // create rule mask
            rl = rule.length;
            ruleMask = [];
            terminals = {};

            for (; rl--;) {
                lexeme = rule[rl];

                if (isRegex(lexeme)) {

                    if (!registry.terminalExist(lexeme)) {
                        registry.registerTerminal(lexeme);
                    }

                    lexeme = '/' + lexeme.source + '/';
                }
                else if (!isString(lexeme)) {
                    throw new Error("Invalid Grammar rule declared in " + name);
                }

                ruleMask[rl] = registry.hashLexeme(lexeme);
                if (isTerm(lexeme)) {
                    terminals[rl] = true;
                }
            }

            // define states from ruleMask
            registry.registerRule(name, ruleMask, terminals);
            //console.log(name, " ruleMask: ", ruleMask);


        }



    }