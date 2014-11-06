// strings.js
hAzzle.include(function() {
    var
    // Aliasing to the native function

        nTrim = String.prototype.trim,

        // Support: Android<4.1

        nNTrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

        // Hyphenate RegExp

        sHyphenate = /[A-Z]/g,

        // UnescapeHTML RegExp

        unEscapeFirst = /^#x([\da-fA-F]+)$/,

        // UnescapeHTML RegExp

        unEscapeLast = /^#(\d+)$/,

        // escapeHTML regExp

        escHTML = /[&<>"']/g,

        // Microsoft RegExp

        msPrefix = /^-ms-/,

        // camlize RegExp

        dashAlpha = /-([\da-z])/gi,

        // Cache array for hAzzle.camelize()

        camelCache = [],

        escapeMap = {
            lt: '<',
            gt: '>',
            quot: '"',
            apos: "'",
            amp: '&'
        },

        reversedescapeMap = {},

        // Used by camelize as callback to replace()

        fcamelize = function(all, letter) {
            return letter.toUpperCase();
        },
        // Used by hyphenate as callback to replace()

        fhyphenate = function(letter) {
            return ('-' + letter.charAt(0).toLowerCase());
        },

        capitalize = function(str) {
           return str && typeof str === 'string' ? str.charAt(0).toUpperCase() + str.slice(1) : '';
        },
        unCapitalize = function(str) {
           return str && typeof str === 'string' ? str.charAt(0).toLowerCase() + str.slice(1) : '';
        },

        // Convert a string from camel case to 'CSS case', where word boundaries are
        // described by hyphens ('-') and all characters are lower-case.
        // e.g. boxSizing -> box-sizing

        hyphenate = function(str) {
            if (typeof str === 'string') {
                return str ? str.replace(sHyphenate, fhyphenate) : str;
            } else {
                str = typeof str === 'number' ? '' + str : '';
            }
            return str ? ('data-' + str.toLowerCase()) : str;
        },

        // Convert a string to camel case notation.
        // Support: IE9-11+
        camelize = function(str) {
            if (str && typeof str === 'string') {

                return camelCache[str] ? camelCache[str] :
                    // Remove data- prefix and convert remaining dashed string to camelCase
                    camelCache[str] = str.replace(msPrefix, "ms-").replace(dashAlpha, fcamelize); // -a to A
            }
            // Deal with 'number' and 'boolean'
            return typeof str === 'number' || typeof str === 'boolean' ? '' + str : str;
        },

        // Remove leading and trailing whitespaces of the specified string.

        trim = function(str) {
            return str == null ? '' : nTrim ? (typeof str === 'string' ? str.trim() : str) :
                // Who are still using Android 4.1 ?
                (str + '').replace(nNTrim, '');
        },

        escapeHTML = function(str) {
            return str.replace(escHTML, function(m) {
                return '&' + reversedescapeMap[m] + ';';
            });
        },
        unescapeHTML = function(str) {
            return str.replace(/\&([^;]+);/g, function(entity, entityCode) {
                var m;
                if (entityCode in escapeMap) {
                    return escapeMap[entityCode];
                } else if ((m = entityCode.match(unEscapeFirst))) {
                    return String.fromCharCode(parseInt(m[1], 16));
                } else if ((m = entityCode.match(unEscapeLast))) {
                    return String.fromCharCode(~~m[1]);
                } else {
                    return entity;
                }
            });
        };

    for (var key in escapeMap) {
        reversedescapeMap[escapeMap[key]] = key;
    }
    reversedescapeMap["'"] = '#39';

    return {

        capitalize: capitalize,
        unCapitalize:unCapitalize,
        hyphenate: hyphenate,
        camelize: camelize,
        trim: trim,
        escapeHTML: escapeHTML,
        unescapeHTML: unescapeHTML
    };
});