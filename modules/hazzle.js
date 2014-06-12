/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight
 * Version: 0.6.5
 * Released under the MIT License.
 *
 * Date: 2014-06-12
 */
(function (window, undefined) {

    // hAzzle already defined, leave now

    if (window.hAzzle) {

        return;
    }

    var win = window,
        doc = win.document,
        docElem = doc.documentElement,

        ntest = /^[^{]+\{\s*\[native \w/,

        // Establish the object that gets returned to break out of a loop iteration.

        breaker = {},

        /*
         * Holds javascript natives
         */
        natives = {},

        // DOM ready related

        readyList = [],
        readyFired = false,
        readyEventHandlersInstalled = false,

        /**
         * Prototype references.
         */

        ArrayProto = Array.prototype,

        /**
         * Save a reference to some core methods
         */

        slice = ArrayProto.slice,
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

    /**
     * hAzzle prototype
     */

    hAzzle.Core = Core.prototype = {

        // The current version of hAzzle being used

        hAzzle: '0.7',

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
                len = self.length;
            for (; i < len; i++) {
                n = callback.call(self, self[i], i);
                if (func) {
                    if (func(n)) {
                        m.push(n);
                    }
                } else {
                    m.push(n);
                }
            }
            return m;
        }
    };

    /**
     * Extend the contents of two objects
     */

    hAzzle.extend = function (destination, source) {

        for (var property in destination) {
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
            return obj === Object(obj);
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
            return obj && (obj !== null && obj === obj.window);
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
        isDefined: function (o) {
            return o !== void 0;
        },
        isUndefined: function (o) {
            return o === void 0;
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
         * this allows method calling for setting values
         *
         * @example
         * hAzzle(elements).css('color', function (el) {
         *   return el.getAttribute('data-original-color')
         * })
         *
         * @param {Element} el
         * @param {function (Element)|string}
         * @return {string}
         */
        setter: function setter(el, v) {
            return typeof v == 'function' ? v.call(el, el) : v;
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
         * @return {boolean}
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
        normalize: function (node, clone) {
            var i, l, ret;
            if (typeof node === 'string') {
                return hAzzle.create(node);
            }
            if (hAzzle.isNode(node)) {
                node = [node];
            }
            if (clone) {
                ret = [];
                // don't change original array
                for (i = 0, l = node.length; i < l; i++) {
                    ret[i] = hAzzle.cloneNode(node[i]);
                }
                return ret;
            }
            return node;
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
         * @param {string} s
         * @return {string}
         */

        decamelize: function (str) {
            return str ? str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : str;
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
                    if (elems.hasOwnProperty(i)) {
                        value = callback(elems[i], i, arg);
                        if (value !== null) {
                            ret.push(value);
                        }
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
                i = 0;
            if (!elem.nodeType) {
                // If no nodeType, this is expected to be an array
                for (;
                    (node = elem[i++]);) {
                    ret += hAzzle.getText(node);
                }
            } else if (elem.nodeType === 1 || elem.nodeType === 9 || elem.nodeType === 11) {
                if (typeof elem.textContent === 'string') {
                    return elem.textContent;
                }
                for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                    ret += hAzzle.getText(elem);
                }
            } else if (elem.nodeType === 3 || elem.nodeType === 4) {
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

        /**
         * DOM ready
         */

        ready: function (callback, context) {

            // context are are optional, but document by default

            context = context || doc;

            if (readyFired) {
                setTimeout(function () {
                    callback(context);
                }, 1);
                return;
            } else {

                // add the function and context to the list

                readyList.push({
                    fn: callback,
                    ctx: context
                });
            }
            // if document already ready to go, schedule the ready function to run
            if (doc.readyState === 'complete') {

                setTimeout(ready, 1);

            } else if (!readyEventHandlersInstalled) {

                // otherwise if we don't have event handlers installed, install them

                doc.addEventListener('DOMContentLoaded', ready, false);
                // backup is window load event
                window.addEventListener('load', ready, false);

                readyEventHandlersInstalled = true;
            }
        },

        // Invoke a method (with arguments) on every item in a collection.

        invoke: function (obj, method) {
            var args = slice.call(arguments, 2),
                isFunc = typeof method === 'function';
            return hAzzle.map(obj, function (value) {
                return (isFunc ? method : value[method]).apply(value, args);
            });
        },

        /**
         * Throttle through a function
         */

        throttle: function (func, wait, options) {
            var context, args, result, timeout = null,
                previous = 0;
            if (!options) {
                options = options = {};
            }
            var later = function () {
                previous = options.leading === false ? 0 : hAzzle.now();
                timeout = null;
                result = func.apply(context, args);
                context = args = null;
            };
            return function () {
                var now = hAzzle.now();
                if (!previous && options.leading === false) {
                    previous = now;
                }
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
            };
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
        }

    }, hAzzle);


    // call this when the document is ready
    // this function protects itself against being called more than once

    function ready() {

        if (!readyFired) {
            // this must be set to true before we start calling callbacks
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                // if a callback here happens to add new ready handlers,
                // the docReady() function will see that it already fired
                // and will schedule the callback to run right after
                // this event loop finishes so all handlers will still execute
                // in order and no new ones will be added to the readyList
                // while we are processing the list

                readyList[i].fn.call(window, readyList[i].ctx);
            }
            // allow any closures held by these functions to free
            readyList = [];
        }
    }

    /**
     * Check if an element contains another element
     */

    hAzzle.contains = ntest.test(docElem.compareDocumentPosition) || ntest.test(docElem.contains) ? function (element, container) {
       return container.compareDocumentPosition && (container.compareDocumentPosition(element) & 16) === 16
	   
    } : function (a, b) {
        if (b) {
            while ((b = b.parentNode)) {
                if (b === a) {
                    return true;
                }
            }
        }
        return false;
    };


    // Populate the native list
    hAzzle.each('Boolean Number String Function Array Date RegExp Object Error Arguments'.split(' '), function (name) {
        natives['[object ' + name + ']'] = name.toLowerCase();
    });

    // Add some isType methods
    hAzzle.each(['Number', 'String', 'Function', 'File', 'Blob', 'RegExp', 'Data', 'Arguments'], function (name) {
        hAzzle['is' + name] = function (o) {
            return toString.call(o) === '[object Number]';
        };
    });

    // Expose hAzzle to the global object

    window.hAzzle = hAzzle;

})(this);