hAzzle.extend({

    legalTypes: function(elem) {

        if (elem && (elem.nodeType === 1 ||
            elem.nodeType === 9 ||
            !elem.hasOwnProperty('nodeType'))) {
            return true;
        }

        return false;
    },

    is: function(kind, obj) {

        if (hAzzle.isArray(kind)) {

            return hAzzle.inArray(kind, this.type(obj)) >= 0;
        }

        // Return a boolean if typeof obj is exactly type.

        return typeof obj === kind;
    },

    isEmpty: function(val) {
        return typeof val === 'undefined' ||
            val === '' ||
            val === null ||
            val !== val;
    },

    // Determines if a reference is an `Object`

    isObject: function(val) {
        return val !== null && typeof val === 'object';
    },

    // Determines if a reference is a `Number`.

    isNumber: function(val) {
        return typeof val === 'number';
    },

    // Determines if a reference is a `String`.

    isString: function(val) {
        return typeof val === 'string';
    },

    isEmptyObject: function(obj) {
        var name;
        for (name in obj) {
            return false;
        }
        return true;
    },
    isNumeric: function(obj) {
        return !hAzzle.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;

    },

    isBlank: function(str) {
        return hAzzle.trim(str).length === 0;
    },

    isArray: Array.isArray,

    isDocument: function(obj) {
        return obj.nodeType && obj.nodeType === 9;
    },

    isBody: function(el) {
        return el && el.nodeName.toUpperCase() === 'BODY';
    },

    isHtml: function(el) {
        return el && el.nodeName.toUpperCase() === 'HTML';
    },

    isBoolean: function(val) {
        return val === true || val === false;
    },

    isDefined: function(val) {
        return typeof val !== 'undefined';
    },

    isUndefined: function(val) {
        return typeof val === 'undefined';
    },

    IsNaN: function(val) {
        return typeof val === 'number' && val !== +val;
    },

    isElement: function(elem) {
        return elem && (elem.nodeType === 1 || elem.nodeType === 9);
    },
    isNull: function(elem) {
        return elem == 'null';
    },

    isNode: function(elem) {
        return !!elem && typeof elem == 'object' && 'nodeType' in elem;
    },
    isText: function(elem) {
        return elem && elem.nodeType === 3;
    },
    isFragment: function(elem) {
        return elem && elem.nodeType === 11;
    },

    isNodeList: function(obj) {
        return obj && hAzzle.is([
            'nodelist',
            'htmlcollection',
            'htmlformcontrolscollection'
        ], obj);
    }

}, hAzzle);

/* =========================== INTERNAL ========================== */

// Add some isType methods
hAzzle.each(['File', 'Blob', 'RegExp', 'Date', 'Arguments', 'Function'], function(name) {
    hAzzle['is' + name] = function(o) {
        return hAzzle.natives.toString.call(o) === '[object ' + name + ']';
    };
});