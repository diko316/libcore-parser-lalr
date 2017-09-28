#!/usr/bin/env node
'use strict';

// use umd
var libcore = require("libcore"),
    file = require("./file.js"),
    processArguments = require("./arguments.js"),
    Parser = require("../dist/libcore-parser-lalr.js"),
    params = processArguments([
                    'source',
                    'target'
                ],
                {
                    'o': "whatO",
                    'g': ["whatG", 2]
                }),
    source = params.source,
    target = params.target,
    definition = null;

var rules, root, ignore, parser;

function showHelp() {
    console.error(file.read(file.normalize(__dirname, 'manual.txt')));
}

function exitScript(message, code) {

    code = libcore.number(code) ? code : 0;

    if (code !== 0) {
        showHelp();
    }
    
    if (libcore.string(message)) {
        console.error(message + "\r\n");
    }
    
    process.exit(code);
}


// Read source file
if (!source) {
    exitScript("Requires [source] argument.", 1);
}

source = file.normalize(source);
if (!file.isReadable(source)) {
    exitScript("Unable to read [source] file " + source, 2);
}

try {
    definition = require(source);
}
catch (e) {
    exitScript("Invalid Javascript [source] file " + source, 3);
}

if (!libcore.object(definition)) {
    exitScript("Invalid Parser Definition Object in [source] file " + source, 4);
}

rules = definition.rules;
root = definition.root;
ignore = definition.ignore;

if (!libcore.array(rules) || !libcore.string(root)) {
    exitScript("Invalid Parser Definition Object in [source] file " + source, 4);
}

parser = libcore.array(ignore) ?
            Parser.define(root, rules, ignore) :
            Parser.define(root, rules);



if (!file.mkdir(file.normalize('diko/buang/test/test'))) {
    console.log("failed creating directory: ", file.normalize('diko/buang/test/test'));
}

// Export to file or print
if (target) {
    target = file.normalize(target);
    
    if (!file.write(target, parser.toJSON())) {
        exitScript("Unable to write to [target] file: " + target, 5);
    }

    exitScript("Successfully written to [target] file: " + target);

}


process.stdout.write(parser.toJSON());
