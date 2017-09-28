'use strict';

var libcore = require("libcore"),
    OPTION_FLAG = 1,
    OPTION_STRING = 2,
    OPTION_LIST = 3;

/******************
 * Returns object containing all gathered options from arguments
 * 
 * options Object schema:
 * 
 * {
 *      // flag option -    sets "propertyName" to true if it exist and
 *      //                  false if it doesn't exist.
 * 
 *      "-option-flag":    propertyName:String,
 * 
 *      // string option -  sets "propertyName" to String value received from
 *      //                  next argument
 * 
 *      "-input":           Array(propertyName:String,
 *                              acceptArguments:Boolean(true))
 * 
 * 
 *      // list option -    sets "propertyName" to Array of accepted next
 *      //                  consecutive arguments limited to "acceptArguments"
 * 
 *      "o":               Array(propertyName:String,
 *                              acceptArguments:Number)
 * }
 * 
 * pieces Array:
 *      
 *      Sets "propertyName" with value sequenced in excess arguments after
 *      options are processed.
 * 
 *      [propertyName:String, propertyName:String...]
 * 
 **/

function populateDefaults(value, optionFlag) {
    
    /* jshint validthis:true */
    var lib = libcore,
        defaults = this.defaults,
        options = this.options,
        properties = this.properties,
        property = null,
        optionType = OPTION_FLAG,
        defaultValue = false;
    var accept;

    // flag option default
    if (lib.string(value)) {
        property = value;
        accept = 0;

    }
    else if (lib.array(value) && value.length === 2) {
        property = value[0];
        accept = value[1];

        if (!lib.number(accept)) {
            accept = 0;

            // string option
            if (accept === true) {
                optionType = OPTION_STRING;
                defaultValue = '';
                accept = 1;
            }
            // else default flag option
            
        }
        // list option
        else {
            optionType = OPTION_LIST;
            defaultValue = [];
        }

    }

    if (property) {
        properties[properties.length] = property;
        defaults[property] = defaultValue;
        options['-' + optionFlag] = {
            property: property,
            type: optionType,
            accept: accept
        };
    }
}


function processArguments(pieces, options) {
    var lib = libcore,
        isString = lib.string,
        typeFlag = OPTION_FLAG,
        typeString = OPTION_STRING,
        typeList = OPTION_LIST,
        args = process.argv.slice(2),
        c = -1,
        len = args.length,
        definitions = {},
        result = {},
        properties = [];

    var item, olen, pc, piecesLeft, definition, value, name, vl, pl;

    
    // set options
    if (lib.object(options)) {
        lib.each(options,
                populateDefaults,
                {
                    properties: properties,
                    options: definitions,
                    defaults: result
                },
                true);
    }

    // set pieces
    if (lib.array(pieces)) {
        for (pc = -1, piecesLeft = pieces.length; piecesLeft--;) {
            name = pieces[++pc];
            if (isString(name)) {
                result[name] = '';
            }
        }
    }
    else {
        pieces = [];
    }
    pc = 0;
    piecesLeft = pieces.length;
    pl = properties.length;

    mainLoop: for (; len--;) {

        item = args[++c];

        // get value from option
        if (item.charAt(0) === '-' && item in definitions) {
            definition = definitions[item];
            name = definition.property;

            switch (definition.type) {
            case typeFlag:
                result[name] = true;
                break;

            case typeString:
                if (len) {
                    break mainLoop;
                }
                len--;
                result[name] = args[++c];
                break;

            case typeList:
                if (!len) {
                    break mainLoop;
                }
                olen = definition.accept;
                value = result[name];
                vl = value.length;

                for (; len-- && olen--;) {
                    value[vl++] = args[++c];
                }

                if (len === -1) {
                    len = 0;
                }
            }
        }
        // pieces
        else if (piecesLeft) {
            --piecesLeft;
            name = pieces[pc++];

            if (isString(name)) {
                properties[pl++] = item;
                result[name] = item;
            }

        }

    }

    return result;

}

module.exports = processArguments;