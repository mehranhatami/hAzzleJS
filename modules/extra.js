/**
 * A handfull Usefull functions for the hAzzle Object
 */
var slice = Array.prototype.slice,
    push = Array.prototype.push;

hAzzle.extend({

    mergeArray: function (arr, results) {

        var ret = results || [];

        if (arr !== null) {

            if (hAzzle.isArraylike(Object(arr))) {

                hAzzle.merge(ret, hAzzle.isString(arr) ? [arr] : arr);

            } else {

                push.call(ret, arr);
            }
        }

        return ret;
    },

    // Convert sstr to decimal value	
    decimal: function (str) {
        var match = str.match(/^(\d+)%?$/i);
        if (!match) return null;
        return (Number(match[1]) / 100);
    },

    size: function (obj, ownPropsOnly) {
        var count = 0,
            key;

        if (hAzzle.isArray(obj) || hAzzle.isString(obj)) {
            return obj.length;
        } else if (hAzzle.isObject(obj)) {
            for (key in obj)
                if (!ownPropsOnly || obj.hasOwnProperty(key))
                    count++;
        }

        return count;
    },

    keys: function (obj) {

        // It has to be an Object

        if (hAzzle.type(obj) !== 'object') {
            return [];
        }
        var results = [],
            key, has = Object.prototype.hasOwnProperty;

        for (key in obj) {
            if (has.call(obj, key)) {
                results.push(key);
            }
        }

        return results;
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

    shallowCopy: function () {

        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === 'boolean') {

            deep = target;

            target = arguments[i] || {};
            i++;
        }

        if (typeof target !== 'object' && !hAzzle.isFunction(target)) {

            target = {};
        }

        if (i === length) {
            target = this;
            i--;
        }

        for (; i < length; i++) {

            if ((options = arguments[i]) !== null) {
                // Extend the base object
                for (name in options) {
                    src = target[name];
                    copy = options[name];

                    // Prevent never-ending loop
                    if (target === copy) {
                        continue;
                    }

                    // Recurse if we're merging plain objects or arrays
                    if (deep && copy && (hAzzle.isPlainObject(copy) || (copyIsArray = hAzzle.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && hAzzle.isArray(src) ? src : [];

                        } else {
                            clone = src && hAzzle.isPlainObject(src) ? src : {};
                        }


                        // Never move original objects, clone them
                        target[name] = hAzzle.extend(deep, clone, copy);

                        // Don't bring in undefined values
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        // Return the modified object
        return target;
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
    }
}, hAzzle);