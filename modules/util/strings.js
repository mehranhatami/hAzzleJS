// strings.js
hAzzle.define('Strings', function() {
    var
    // Save a reference to some core methods

        nTrim = String.prototype.trim,

        // Support: Android<4.1

        nNTrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

        // Hyphenate RegExp

        sHyphenate = /[A-Z]/g,

        // Capitalize RegExp

        sCapitalize = /\b[a-z]/g,

        // Microsoft RegExp

        msPrefix = /^-ms-/,

        // camlize RegExp

        dashAlpha = /-([\da-z])/gi,

        // manualLowercase regExp

        capitalizedChars = /[A-Z]/g,

        // manualUppercase regExp

        nonCapitalizedChars = /[a-z]/g,

        // Cache array for hAzzle.camelize()

        camelCache = [],

        // Used by hAzzle.capitalize as callback to replace()

        fcapitalize = function(letter) {
            return letter.toUpperCase();
        },

        // Used by hAzzle.camelize as callback to replace()

        fcamelize = function(all, letter) {
            return letter.toUpperCase();
        },
        // Used by hAzzle.hyphenate as callback to replace()

        fhyphenate = function(letter) {
            return ('-' + letter.charAt(0).toLowerCase());
        },

        // Converts the specified string to lowercase.

        lowercase = function(str) {
            return typeof str === 'string' ? str.toLowerCase() : str;
        },
        // Converts the specified string to uppercase
        uppercase = function(str) {
            return typeof str === 'string' ? str.toUpperCase() : str;
        },
        manualLowercase = function(str) {
            /* jshint bitwise: false */
            return typeof str === 'string' ? str.replace(capitalizedChars, function(ch) {
                return String.fromCharCode(ch.charCodeAt(0) | 32);
            }) : str;
        },
        manualUppercase = function(str) {
            /* jshint bitwise: false */
            return typeof str === 'string' ? str.replace(nonCapitalizedChars, function(ch) {
                return String.fromCharCode(ch.charCodeAt(0) & ~32);
            }) : str;
        },

        capitalize = function(str) {
            return str ? str.replace(sCapitalize, fcapitalize) : str;
        },

        // Convert a string from camel case to "CSS case", where word boundaries are
        // described by hyphens ("-") and all characters are lower-case.
        // e.g. boxSizing -> box-sizing

        hyphenate = function(str) {
            return str ? str.replace(sHyphenate, fhyphenate) : str;
        },

        // Convert a string to camel case notation.
        // Support: IE9-11+
        camelize = function(str) {
            if (str) {
                return camelCache[str] ? camelCache[str] :
                    camelCache[str] = str.replace(msPrefix, "ms-").replace(dashAlpha, fcamelize);
            }
            return str;
        },

        // Remove leading and trailing whitespaces of the specified string.

        trim = function(str) {
            return str == null ? '' : nTrim ? (typeof str === 'string' ? str.trim() : str) :
                // Any idiots still using Android 4.1 ?
                (str + '').replace(nNTrim, '');
        };

    // Credit: AngularJS    
    // String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
    // locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
    // with correct but slower alternatives.

    if ('i' !== 'I'.toLowerCase()) {
        lowercase = manualLowercase;
        uppercase = manualUppercase;
    }

    return {

        capitalize: capitalize,
        hyphenate: hyphenate,
        camelize: camelize,
        trim: trim,
        lowercase: lowercase,
        uppcase: uppercase,
        manualLowercase: manualLowercase,
        manualUppercase: manualUppercase,
    };
});