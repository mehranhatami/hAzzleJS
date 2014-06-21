/**
 * A handfull Usefull functions for the hAzzle Object
 */
 
 
/* =========================== PUBLIC FUNCTIONS ========================== */

var slice = Array.prototype.slice,
    breaker = {};

hAzzle.extend({
    
	/**
	 * Simple function for copy one object over
	 * to another object
	 */
	 
    shallowCopy: function(target, src) {
       hAzzle.forOwn(src, function (prop) {
       target[prop] = src[prop];
    });

    return targetObj;
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