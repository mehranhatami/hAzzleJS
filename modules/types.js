var ObjProto = Object.prototype,
    hasOwn = ObjProto.hasOwnProperty,
    // faster then native indexOf
    index_of = function(arr, val) {
        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i] === val) {
                return i;
            }
        }
        return -1;
    };

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

    // test for variable being undefined or null
    isSet: function(v) {
        return v !== null && v !== (void 0);
    },

    isEmpty: function(v) {

        return typeof v === 'undefined' ||
            v === '' ||
            v === null ||
            v !== v;
    },

    // Determines if a reference is an `Object`

    isObject: function(v) {

        return v !== null && typeof v === 'object';
    },

    // Determines if a reference is a `Number`.

    isNumber: function(v) {
        return typeof v === 'number';
    },

    // Determines if a reference is a `String`.

    isString: function(v) {
        return typeof v === 'string';
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

    isBoolean: function(value) {
        return value === true || value === false;
    },

    isDefined: function(value) {
        return typeof value !== 'undefined';
    },

    isUndefined: function(value) {
        return typeof value === 'undefined';
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
    },
    // test for containment, in both arrays and objects

    isInside: function(container, val) {
        if (Array.isArray(container)) {
            return index_of(container, val) > -1;
        } else if (hAzzle.isObject(container)) {
            for (var prop in container) {
                if (hasOwn.call(container, prop) && container[prop] === val) {
                    return true;
                }
            }
            return false;
        } else {
            return false;
        }
    },
    // duck typing, because there isn't really a good way to do this
    isRegExp: function(r) {
        return !!(r && r.test && r.exec && (r.ignoreCase || r.ignoreCase === false));
    },

    // plain objects - not a specific type, just an object with key/value pairs
    // https://github.com/jquery/jquery/blob/c14a6b385fa419ce67f115e853fb4a89d8bd8fad/src/core.js#L425-452
    isHash: function(o) {
        // fail fast for falsy/non-object/HTMLElement/window objects
        // also check constructor properties - objects don't have their own constructor,
        // and their constructor does not have its own `isPrototypeOf` function
        if (!o || typeof o !== 'object' || hAzzle.isElement(o) || (typeof window !== 'undefined' && o === window) ||
            (o.constructor && !hasOwn.call(o, 'constructor') && !hasOwn.call(o.constructor.prototype, 'isPrototypeOf'))
        ) {
            return false;
        }

        // from jQuery source: speed up the test by cycling to the last property,
        // since own properties are iterated over first and therefore the last one will
        // indicate the presence of any prototype properties
        for (var key in o) {}
        return (key === undefined || hasOwn.call(o, key));
    }

}, hAzzle);

/* =========================== INTERNAL ========================== */

// Add some isType methods
hAzzle.each(['File', 'Blob', 'Date', 'Arguments', 'Function'], function(name) {
    hAzzle['is' + name] = function(o) {
        return Object.prototype.toString.call(o) === '[object ' + name + ']';
    };
});