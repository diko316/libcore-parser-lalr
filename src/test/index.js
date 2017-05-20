'use strict';

global.main = require("../index.js");

require("./api/define.js");
require("./api/load.js");
require("./api/register-iterator.js");


require("./api/iterator/set.js");
require("./api/iterator/next.js");

require("./api/parser/import.js");
require("./api/parser/export.js");
require("./api/parser/iterator.js");
