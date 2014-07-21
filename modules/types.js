// Holds javascript natives
var natives = {},

    toString = Object.prototype.toString;

hAzzle.extend({

    /**
     * Determine the type of object being tested.
     *
     * @param {Mixed} object
     * @return {String} object type
     */

    type: function (obj) {

        var type = typeof obj;

        if (obj === null) {

            return obj + '';
        }

        switch (type) {
        case 'boolean':
            return 'boolean';
        case 'object':
            return 'object';
        case 'string':
            return 'string';
        default:

            var str = toString.call(obj);

            if (natives[str]) {
                return natives[str];
            }

            return type;
        }
    },

    is: function (kind, obj) {

        if (hAzzle.isArray(kind)) {

            return hAzzle.inArray(kind, this.type(obj)) >= 0;
        }

        // Return a boolean if typeof obj is exactly type.

        return typeof obj === kind;
    },

    isEmpty: function (value) {

        return typeof value === 'undefined' || value === '' || value === null || value !== value;
    },

    // Determines if a reference is an `Object`

    isObject: function (value) {

        return value !== null && typeof value === 'object';
    },

    // Determines if a reference is a `Number`.

    isNumber: function (value) {
        return typeof value === 'number';
    },

    // Determines if a reference is a `String`.

    isString: function (value) {
        return typeof value === 'string';
    },

    // Determines if a reference is a `Function`.

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

    //  Checks if `obj` is a window object.

    isWindow: function (obj) {
        return obj !== null && obj === obj.window;
    },

    isDocument: function (obj) {
        return obj.nodeType && obj.nodeType === 9;
    },

    isBody: function (el) {
        return el && el.nodeName.toUpperCase() === 'BODY';
    },

    isHtml: function (el) {
        return el && el.nodeName.toUpperCase() === 'HTML';
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