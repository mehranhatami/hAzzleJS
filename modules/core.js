/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight
 * Version: 0.4
 * Released under the MIT License.
 *
 * Date: 2014-05-03
 */
(function (window, undefined) {

    // hAzzle already defined, leave now

    if (window['hAzzle']) return;

    var

    /**
     * Prototype references.
     */

        ArrayProto = Array.prototype,

        /**
         * Create a reference to some core methods
         */

        push = ArrayProto.push,
        slice = ArrayProto.slice,
        concat = ArrayProto.concat,
        toString = Object.prototype.toString,

        /*
         * Unique ID
         */

        uid = {
            current: 0,
            next: function () {
                var id = ++this.current + '';
                return 'hAzzle_' + id;
            }
        },

        cached = [],

        // Selector caching
        cache = [],

        // Different nodeTypes we are checking against for faster speed

        nodeTypes = {},

        // Main function

        hAzzle = function (sel, ctx) {
            return new hAzzle.fn.init(sel, ctx);
        };

    /**
     * An object used to flag environments/features.
     */

    hAzzle.support = {};

    hAzzle.fn = hAzzle.prototype = {

        init: function (sel, ctx) {
            var elems, i;
            if (sel instanceof hAzzle) return sel;
            if (hAzzle.isString(sel)) {

                if (cache[sel] && !ctx) {

                    // Backup the "elems stack" before we loop through

                    this.elems = elems = cache[sel];

                    // Copy the stack over to the hAzzle object so we can access the Protoype

                    i = this.length = elems.length;

                    while (i--) {

                        this[i] = elems[i];
                    }

                    // Return the hAzzle Object

                    return this;
                }


                this.elems = cache[sel] = hAzzle.select(sel, ctx);

            } else {

                // Domready

                if (hAzzle.isFunction(sel)) {

                    // Only run if this module are included

                    if (hAzzle['ready']) {

                        return hAzzle.ready(sel);

                    } else {
                        // To avoid some serious bugs, we inform about what happend
                        console.log("The DOM Ready module are not installed!!");
                        return [];
                    }
                }

                //Array

                if (sel instanceof Array) {

                    this.elems = hAzzle.unique(sel.filter(hAzzle.isElement));

                } else {
                    // Object

                    if (hAzzle.isObject(sel)) {
                        return this.elems = [sel], this.length = 1, this[0] = sel, this;
                    }

                    // Nodelist

                    hAzzle.isNodeList(sel) ? this.elems = slice.call(sel).filter(hAzzle.isElement) : hAzzle.isElement(sel) ? this.elems = [sel] : this.elems = [];
                }
            }

            elems = this.elems,
            i = this.length = elems.length;

            while (i--) {

                this[i] = elems[i];

            }
            return this;
        },

        /**
         * Run callback for each element in the collection
         *
         * @param {Function} callback
         * @return {Object}
         */

        each: function (callback, args) {
            return hAzzle.each(this, callback, args);
        },

        /**
         * Filter element collection
         *
         * @param {String|Function} sel
         * @return {Object}
         *
         */

        find: function (selector) {

            var elements;
            if (hAzzle.isString(selector)) {
                if (this.length === 1) {
                    elements = hAzzle.select(selector, this.elems)
                } else {
                    elements = this.elems.reduce(function (elements, element) {
                        return elements.concat(hAzzle.select(selector, element))
                    }, [])
                }
            } else {
                var _ = this;
                elements = hAzzle(selector).filter(function () {
                    var node = this;
                    return _.elems.some.call(_, function (parent) {
                        return hAzzle.contains(parent, node);
                    });
                });
            }
            return hAzzle(elements)
        },

        /**
         * Filter the collection to contain only items that match the CSS selector
         */

        filter: function (sel, inverse) {

            if (typeof sel === 'function') {
                var fn = sel;
                return hAzzle(this.elems.filter(function (element, index) {
                    return fn.call(element, element, index) !== (inverse || false);
                }));
            }
            if (sel && sel[0] === '!') { // ! === not
                sel = sel.substr(1);
                inverse = true;
            }
            return hAzzle(this.elems.filter(function (element) {
                return hAzzle.matches(element, sel) !== (inverse || false);
            }));
        },

        /**
         * Check to see if a DOM element is a descendant of another DOM element.
         *
         * @param {String} sel
         *
         * @return {Boolean}
         */

        contains: function (sel) {
            return hAzzle.create(this.elems.reduce(function (elements, element) {
                return elements.concat(hAzzle.select(sel, element).length ? element : null);
            }, []));
        },

        /**
			 * Fetch property from the "elems" stack
			 *
			 * @param {String} prop
			 * @param {Number|Null} nt
			 * @return {Array}
			 *
			 * 'nt' are used if we need to exclude certain nodeTypes.
	
			 *
			 * Example: pluck('parentNode'), selector, 11)
			 *
			 * In the example above, the parentNode will only be returned if
			 *  nodeType !== 11
			 *
			 */

        pluck: function (property, nt) {
            return hAzzle.pluck(this.elems, property, nt);
        },

        /**
         * Sets property to value for each element in the "elems" stack
         *
         * @param {String} prop
         * @param {String} value
         * @return {Array}
         */

        put: function (property, value, nt) {
            return hAzzle.put(this.elems, property, value, nt);
        },

        /**
         * Get the Nth element in the "elems" stack, or all elements
         *
         * @param {Number} num
         * @return {object}
         */

        get: function (index) {
            return arguments.length ? this.elems[0 > index ? this.elems.length + index : index] : this.elems.slice();
        },

        /**
         * Returns a new array with the result of calling callback on each element of the array
         */

        map: function (callback) {
            var results = [],
                elems = this.elems,
                i = 0,
                len = elems.length;

            for (; i < len; i++) {
                results.push(callback(elems[i]));
            }
            return hAzzle(results);
        },

        /**
         * Sort the elements in the "elems" stack
         */

        sort: function (fn) {
            return hAzzle(this.elems.sort(fn));
        },

        /**
         *  Concatenates an array to the 'elems stack'
         */
        concat: function () {
            return hAzzle(concat.apply(this.elems, slice.call(arguments).map(function (arr) {
                return arr instanceof hAzzle ? arr.elements : arr;
            })));
        },

        /**
         * Slice elements in the "elems" stack
         */

        slice: function (start, end) {
            return hAzzle(slice.call(this.elems, start, end));
        },

        /**
         * Take an element and push it onto the "elems" stack
         */

        push: function (element) {
            return hAzzle.isElement(element) ? (this.elems.push(element), this.length = this.elems.length, this.length - 1) : -1;
        },

        /**
         * Determine if the "elems" stack contains a given value
         *
         * @return {Boolean}
         */

        indexOf: function (needle) {
            return hAzzle.indexOf(this.elems, needle);
        },


        /**
         * Make the 'elems stack'  unique
         */

        unique: function () {
            return hAzzle.unique(this.elems);
        },

        /**
         * Reduce the number of elems in the "elems" stack
         */

        reduce: function (callback /*, initialValue*/ ) {

            var t = Object(this),
                len = t.length >>> 0,
                k = 0,
                value;
            if (arguments.length >= 2) {
                value = arguments[1];
            } else {
                while (k < len && !k in t) k++;
                if (k >= len) {
                    return false;
                }
                value = t[k++];
            }
            for (; k < len; k++) {
                if (k in t) {
                    value = callback(value, t[k], k, t);
                }
            }
            return value;
        },

        compact: function (a) {
            return this.filter(a, function (value) {
                return !!value;
            });
        },

        /**
         * Get the element at position specified by index from the current collection.
         *
         * +, -, / and * are all allowed to use for collecting elements.
         *
         * Example:
         *            .eq(1+2-1)  - Returnes element 2 in the collection
         *            .eq(1*2-1)  - Returnes the first element in the collection
         *
         * @param {Number} index
         * @return {Object}
         */

        eq: function (index) {
            if (arguments) {
                return hAzzle(this.get(index));
            }
        },

        toArray: function () {
            return slice.call(this);
        }

    };

    hAzzle.fn.init.prototype = hAzzle.fn;

    /**
     * Extend the contents of two objects
     */

    hAzzle.extend = hAzzle.fn.extend = function () {
        var target = arguments[0] || {};

        if (typeof target !== 'object' && typeof target !== 'function') {
            target = {};
        }


        if (arguments.length === 1) target = this;

        var slarg = slice.call(arguments),
            value;

        for (var i = slarg.length; i--;) {
            value = slarg[i];
            for (var key in value) {
                if (target[key] !== value[key]) target[key] = value[key];
            }
        }

        return target;
    };


    hAzzle.extend({

        each: function (obj, callback, args) {
            var value,
                i = 0,
                length = obj.length,
                isArray = hAzzle.isArrayLike(obj);

            if (isArray) {
                for (; i < length; i++) {
                    value = callback.call(obj[i], i, args ? args : obj[i]);

                    if (value === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    value = callback.call(obj[i], i, args ? args : obj[i]);

                    if (value === false) {
                        break;
                    }
                }
            }


            return obj;
        },

        type: function (val) {
            return toString.call(val);
        },

        is: function (kind, obj) {
            return hAzzle.indexOf(kind, this.type(obj)) >= 0;
        },

        /**
         * Checks if element is a NODE_ELEMENT or DOCUMENT_ELEMENT.
         */

        isElement: function (elem) {
            return elem && (nodeTypes[1](elem) || nodeTypes[9](elem));
        },

        /**
         * Checks if elements is a NodeList or HTMLCollection.
         */
        isNodeList: function (obj) {
            return obj && this.is(['nodelist', 'htmlcollection', 'htmlformcontrolscollection'], obj);
        },

        IsNaN: function (val) {
            return hAzzle.isNumber(val) && val != +val;
        },

        isUndefined: function (value) {

            return value === void 0;
        },

        isDefined: function (value) {

            return value !== void 0;
        },

        isString: function (value) {

            return typeof value === 'string';

        },
        isFunction: function (value) {

            return typeof value === 'function';
        },

        isDate: function (val) {
            return !!(val && val.getTimezoneOffset && val.setUTCFullYear);
        },

        isRegExp: function (r) {
            return !!(r && r.test && r.exec && (r.ignoreCase || r.ignoreCase === false));
        },

        isArguments: function (a) {
            return !!(a && Object.prototype.hasOwnProperty.call(a, 'callee'));
        },

        isNumber: function (value) {
            return typeof value === 'number';
        },

        isObject: function (obj) {
            return obj === Object(obj);
        },

        isNumeric: function (obj) {
            return !hAzzle.isArray(obj) && obj - parseFloat(obj) >= 0;
        },

        isEmptyObject: function (obj) {
            var name;
            for (name in obj) {
                return false;
            }
            return true;
        },

        isArray: Array.isArray,

        isArrayLike: function (obj) {

            if (obj === null || hAzzle.isWindow(obj)) {
                return false;

            }

            var length = obj.length;

            if (obj.nodeType === 1 && length) {
                return true;
            }

            return hAzzle.isString(obj) || hAzzle.isArray(obj) || length === 0 ||
                typeof length === 'number' && length > 0 && (length - 1) in obj;
        },

        likeArray: function (obj) {
            return typeof obj.length === 'number';
        },

        isWindow: function (obj) {
            return obj && obj.document && obj.location && obj.alert && obj.setInterval;
        },

        isFile: function (obj) {
            return toString.call(obj) === '[object File]';
        },


        isBlob: function (obj) {
            return toString.call(obj) === '[object Blob]';
        },

        isDocument: function (obj) {
            return obj !== null && obj.nodeType == obj.DOCUMENT_NODE;
        },

        isNull: function (obj) {
            return obj === null;
        },

        isBoolean: function (value) {
            return (value === true) || (value === false);
        },

        error: function (msg) {
            throw new Error(msg);
        },

        /**
         * Produces a duplicate-free version of the array.
         */
        unique: function (array) {
            return array.filter(function (item, idx) {
                return hAzzle.indexOf(array, item) === idx;
            });

        },

        /**
         * Creates a new hAzzle instance applying a filter if necessary
         */

        create: function (elements, sel) {
            return typeof sel === 'undefined' ? hAzzle(elements) : hAzzle(elements).filter(sel);
        },

        /**
         * Returns a standard or browser-prefixed methods (moz, webkit, ms, o) if found.
         */

        prefix: function (key, obj) {

            var result, upcased = key[0].toUpperCase() + key.slice(1),
                prefix,
                prefixes = ['moz', 'webkit', 'ms', 'o'];

            obj = obj || window;

            if (result = obj[key]) {
                return result;
            }

            while (prefix = prefixes.shift()) {
                if (result = obj[prefix + upcased]) {
                    break;
                }
            }
            return result;
        },

        /**
         * Same as the 'internal' pluck method, except this one is global
         */

        pluck: function (array, prop, nt) {

            return array.map(function (elem) {

                // Filter by 'nodeType' if 'nt' are set

                if (nt && !nodeTypes[nt](elem)) {

                    return elem[prop];

                    // No nodeType to filter with, return everything

                } else {

                    return elem[prop];

                }

            });
        },

        /**
         * Check if an element contains another element
         */
        contains: function (parent, child) {
            var adown = nodeTypes[9](parent) ? parent.documentElement : parent,
                bup = child && child.parentNode;
            return parent === bup || !!(bup && nodeTypes[1](bup) && adown.contains(bup));
        },

        /**
         * Native indexOf is slow and the value is enough for us as argument.
         * Therefor we create our own
         */

        indexOf: function (array, obj) {

            for (var i = 0, itm; itm = array[i]; i += 1) {
                if (obj === itm) return i;
            }
            return !1;
        },

        /** 
         * Return current time
         */

        now: Date.now,

        /**
         * Check if an element are a specific NodeType
         *
         * @param{Number} val
         * @param{Object} elem
         * @return{Boolean}
         **/

        nodeType: function (val, elem) {
            if (nodeTypes[val]) return nodeTypes[val](elem);
            return false;
        },

        /**
         * Remove empty whitespace from beginning and end of a string
         *
         * @param{String} str
         * @return{String}
         *
         * String.prototype.trim() are only supported in IE9+ Standard mode,
         * so we need a fallback solution for that
         */

        trim: (function () {
            if (!String.prototype.trim) {
                return function (value) {
                    return value.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                };
            }
            return function (value) {
                return value.trim();
            };
        })(),

        /**
         * Check if an element exist in an array
         *
         * NOTE!!
         *
         * This one are ugly as hell, and a mad man's work.
         * I did it like this because native indexOf are
         * 'EXTREAMLY SLOW', and our hAzzle.indexOf() function does
         * not fit for the purpose.
         *
         * We are 77% faster then jQuery anyways :)
         */

        inArray: function (elem, arr, i) {

            var iOff = (function (find, i /*opt*/ ) {
                if (typeof i === 'undefined') i = 0;
                if (i < 0) i += this.length;
                if (i < 0) i = 0;
                for (var n = this.length; i < n; i++)
                    if (i in this && this[i] === find) {
                        return i;
                    }
                return -1;
            });
            return arr === null ? -1 : iOff.call(arr, elem, i);
        },

        /**
         *  Return or compute a unique ID for the element
         *
         * @param{Object} elem
         * @return{Object}
         */

        getUID: function (elem) {
            if (hAzzle.isDefined(elem)) {
                return elem.hAzzle_id || (elem.hAzzle_id = uid.next());
            }
        },

        /**
         * Set values on elements in an array
         *
         * @param{Array} array
         * @param{String} prop
         * @param{String} value
         * @return{Object}
         */

        put: function (array, prop, value, nt) {
            hAzzle.each(array, function (index) {
                if (hAzzle.isDefined(nt) && (array !== null && !hAzzle.nodeType(nt, array))) {
                    array[index][prop] = value;
                } else {
                    array[index][prop] = value;
                }
            });
            return this;
        },

        /**
         * Merge two arrays
         */

        merge: function (first, second) {
            for (var len = +second.length, i = 0, fl = first.length; i < len;) first[fl++] = second[i++];
            if (len !== len)
                for (; second[i] !== undefined;) first[fl++] = second[i++];
            first.length = fl;
            return first;
        },

        nodeName: function (elem, name) {
            return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
        },

        /**
         * camelCase CSS string
         *
         * @param{String} str
         * @return{String}
         */

        camelCase: function (str) {

            return str.replace(/-(.)/g, function (m, m1) {
                return m1.toUpperCase()
            })
        },

        map: function (elems, callback, arg) {
            var value,
                i = 0,
                length = elems.length,

                ret = [];

            // Go through the array, translating each of the items to their new values

            if (toString.call(elems) === "[object String]") {

                for (i in elems) {
                    value = callback(elems[i], i, arg);

                    if (value != null) {
                        ret.push(value);
                    }
                }
            } else {

                for (; i < length; i++) {
                    value = callback(elems[i], i, arg);

                    if (value !== null) {
                        ret.push(value);
                    }
                }

                // Go through every key on the object,
            }


            // Flatten any nested arrays
            return concat.apply([], ret);
        },

        isXML: function (elem) {
            return elem && (elem.ownerDocument || elem).documentElement.nodeName !== "HTML";
        },

        /*

         * Finds the elements of an array which satisfy a filter function.
         */

        grep: function (elems, callback, inv, args) {
            var ret = [],
                retVal,
                i = 0,
                length = elems.length;
            inv = !!inv;
            for (; i < length; i++) {
                if (i in elems) { // check existance
                    retVal = !!callback.call(args, elems[i], i); // set callback this
                    if (inv !== retVal) {
                        ret.push(elems[i]);
                    }
                }
            }
            return ret;
        },

        makeArray: function (array) {

            var ret = [];

            if (array !== null) {
                var i = array.length;
                // The window, strings (and functions) also have 'length'
                if (i === null || hAzzle.isString(array) || hAzzle.isFunction(array) || array.setInterval)
                    ret[0] = array;
                else
                    while (i)
                        ret[--i] = array[i];
            }

            return ret;

        },

        // A function that performs no operations.

        noop: function () {

        },

        // Invoke a method (with arguments) on every item in a collection.

        invoke: function (obj, method) {
            var args = slice.call(arguments, 2),
                isFunc = hAzzle.isFunction(method);
            return $.map(obj, function (value) {
                return (isFunc ? method : value[method]).apply(value, args);
            });
        },

        throttle: function (func, wait, options) {
            var context, args, result,
                timeout = null,
                previous = 0;

            options || (options = {});

            var later = function () {
                previous = options.leading === false ? 0 : hAzzle.now();
                timeout = null;
                result = func.apply(context, args);
                context = args = null;
            };

            return function () {
                var now = hAzzle.now();
                if (!previous && options.leading === false) previous = now;
                var remaining = wait - (now - previous);
                context = this;
                args = arguments;
                if (remaining <= 0) {
                    clearTimeout(timeout);
                    timeout = null;
                    previous = now;
                    result = func.apply(context, args);
                    context = args = null;
                } else if (!timeout && options.trailing !== false) {
                    timeout = setTimeout(later, remaining);
                }
                return result;
            }
        },

        // Delays a function for the given number of milliseconds, and then calls
        // it with the arguments supplied.
        delay: function (func, wait) {
            var args = slice.call(arguments, 2);
            return setTimeout(function () {
                return func.apply(null, args);
            }, wait);
        },

        // Defers a function, scheduling it to run after the current call stack has
        // cleared.
        defer: function (func) {
            return hAzzle.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
        }

    });

    /**
     * Add some nodeTypes
     */

    hAzzle.each(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], function (value) {
        nodeTypes[value] = function (elem) {
            return elem && elem.nodeType === value;
        };
    });


    // Powerfull native functions for dealing with the 'elems stack'

    hAzzle.each(['pop', 'reverse', 'shift', 'splice', 'unshift'], function () {
        var method = ArrayProto[this];
        hAzzle.fn[this] = function () {
            return method.apply(this.elems, arguments);
        };
    });

    // Expose hAzzle to the global object

    window['hAzzle'] = hAzzle;

})(window);