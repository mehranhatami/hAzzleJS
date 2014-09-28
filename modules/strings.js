// strings.js
var
// Save a reference to some core methods

    trim = String.prototype.trim,

    sTrwl = /^\s+|\s+$/g,

    // Hyphenate RegExp

    sHyphenate = /[A-Z]/g,

    // Capitalize RegExp

    sCapitalize = /\b[a-z]/g,

    // Cache array for hAzzle.camelize()

    camelCache = [],

    // Converts the specified string to lowercase.

    lowercase = function(string) {
        return typeof string === 'string' ? string.toLowerCase() : string;
    },
    // Converts the specified string to uppercase
    uppercase = function(string) {
        return typeof string === 'string' ? string.toUpperCase() : string;
    },

    manualLowercase = function(s) {
        /* jshint bitwise: false */
        return typeof s === 'string' ? s.replace(/[A-Z]/g, function(ch) {
            return String.fromCharCode(ch.charCodeAt(0) | 32);
        }) : s;
    },
    manualUppercase = function(s) {
        /* jshint bitwise: false */
        return typeof s === 'string' ? s.replace(/[a-z]/g, function(ch) {
            return String.fromCharCode(ch.charCodeAt(0) & ~32);
        }) : s;
    };

hAzzle.extend({

    capitalize: function(str) {
        return str.replace(sCapitalize, function(match) {
            return match.toUpperCase();
        });
    },

    // Convert camelCase to hyphenate
    // e.g. boxSizing -> box-sizing

    hyphenate: function(str) {
        if (str) {
            return str.replace(sHyphenate, function(match) {
                return ('-' + match.charAt(0).toLowerCase());
            });
        }
        return str;
    },

    // Convert dashed to camelCase

    camelize: function(str) {
        if (str) {
            return camelCache[str] ? camelCache[str] :
                camelCache[str] = str.replace(/-\D/g, function(match) {
                    return match.charAt(1).toUpperCase();
                });
        }
        return str;
    },

    // Remove leading and trailing whitespaces of the specified string.

    trim: function(str) {
        return trim ? (typeof str === 'string' ? str.trim() : str) :
            str.replace(sTrwl, '');
    },

    lowercase: lowercase,
    uppcase: uppercase

}, hAzzle);


// Credit: AngularJS    
// String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
// locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
// with correct but slower alternatives.

if ('i' !== 'I'.toLowerCase()) {
    lowercase = manualLowercase;
    uppercase = manualUppercase;
}