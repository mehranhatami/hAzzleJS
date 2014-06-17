/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight & Mehran Hatami
 * Version: 0.8a
 * Released under the MIT License.
 *
 * Date: 2014-06-19
 */
(function (window, undefined) {

    // hAzzle already defined, leave now

    if (window.hAzzle) {

        return;
    }

    var win = window,
        doc = win.document,

        // Establish the object that gets returned to break out of a loop iteration.

        breaker = {},

        own = ({}).hasOwnProperty,

        /*
         * Holds javascript natives
         */

        natives = {},

        /**
         * Prototype references.
         */

        ArrayProto = Array.prototype,

        /**
         * Save a reference to some core methods
         */

        indexOf = ArrayProto.indexOf,
        slice = ArrayProto.slice,
        push = ArrayProto.push,
        concat = ArrayProto.concat,
        toString = Object.prototype.toString,
        trim = String.prototype.trim,

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

        // The ready event handler

        DOMContentLoaded = false,

        // Define a local copy of hAzzle

        hAzzle = function (selector, context) {
            return new Core(selector, context);
        };

    // Init Core

    function Core(selector, context) {

        this.length = 0;

        if (selector) {

            // Domready

            if (typeof selector === 'function') {
                return hAzzle.ready(selector);
            }
            selector = typeof selector === 'string' ? hAzzle.select(selector, context) : hAzzle.unique(!selector.nodeType &&
                typeof selector.length !== 'undefined' ?
                selector : [selector]);
            var i = this.length = selector.length;
            while (i--) {
                this[i] = selector[i];
            }
        }
    }

    /* =========================== CORE FUNCTIONS ========================== */

    hAzzle.Core = Core.prototype = {

        /**
         * Returns a new array with the result of calling callback on each element of the array
         * @param {function} fn
         * @return {hAzzle}
         */

        twist: function (fn) {
            var elems = this,
                i = 0,
                len = elems.length;
            for (i = len; i--;) {
                return hAzzle(fn(elems[i]));
            }
        },

        twin: function (callback) {
            return hAzzle(hAzzle.map(this, function (elem, i) {
                return callback.call(elem, i, elem);
            }));
        },

        /**
         * Loop through objects
         *
         * @param {function} fn
         * @param {Object} obj
         * @return {hAzzle}
         */

        forOwn: function (fn, obj) {
            return hAzzle.forOwn(this, fn, obj);
        },


        /**
         * @param {function} fn
         * @param {Object} obj
         * @return {hAzzle}
         */

        each: function (fn, obj) {
            return hAzzle.each(this, fn, obj);
        },

        /**
         * @param {Function} fn
         * @param {Object} obj
         * @return {hAzzle}
         */

        deepEach: function (fn, obj) {
            return hAzzle.deepEach(this, fn, obj);
        },

        /**
         * @param {Function} callback
         * @param {Function} func
         * @return {Array}
         */

        map: function (callback, func) {
            var m = [],
                n, i = 0,
                self = this,
                l = self.length;

            for (; i < l; i++) {

                n = callback.call(self, self[i], i);

                func ? (func(n) && m.push(n)) : m.push(n);
            }

            return m;
        }
    };

    /**
     * Extend the contents of two objects
     */

    hAzzle.extend = function () {
        var destination = arguments[0],
            source = arguments[1],
            property;
        for (property in destination) {
            // Objects only
            if (destination[property] && destination[property].constructor && typeof destination[property] === 'object') {
                (source || Core.prototype)[property] = destination[property] || {};
            } else {
                if (destination.hasOwnProperty(property)) {
                    (source || Core.prototype)[property] = destination[property];
                }
            }
        }
    };

    hAzzle.extend({

        // documentElement after adjustments
        // Note! This can / will be overwritten 
        // by the document.js module

        docElem: doc.documentElement,

        // Tells if the document are XML or HTML
        // Set to true as default, but it can be
        // overwritten by the document.js module

        documentIsHTML: true,

        /** 
         * Return current time
         */

        now: Date.now,

        /**
         * Error function
         */

        error: function (msg) {
            throw new Error(msg);
        },

        /**
         * Determine the type of object being tested.
         *
         * @param {Mixed} object
         * @return {String} object type
         */

        type: function (obj) {

            if (obj === null) {
                return obj + '';
            }

            if (typeof obj === 'undefined') {

                return 'undefined';
            }

            if (typeof obj === 'object') {

                return 'object';
            }

            var str = toString.call(obj);

            if (natives[str]) {
                return natives[str];
            }

            return typeof obj;
        },

        /* =========================== 'IS' FUNCTIONS ========================== */

        is: function (kind, obj) {

            if (hAzzle.isArray(kind)) {

                return hAzzle.inArray(kind, this.type(obj)) >= 0;
            }

            // Return a boolean if typeof obj is exactly type.

            return typeof obj === kind;
        },

        /**
         * Checks if an string are empty.
         */

        isEmpty: function (str, ignoreWhitespace) {
            return str === null || !str.length || ignoreWhitespace && /^\s*$/.test(str);
        },
        isObject: function (obj) {

            /*
             * Unlike `typeof` in JavaScript, `null`s are not
             * considered to be objects.
             */
            return obj !== null && typeof obj === 'object';
        },

        isNumber: function (value) {

            return typeof value === 'number';

        },

        isString: function (value) {

            return typeof value === 'string';
        },

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
            return !hAzzle.isArray(obj) && obj - parseFloat(obj) >= 0;
        },
        isBlank: function (str) {
            return hAzzle.trim(str).length === 0;
        },
        isArray: Array.isArray,

        isWindow: function (obj) {
            return obj && obj.document && obj.location && obj.alert && obj.setInterval;
        },
        isDocument: function (obj) {
            return obj !== null && obj.nodeType === obj.DOCUMENT_NODE;
        },
        isNull: function (obj) {
            return obj === null;
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
        isElement: function (o) {
            return o && o.nodeType === 1 || o.nodeType === 9;
        },
        isNodeList: function (obj) {
            return obj && hAzzle.is([
                'nodelist',
                'htmlcollection',
                'htmlformcontrolscollection'
            ], obj);
        },

        /* =========================== PUBLIC FUNCTIONS ========================== */

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

        /**
         * Run callback for each element in the collection
         * @param {hAzzle|Array} ar
         * @param {function(Object, number, (hAzzle|Array))} fn
         * @param {Object} scope
         * @param {boolean} arg
         * @return {hAzzle|Array}
         */

        each: function (ar, callback, scope, args) {

            var ind, i = 0,
                l = ar.length;
            for (; i < l; i++) {

                if (args) {

                    ind = ar.length - i - 1;

                } else {

                    ind = i;
                }
                callback.call(scope || ar[ind], ar[ind], ind, ar);
            }
            return ar;

        },

        /**
         * @param {hAzzle|Array} ar
         * @param {function(Object, number, (hAzzle|Array))} fn
         * @param {Object} scope
         * @return {hAzzle|Array}
         */

        deepEach: function (ar, fn, scope) {
            var i = 0,
                l = ar.length;
            for (; i < l; i++) {
                if (ar[i].nodeName && (ar[i].nodeType === 1 || ar[i].nodeType === 11)) {
                    hAzzle.deepEach(ar[i].childNodes, fn, scope);
                    fn.call(scope || ar[i], ar[i], i, ar);
                }
            }
            return ar;
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

        // Convert camelCase to  CSS-style
        // e.g. boxSizing -> box-sizing

        decamelize: function (str) {
            return str ? str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replace(/^ms-/, '-ms-') : str;
        },

        /**
         *  Convert dashed to camelCase
         *
         * @param {string} str
         * @return {string}
         */

        camelize: function (str) {

            return str.replace(/-(.)/g, function (m, m1) {
                return m1.toUpperCase();
            });
        },

        arrayLike: function (o) {
            return (typeof o === 'object' && isFinite(o.length));
        },

        /**
         * Unique
         */

        unique: function (ar) {
            var a = [],
                i = -1,
                j,
                has,
                len = ar.length;
            while (++i < len) {
                j = -1;
                has = false;
                while (++j < a.length) {
                    if (a[j] === ar[i]) {
                        has = true;
                        break;
                    }
                }
                if (!has) {

                    a.push(ar[i]);
                }
            }
            return a;
        },

        indexOf: function (elem, arr, i) {
            return arr === null ? -1 : indexOf.call(arr, elem, i);
        },
        /**
         * Check if an element exist in an array
         */

        inArray: function (array, value, index) {

            var i = (index || 0),
                m = array.length;
            for (; i < m; i++) {
                if (array[i] === value) {

                    return i;
                }
            }
            return -1;
        },

        map: function (elems, callback, arg) {
            var value, i = 0,
                length = elems.length,
                ret = [];
            // Go through the array, translating each of the items to their new values
            if (toString.call(elems) === '[object String]') {

                for (i in elems) {

                    value = callback(elems[i], i, arg);
                    if (value !== null) {
                        ret.push(value);
                    }
                }
            } else {

                for (; i < length; i++) {
                    value = callback(elems[i], i, arg);
                    if (value !== null) {
                        ret.push(value);
                    }
                } // Go through every key on the object,
            }
            // Flatten any nested arrays
            return concat.apply([], ret);
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

        trim: trim ? function (text) {
            return text === null ? '' : trim.call(text);
        } : function (text) {
            return text === null ? '' : text.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        },

        isNode: function (node) {
            return node && node.nodeName && (node.nodeType === 1 || node.nodeType === 11);
        },

        pluck: function (array, property) {
            return array.map(function (item) {
                return item[property];
            });
        },

        /**
         * Get text
         */

        getText: function (elem) {
            var node, ret = '',
                i = 0,
                nodetype = elem.nodeType;
            if (!nodetype) {
                // If no nodeType, this is expected to be an array


                while ((node = elem[i++])) {
                    // Do not traverse comment nodes
                    ret += hAzzle.getText(node);
                }

                for (;
                    (node = elem[i++]);) {
                    ret += hAzzle.getText(node);
                }
            } else if (nodetype === 1 || nodetype === 9 || nodetype === 11) {

                if (typeof elem.textContent === 'string') {
                    return elem.textContent;



                } else {
                    for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                        ret += hAzzle.getText(elem);
                    }

                }
            } else if (nodetype === 3 || nodetype === 4) {
                return elem.nodeValue;
            }
            return ret;
        },


        /**
         *  Global ID for objects and hACE
         *  Return or compute a unique ID
         *
         * @param{Object} elem
         * @return{Object}
         */

        getUID: function (el) {
            return el && (el.hAzzle_id || (el.hAzzle_id = uid.next()));
        },

        /**
         * Check if it's an XML or HTML document
         */

        isXML: function (elem) {
            return elem && (elem.ownerDocument || elem).documentElement.nodeName !== 'HTML';
        },

        /**
         * Return the elements nodeName
         */

        nodeName: function (el, name) {
            return el.nodeName && el.nodeName.toLowerCase() === name.toLowerCase();
        },

        merge: function (first, second) {
            var len = +second.length,
                j = 0,
                i = first.length;

            for (; j < len; j++) {

                first[i++] = second[j];
            }

            first.length = i;

            return first;
        },

        /*
         * Finds the elements of an array which satisfy a filter function.
         */

        grep: function (elems, callback, invert) {
            var callbackInverse,
                matches = [],
                i = 0,
                length = elems.length,
                callbackExpect = !invert;

            // Go through the array, only saving the items
            // that pass the validator function
            for (; i < length; i++) {
                callbackInverse = !callback(elems[i], i);
                if (callbackInverse !== callbackExpect) {
                    matches.push(elems[i]);
                }
            }

            return matches;
        },

        // Nothing

        noop: function () {},

        /**
         * Return all the elements that pass a truth test.
         *
         * @param {String|nodeType|Function} sel
         * @return {Array}
         *
         */

        filter: function (obj, predicate, context) {

            var results = [];

            if (obj === null) {
                return results;
            }

            hAzzle.each(obj, function (value, index, list) {
                if (predicate.call(context, value, index, list)) {
                    results.push(value);
                }
            });
            return hAzzle(results);
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

        makeArray: function (arr, results) {
            var type,
                ret = results || [];

            if (arr !== null) {
                type = hAzzle.type(arr);

                if (arr.length === null || type === "string" || type === "function" || type === "regexp" || hAzzle.isWindow(arr)) {
                    push.call(ret, arr);
                } else {
                    hAzzle.merge(ret, arr);
                }
            }

            return ret;
        },

        /**
         * DOM traversing
         */

        nodes: function (el, dir, /*INTERNAL */ until) {

            var matched = [];

            while ((el = el[dir]) && el.nodeType !== 9) {
                if (el.nodeType === 1) {
                    if (until) {
                        if (hAzzle(el).is(until || '')) {
                            break;
                        }
                    }
                    matched.push(el);
                }
            }
            return matched;
        },
        rand: function (x, y) {
            if (typeof x === 'undefined') {
                y = +x;
                x = 0;
            }
            return Math.rand(x, y);
        },

        // Loop through Objects

        forOwn: function (obj, fn, arg) {
            var i = 0;

            for (i in obj) {

                if (own.call(obj, i)) {

                    fn.call(arg, i, obj[i]);
                }
            }
        },

        // This one has to be fast...

        setter: function (elems, fn, key, value, exec) {

            var len = elems.length,
                k,
                i = 0;

            // Setting many attributes
            if (hAzzle.type(key) === "object") {

                for (k in key) {

                    hAzzle.setter(elems, fn, k, key[k], exec);
                }

                // Return the elements

                return elems;

                // No value 

            } else if (value !== undefined) {

                if (typeof value === 'function') {

                    for (; i < len; i++) {

                        fn(elems[i], key, value.call(elems[i], i, fn(elems[i], key)));
                    }

                    // Return the elements

                    return elems;
                }


                // Getting an attribute

                if (fn) {

                    for (; i < len; i++) {

                        fn(elems[i], key, value);
                    }

                    // Return the elements

                    return elems;
                }
            }

            return fn(elems[0], key);
        }

    }, hAzzle);

    /* =========================== DOCUMENT READY FUNCTIONS ========================== */

    hAzzle.extend({

        /**
         * DOM ready
         * Execute a callback for every element in the matched set.
         */

        readyList: [],
        readyFired: false,

        ready: function (fn) {

            if (hAzzle.readyFired) {
                setTimeout(function () {
                    fn(document);
                }, 1);
                return;
            } else {

                // add the function and context to the list

                hAzzle.readyList.push(fn);
            }

            // if document already ready to go, schedule the ready function to run
            if (doc.readyState === 'complete') {

                setTimeout(ready, 1);

            } else if (!DOMContentLoaded) {

                // otherwise if we don't have event handlers installed, install them

                doc.addEventListener('DOMContentLoaded', ready, false);
                // backup is window load event
                window.addEventListener('load', ready, false);

                DOMContentLoaded = true;
            }
        }

    }, hAzzle);

    // call this when the document is ready
    // this function protects itself against being called more than once

    function ready() {

        var i = 0,
            l = hAzzle.readyList.length;

        if (!hAzzle.readyFired) {
            // this must be set to true before we start calling callbacks
            hAzzle.readyFired = true;

            for (; i < l; i++) {

                hAzzle.readyList[i].call(window, document);
            }
            // allow any closures held by these functions to free
            hAzzle.readyList = [];
        }
    }

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

    // Expose hAzzle to the global object

    window.hAzzle = hAzzle;

})(this);