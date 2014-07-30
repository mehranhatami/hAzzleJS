/**
 * A handfull Usefull functions for the hAzzle Object
 */
var slice = Array.prototype.slice,
    push = Array.prototype.push;

hAzzle.extend({
	

    mergeArray: function(arr, results) {

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

    size: function(obj, ownPropsOnly) {
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

    /**
     * Simple function for copy one object over
     * to another object
     */

    shallowCopy: function() {

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

    /*
     * Finds the elements of an array which satisfy a filter function.
     */

    grep: function(elems, callback, invert) {
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
     * Bind a function to a context, optionally partially applying any
     *
     * @param {Function} fn
     * @param {Object} context
     */

    proxy: function(fn, context) {

        var tmp, args, proxy;

        if (typeof context === 'string') {

            tmp = fn[context];
            context = fn;
            fn = tmp;
        }

        if (typeof fn !== 'function') {

            return undefined;
        }

        // Simulated bind
        args = slice.call(arguments, 2);

        proxy = function() {

            return fn.apply(context || this, args.concat(slice.call(arguments)));
        };

        proxy.guid = fn.guid = fn.guid || hAzzle.getID(true, 'proxy_') + ' ';

        return proxy;
    }

}, hAzzle);