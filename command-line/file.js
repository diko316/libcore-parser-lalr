'use strict';

var PATH = require('path'),
    libcore = require('libcore'),
    fs = require('fs'),
    EXECUTABLE = 1,
    WRITABLE = 2,
    READABLE = 4;

function normalizePath(path) {
    var hpath = PATH,
        cwd = process.cwd(),
        isString = libcore.string;
    var l, item;

    if (arguments.length > 1) {
        path = Array.prototype.slice.call(arguments, 0);

        for (l = path.length; l--;) {
            item = path[l];
            if (!isString(item)) {
                path.splice(l, 1);
            }
        }
        path = hpath.join.apply(hpath, path);
    }

    return isString(path, true) ?
                path ?
                    hpath.isAbsolute(path) ?
                        path : 
                        hpath.resolve(cwd, path) :
                    cwd :
                null;
}

function readStat(path) {
    var stat = null;
    if (libcore.string(path)) {
        try {
            stat = fs.statSync(path);
        }
        catch (e) {}
    }
    return new Stat(stat, path);
}

function readFile(path, raw) {
    var stat = readStat(path);

    if (stat.isFile() && stat.isReadable()) {
        if (raw === true) {
            return fs.readFileSync(path);

        }
        
        if (!libcore.string(raw)) {
            raw = 'utf8';
        }
        
        return fs.readFileSync(path, raw);
    }
    
    return void(0);
}

function writeFile(path, data, encoding) {
    var hpath = PATH,
        dir = hpath.dirname(path);

    // ensure directory exist
    if (!mkdir(dir) || isDirectory(path)) {
        return false;
    }

    if (!libcore.string(encoding)) {
        encoding = 'utf8';
    }

    try {
        fs.writeFileSync(path,
                        data,
                        { encoding: encoding });
    }
    catch (e) {
        return false;
    }

    return true;
}

function mkdir(path) {
    var hpath = PATH,
        sep = hpath.sep,
        parts = hpath.normalize(path).split(sep),
        total = parts.length,
        l = total,
        from = false,
        to = false;
    var toWrite, left, c, item;

    for (; l--;) {

        toWrite = l + 1;
        left = parts.slice(0, toWrite).join(sep);

        // unable to overwrite
        if (isFile(left)) {
            return false;

        }
        else if (isDirectory(left)) {

            if (left === path) {
                return true;
            }

            from = left;
            to = parts.slice(toWrite, total);
            break;
        }
        
    }

    // create!
    if (to) {
        c = -1;
        l = to.length;
        for (; l--;) {
            from = hpath.join(from, to[++c]);
            try {
                fs.mkdirSync(from);
            }
            catch (e) {
                return false;
            }
        }
    }

    return isDirectory(path);
}

function isDirectory(path) {
    var stat = readStat(path);
    return !!stat && stat.isDirectory(path);
}

function isFile(path) {
    var stat = readStat(path);
    return !!stat && stat.isFile(path);
}

function isReadable(path) {
    var stat = readStat(path);
    return !!stat && stat.isReadable();
}

function isWritable(path) {
    var stat = readStat(path);
    return !!stat && stat.isWritable();
}

function isExecutable(path) {
    var stat = readStat(path);
    return !!stat && stat.isExecutable();
    
}

function Stat(stat, path) {
    this.stat = stat;
    this.path = stat && libcore.string(path) ?
                    path : null;

}
Stat.prototype = {
    isFile: function () {
        var stat = this.stat;
        return !!stat && stat.isFile();
    },
    isDirectory: function () {
        var stat = this.stat;
        return !!stat && stat.isDirectory();
    },
    isBlockDevice: function () {
        var stat = this.stat;
        return !!stat && stat.isBlockDevice();
    },
    isCharacterDevice: function () {
        var stat = this.stat;
        return !!stat && stat.isCharacterDevice();
    },
    isSymbolicLink: function () {
        var stat = this.stat;
        return !!stat && stat.isSymbolicLink();
    },
    isFIFO: function () {
        var stat = this.stat;
        return !!stat && stat.isFIFO();
    },
    isSocket: function () {
        var stat = this.stat;
        return !!stat && stat.isSocket();
    },

    getDecimalAccess: function () {
        var stat = this.stat;
        if (stat) {
            stat = stat.mode & 511;

            return [
                stat & 7,
                (stat >> 3) & 7,
                (stat >> 6) & 7
            ];
        }

        return [0, 0, 0];
    },

    isWritable: function () {
        return !!(this.getDecimalAccess()[0] & WRITABLE);
    },

    isReadable: function () {
        return !!(this.getDecimalAccess()[0] & READABLE);
    },

    isExecutable: function () {
        return !!(this.getDecimalAccess()[0] & EXECUTABLE);
    }
};

module.exports = {
    normalize: normalizePath,
    stat: readStat,
    read: readFile,
    write: writeFile,
    isReadable: isReadable,
    isWritable: isWritable,
    isExecutable: isExecutable,
    mkdir: mkdir
};