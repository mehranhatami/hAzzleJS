/**
 * A handfull Usefull functions for the hAzzle Object
 */
/* =========================== PUBLIC FUNCTIONS ========================== */
var slice = Array.prototype.slice,
    breaker = {};

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

    bind: function (func, context) {
        var args, bound;

        if (typeof func === 'function') {

            hAzzle.error("Not supported!");
        }

        args = slice.call(arguments, 2);

        return bound = function () {
            if (!(this instanceof bound)) {
                return func.apply(context, args.concat(slice.call(arguments)));
            }
            ctor.prototype = func.prototype;
            var self = new ctor();
            ctor.prototype = null;
            var result = func.apply(self, args.concat(slice.call(arguments)));
            if (Object(result) === result) {
                return result;
            }
            return self;
        };
    },

    /**
     * Simple function for copy one object over
     * to another object
     */

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

    // Exact

    exact: function (elem, attribute) {
        return elem.getAttribute(attribute, 2);
    },

    setChecked: function (elem, value) {
        elem.checked = !!value;
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

    // Invoke a method (with arguments) on every item in a collection.

    invoke: function (obj, method) {

        var args = slice.call(arguments, 2);

        return hAzzle.map(obj, function (value) {

            if (typeof method === 'function') {

                return method.apply(value, args);

            } else {

                return value[method].apply(value, args);
            }
        });
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

    // Keep the identity function around for default iterators.

    identity: function (value) {
        return value;
    },

    /**
     * Determine whether all of the elements match a truth test.
     */

    every: function (obj, predicate, context) {

        predicate = predicate || hAzzle.identity;

        var result = true;
        if (obj === null) {
            return result;
        }
        hAzzle.each(obj, function (value, index, list) {

            if (!(result = result && predicate.call(context, value, index, list))) {
                return breaker;
            }
        });
        return !!result;
    },

    /**
     *  Determine if at least one element in the object matches a truth test.
     */

    any: function (obj, predicate, context) {

        predicate = predicate || hAzzle.identity;
        var result = false;
        if (obj === null) {
            return result;
        }
        hAzzle.each(obj, function (value, index, list) {
            if (result || (result = predicate.call(context, value, index, list))) {
                return breaker;
            }
        });
        return !!result;
    },

    max: function (obj, iterator, context) {
        if (!iterator && hAzzle.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
            return Math.max.apply(Math, obj);
        }
        var result = -Infinity,
            lastComputed = -Infinity;
        hAzzle.each(obj, function (value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            if (computed > lastComputed) {
                result = value;
                lastComputed = computed;
            }
        });
        return result;
    },

    min: function (obj, iterator, context) {
        if (!iterator && hAzzle.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
            return Math.min.apply(Math, obj);
        }
        var result = Infinity,
            lastComputed = Infinity;
        hAzzle.each(obj, function (value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            if (computed < lastComputed) {
                result = value;
                lastComputed = computed;
            }
        });
        return result;
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

// Reusable constructor function for prototype setting.
var ctor = function () {};