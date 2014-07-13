// types
/**
 * Holds javascript natives
 */
var natives = {},
    toString = Object.prototype.toString,
	iews = /^\s*$/;

hAzzle.extend({
    /**
     * Determine the type of object being tested.
     *
     * @param {Mixed} object
     * @return {String} object type
     */

    type: function (obj) {

        if (obj === null) {

            return obj + '';
        }

        if (typeof obj === 'undefined') {

            return 'undefined';
        }

        if (typeof obj === 'object') {

            return 'object';
        }

        var str = toString.call(obj);

        if (natives[str]) {
            return natives[str];
        }

        return typeof obj;
    },

    /* =========================== 'IS' FUNCTIONS ========================== */

    is: function (kind, obj) {

        if (hAzzle.isArray(kind)) {

            return hAzzle.inArray(kind, this.type(obj)) >= 0;
        }

        // Return a boolean if typeof obj is exactly type.

        return typeof obj === kind;
    },

    /**
     * Checks if an string are empty.
     */

    isEmpty: function (str, ignoreWhitespace) {

        return str === null || !str.length || ignoreWhitespace && iews.test(str);
    },

    isObject: function (obj) {
        return obj !== null && typeof obj === 'object';
    },

    isNumber: function (value) {
        return typeof value === 'number';
    },

    isString: function (value) {
        return typeof value === 'string';
    },

    isFunction: function (value) {
        return typeof value === 'function';

    },

    isEmptyObject: function (obj) {
        var name;
        for (name in obj) {
            return false;
        }
        return true;
    },
    isNumeric: function (obj) {
        return !hAzzle.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;

    },




    isBlank: function (str) {
        return hAzzle.trim(str).length === 0;
    },

    isArray: Array.isArray,

    isWindow: function (obj) {
        return obj !== null && obj === obj.window;
    },

    isDocument: function (obj) {
        return obj !== null && obj.nodeType === obj.DOCUMENT_NODE;
    },

    isNull: function (obj) {
        return obj === null;
    },

    isBoolean: function (value) {
        return value === true || value === false;
    },

    isDefined: function (value) {
        return typeof value !== 'undefined';
    },

    isUndefined: function (value) {
        return typeof value === 'undefined';
    },

    IsNaN: function (val) {
        return typeof val === 'number' && val !== +val;
    },

    isElement: function (elem) {
        return elem && (elem.nodeType === 1 || elem.nodeType === 9);
    },

    isNodeList: function (obj) {
        return obj && hAzzle.is([
            'nodelist',
            'htmlcollection',
            'htmlformcontrolscollection'
        ], obj);
    }
}, hAzzle);


/* =========================== INTERNAL ========================== */

// Populate the native list
hAzzle.each('Boolean String Function Array Date RegExp Object Error Arguments'.split(' '), function (name) {
    natives['[object ' + name + ']'] = name.toLowerCase();
});

// Add some isType methods
hAzzle.each(['File', 'Blob', 'RegExp', 'Date', 'Arguments'], function (name) {
    hAzzle['is' + name] = function (o) {
        return toString.call(o) === '[object ' + name + ']';
    };
});