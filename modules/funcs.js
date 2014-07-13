/**
 * A handfull Usefull functions for the hAzzle Object
 */
/* =========================== PUBLIC FUNCTIONS ========================== */

var slice = Array.prototype.slice;

hAzzle.extend({

    keys: function (obj) {
        var keys = [],
            key, has = Object.prototype.hasOwnProperty;

        for (key in obj) {
            if (has.call(obj, key)) {
                keys.push(key);
            }
        }

        return keys;
    },


    sortKeys: function (obj) {
        var keys = [],
            key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys.sort();
    },

    reverseParams: function (iteratorFn) {
        return function (value, key) {
            iteratorFn(key, value);
        };
    },


    lastIndexOf: function (array, item, from) {
        if (array === null) {
            return -1;
        }
        var hasIndex = from !== null,
            i = (hasIndex ? from : array.length);
        while (i--) {
            if (array[i] === item) {
                return i;
            }
        }
        return -1;
    },

    bind: function (scope, fn) {
        var args = arguments.length > 2 ? slice.call(arguments, 2) : null;
        return function () {
            return fn.apply(scope, args ? args.concat(slice.call(arguments)) : arguments);
        };
    },

    curry: function curry(fn) {

        if (arguments.length == 1) {
            return fn;
        }

        var args = slice.call(arguments, 1);
		
        return function () {
            return fn.apply(null, args.concat(slice.call(arguments)));
        };
    },

    /**
     * Simple function for copy one object over
     * to another object
     */

    shallowCopy: function (src, target) {
        var i = 0;

        if (hAzzle.isArray(src)) {

            target = target || [];

            for (; i < src.length; i++) {

                target[i] = src[i];
            }

        } else if (hAzzle.isObject(src)) {

            target = target || {};

            var keys = Object.keys(src),
                key, l = keys.length;

            for (; i < l; i++) {
                key = keys[i];
                target[key] = src[key];
            }
        }

        return target || src;
    },

    pluck: function (array, property) {
        return array.map(function (item) {
            return item[property];
        });
    },

    rand: function (x, y) {
        if (typeof x === 'undefined') {
            y = +x;
            x = 0;
        }
        return Math.rand(x, y);
    },

    /*
     * Finds the elements of an array which satisfy a filter function.
     */

    grep: function (elems, callback, invert) {
        var cbi,
            matches = [],
            i = 0,
            l = elems.length,
            cbE = !invert;

        // Go through the array, only saving the items
        // that pass the validator function
        for (; i < l; i++) {
            cbi = !callback(elems[i], i);
            if (cbi !== cbE) {
                matches.push(elems[i]);
            }
        }

        return matches;
    },

    /**
     * @param {hAzzle|Array} ar
     * @param {function(Object, number, (hAzzle|Array))} fn
     * @param {Object=} scope
     * @return {boolean||nothing}
     */

    some: function (ar, fn, scope) {
        var i = 0,
            j = ar.length;

        for (; i < j; ++i) {

            if (fn.call(scope || null, ar[i], i, ar)) {

                return true;
            }
        }

        return false;
    },

    /**
     * Return the number of elements in an object.
     */

    size: function (obj) {
        if (obj === null) {

            return 0;
        }
        return (obj.length === +obj.length) ? obj.length : Object.keys(obj).length;
    },

}, hAzzle);