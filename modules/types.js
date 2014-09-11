// Local references to global functions (better minification)
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
    },

    // Global 'is' object

    is = {};

is.String = function(s) {
    return (typeof s === 'string') || s instanceof String;
};
is.Number = function(n) {
    return (typeof n === 'number') || n instanceof Number;
};
is.Boolean = function(b) {
    return b === !!b || b instanceof Boolean;
};

// array - delegates to builtin if available
is.Array = Array.isArray;
// basically all Javascript types are objects
is.Object = function(o) {
    return o !== null && typeof o === 'object';
};

// duck typing, because there isn't really a good way to do this
is.Regex = function(r) {
    return !!(r && r.test && r.exec && (r.ignoreCase || r.ignoreCase === false));
};

// HTML elements
is.Element = function(e) {
    return e(e.nodeType === 1 || e.nodeType === 9);
}

// non-strict type checking
// http://dl.dropbox.com/u/35146/js/tests/isNumber.html
is.Numeric = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

// plain objects - not a specific type, just an object with key/value pairs
// https://github.com/jquery/jquery/blob/c14a6b385fa419ce67f115e853fb4a89d8bd8fad/src/core.js#L425-452
is.Hash = function(o) {
    // fail fast for falsy/non-object/HTMLElement/window objects
    // also check constructor properties - objects don't have their own constructor,
    // and their constructor does not have its own `isPrototypeOf` function
    if (!o || typeof o !== 'object' || is.element(o) || (typeof window !== 'undefined' && o === window) ||
        (o.constructor && !hasOwn.call(o, 'constructor') && !hasOwn.call(o.constructor.prototype, 'isPrototypeOf'))
    ) {
        return false;
    }

    // from jQuery source: speed up the test by cycling to the last property,
    // since own properties are iterated over first and therefore the last one will
    // indicate the presence of any prototype properties
    for (var key in o) {}
    return (key === undefined || hasOwn.call(o, key));
};

is.EmptyObject = function(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
};

// test for containment, in both arrays and objects
is.Inside = function(container, val) {
    if (is.Array(container)) {
        return index_of(container, val) > -1;
    } else if (is.Object(container)) {
        for (var prop in container) {
            if (hasOwn.call(container, prop) && container[prop] === val) {
                return true;
            }
        }
        return false;
    } else {
        return false;
    }
};

// test for variable being undefined or null
is.Set = function(v) {
    return v !== null && v !== (void 0);
};

// test for having any elements (if an array), any properties (if an object), or falsy-ness
is.Empty = function(v) {

    return typeof v === 'undefined' || v === '' || v === null || v !== v;
};

is.Document = function(o) {
    return o.nodeType && o.nodeType === 9;
};

is.Body = function(el) {
    return el && el.nodeName.toUpperCase() === 'BODY';
};

is.Html = function(el) {
    return el && el.nodeName.toUpperCase() === 'HTML';
};

is.Defined = function(v) {
    return typeof v !== 'undefined';
};

is.Undefined = function(v) {
    return typeof v === 'undefined';
};

is.NaN = function(v) {
    return typeof v === 'number' && v !== +v;
};

is.Null = function(elem) {
    return elem == 'null';
};

is.Node = function(elem) {
    return !!elem && typeof elem == 'object' && 'nodeType' in elem;
};
is.Text = function(elem) {
    return elem && elem.nodeType === 3;
};
is.Fragment = function(elem) {
    return elem && elem.nodeType === 11;
};

is.NodeList = function(obj) {
    return obj && hAzzle.is([
        'nodelist',
        'htmlcollection',
        'htmlformcontrolscollection'
    ], obj);
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
    }

}, hAzzle);

hAzzle.each(is, function(func, name) {
    hAzzle['is' + name] = func;
});

/* =========================== INTERNAL ========================== */

// Add some isType methods
hAzzle.each(['File', 'Blob', 'RegExp', 'Date', 'Arguments', 'Function'], function(name) {
    hAzzle['is' + name] = function(o) {
        return Object.prototype.toString.call(o) === '[object ' + name + ']';
    };
});