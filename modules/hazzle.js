/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight & Mehran Hatami
 * Version: 0.9.9d RC3
 * Released under the MIT License.
 *
 * Date: 2014-09-26
 */
(function(global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = global.document ?
            factory(global, true) :
            function(w) {
                if (!w.document) {
                    throw new Error('hAzzle requires a window with a document');
                }
                return factory(w);
            };
    } else {
        factory(global);
    }

    // Pass this if window is not defined yet
}(typeof window !== 'undefined' ? window : this, function(window, noGlobal) {

    // Usefull variabels

    var document = window.document,

        docElem = window.document.documentElement,

        // Prototype references.

        ArrayProto = Array.prototype,

        // Save a reference to some core methods

        indexOf = ArrayProto.indexOf,
        concat = ArrayProto.concat,
        slice = ArrayProto.slice,
        push = ArrayProto.push,

        // Holds javascript natives

        natives = {},

        // Whitespace regexp for hAzzle.trim()

        hTrwl = /^\s+|\s+$/g,
        hHyphenate = /[A-Z]/g,
        hCapitalize = /\b[a-z]/g,

        camelCache = [],

        // Define a local copy of hAzzle

        hAzzle = function(selector, context) {

            // Force domReady if the selector is a
            // function

            return typeof selector === 'function' ?
                hAzzle.ready(selector) :
                new Core(selector, context);
        };

    // Access to main function.

    function Core(selector, context) {

        if (!selector) {
            return this;
        }

        if (typeof selector === 'string') {
            selector = hAzzle.find(selector, context); // Instanceof hAzzle
        } else if (selector instanceof hAzzle) {
            return selector;
        } else if (selector.nodeType === 11) { // document fragment
            selector = selector.childNodes;
        } else if (selector.nodeType) { // nodeType
            selector = [selector];
        } else if (hAzzle.isNodeList(selector)) {
            selector = hAzzle.makeArray(selector);
        } else if (hAzzle.isElement(selector) ||
            hAzzle.isDocument(selector) ||
            (selector === window)) {
            selector = [selector];
        }

        if (selector) {

            // Initialize a new hAzzle Object with the
            // given `selector`

            var i = this.length = this.size = selector.length;

            while (i--) {

                this[i] = selector[i];
            }
        }
        return this;
    }

    // Easy access variable for the Prototype function

    hAzzle.Core = Core.prototype = {

        constructor: hAzzle,

        length: 0,

        /**
         * Returns a new array with the result of calling callback on each element of the array
         * @param {function} fn
         * @return {hAzzle}
         */

        twist: function(fn) {
            var elems = this,
                i = 0,
                len = elems.length;
            for (i = len; i--;) {
                return hAzzle(fn(elems[i]));
            }
        },

        /**
         * @param {Function} fn
         * @param {Boolean} reverse
         * @return {hAzzle}
         */

        each: function(fn, reverse) {
            return hAzzle.each(this, fn, reverse);
        },

        /**
         * @param {Function} fn
         * @param {Boolean} rev
         * @return {Array}
         */

        map: function(fn) {
            return hAzzle(hAzzle.map(this, function(elem, i) {
                return fn.call(elem, i, elem);
            }));
        }
    };

    /**
     * Extend the contents of two objects
     */

    hAzzle.extend = function() {
        var length = arguments.length,
            source = arguments,
            target = arguments[1],

            i = 0,
            extend = function(target, source) {
                var k;
                for (k in source) {
                    source.hasOwnProperty(k) && ((target || Core.prototype)[k] = source[k]);
                }
            };

        // Don't do iteration if we can avoid it,
        // better performance

        if (length === 1) {
            extend(target, source[0]);
        } else {

            source = arguments[0];

            for (; i < length; i++) {
                extend(target, arguments[i]);
            }
        }
    };

    hAzzle.extend({

        // A global UID counter for objects

        UID: 1,

        /** 
         * Return current time
         */

        now: Date.now,

        // Default promise library are ES6 by default, but this 
        // can be overwritten with a third-party promises library.

        promise: window.Promise,

        /**
         * Error function
         */

        error: function(msg) {
            throw new Error(msg);
        },

        getID: function(node, name, /* OPTIONAL */ exposed) {

            name = name || 'hAzzle_';

            // if boolean true / false value, we are returning
            // a new UID without attaching it to a object

            if (typeof node === 'boolean') {
                return hAzzle.UID++;
            } else if (typeof node === 'object') {

                // If 'exposed' are true, we are setting the UID as
                // an attribute value on the node,
                // This could be tampered with

                if (exposed) {

                    // Try to get the id

                    var uid = node.getAttribute(hAzzle.UID);

                    if (!uid) {

                        uid = hAzzle.UID++;

                        // Set the new ID

                        node.setAttribute(name, uid);
                    }

                    return uid;
                }

                if (typeof node.hiD === 'undefined') {

                    // Attach the UID directly on a Object

                    node.hiD = name + hAzzle.UID++;
                }

                return node.hiD;
            }

            // If no boolean or Object, return false;

            return false;
        },

        /**
         * Run callback for each element in the collection
         * @param {Array|Function|Object} obj
         * @param {Function} fn
         * @param {String} context
         * @return {hAzzle}
         */

        each: function(collection, fn, scope, reverse) {
            if (!collection) {
                return;
            }
            var i = 0,
                l = collection.length,
                element = null;

            // Iterate through array	

            if (isArraylike(collection)) {
                if (reverse) {
                    for (i = l - 1; i > -1; i--) {
                        element = collection[i];
                        if (fn.call(scope || element, element, i) === false) {
                            break;
                        }
                    }
                } else {

                    for (; i < l; i++) {
                        element = collection[i];
                        if (fn.call(scope || element, element, i) === false) {
                            break;
                        }
                    }
                }
            } else {

                for (i in collection) {
                    if (collection.hasOwnProperty(i)) {
                        element = collection[i];
                        if (fn.call(scope || element, element, i) === false) {
                            break;
                        }
                    }
                }

            }
            return collection;
        },

        capitalize: function(str) {
            return str.replace(hCapitalize, function(match) {
                return match.toUpperCase();
            });
        },
        // Convert camelCase to  CSS-style
        // e.g. boxSizing -> box-sizing

        hyphenate: function(str) {
            return str.replace(hHyphenate, function(match) {
                return ('-' + match.charAt(0).toLowerCase());
            });
        },

        /**
         *  Convert dashed to camelCase
         *
         * @param {string} str
         * @return {string}
         */

        camelize: function(str) {
            if (!str) return;
            return camelCache[str] ? camelCache[str] :
                camelCache[str] = str.replace(/-\D/g, function(match) {
                    return match.charAt(1).toUpperCase();
                });
        },

        /**
         * Remove leading and trailing whitespaces of the specified string.
         *
         * @param{String} str
         * @return{String}
         */

        trim: function(str) {
            return String.prototype.trim ? (typeof str === 'string' ? str.trim() : str) :
                str.replace(hTrwl, '');
        },

        /**
         * toString
         */

        str: Object.prototype.toString,

        indexOf: function(elem, arr, i) {
            return arr === null ? -1 : indexOf.call(arr, elem, i);
        },

        /**
         * Check if an element exist in an array
         */

        inArray: function(array, value, index) {

            if (!array) {

                return;
            }

            var i = (index || 0),
                m = array.length;

            for (; i < m; i++) {

                if (array[i] === value) {

                    return i;

                }
            }
            return -1;
        },

        map: function(elems, fn, arg) {

            var value,
                i = 0,
                length = elems.length,
                isArray = isArraylike(elems),
                results = [];

            // Go through the array, translating each of the items to their new values

            if (isArray) {

                for (; i < length; i++) {

                    value = fn(elems[i], i, arg);

                    if (value !== null) {
                        results[i] = value;
                    }
                }

                // Go through every key on the object

            } else {

                for (i in elems) {
                    value = fn(elems[i], i, arg);

                    if (value !== null) {
                        results[i] = value;
                    }
                }
            }

            // Flatten any nested arrays

            return concat.apply([], results);
        },

        // Return the elements nodeName

        nodeName: function(el, name) {
            return el && el.nodeName && el.nodeName.toLowerCase() === name.toLowerCase();
        },

        merge: function(first, second) {
            var len = +second.length,
                j = 0,
                i = first.length;

            for (; j < len; j++) {
                first[i++] = second[j];
            }

            first.length = i;

            return first;
        },

        // Nothing

        noop: function() {},

        makeArray: function(nodeList) {

            if (nodeList instanceof Array) {
                return nodeList;
            }
            var index = -1,
                length = nodeList.length,
                array = Array(length);

            while (++index < length) {
                array[index] = nodeList[index];
            }
            return array;
        },

        // Loop through Objects

        forOwn: function(obj, iterator, context) {
            var key;
            if (obj === null) return obj;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key);
                }
            }
            return obj;
        },

        /**
         * Feature detection of elements
         *
         * @param {Function} fn
         * @return {Boolean}
         */

        assert: function(fn) {

            var el = document.createElement('fieldset');

            try {

                return !!fn(el);

            } catch (e) {

                return false;

            } finally {

                // Remove from its parent by default
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
                // release memory in IE
                el = null;
            }
        },

        /**
         * Determine the type of object being tested.
         *
         * @param {Mixed} object
         * @return {String} object type
         *
         * NOTE! Use of switch{} here will slow down the
         * performance with 1 -2% in all browsers
         *
         */

        type: function(obj) {

            var type = typeof obj,
                str;

            if (obj === null) {
                return obj + '';
            }

            if (type === 'boolean') {
                return 'boolean';
            }

            if (type === 'string') {
                return 'string';
            }

            str = hAzzle.str.call(obj);

            if (natives[str]) {
                return natives[str];
            }

            return type;

        },

        isSVG: function(elem) {
            return window.SVGElement && (elem instanceof SVGElement);
        },

        hasOwn: natives.hasOwnProperty,


        mergeArray: function(arr, results) {
            var ret = results || [];

            if (arr != null) {
                if (hAzzle.isArraylike(Object(arr))) {
                    hAzzle.merge(ret,
                        typeof arr === 'string' ? [arr] : arr
                    );
                } else {
                    push.call(ret, arr);
                }
            }

            return ret;
        },

        // Get the size of Array or Objects

        size: function(obj, ownPropsOnly) {
            var size = 0,
                prop;
            if (hAzzle.isArray(obj) || typeof obj === 'string') {
                return obj.length;
            } else if (hAzzle.isObject(obj)) {
                for (prop in obj) {
                    if (!ownPropsOnly || obj.hasOwnProperty(prop)) {
                        size++;
                    }
                }
                return size;
            }
        },

        /*
         * Finds the elements of an array which satisfy a filter function.
         */

        grep: function(elems, callback, invert) {
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
        /**
         * Bind a function to a context, optionally partially applying any
         *
         * @param {Function} fn
         * @param {Object} context
         */

        bind: function(fn, context) {

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

    //  Checks if `obj` is a window object.

    var isWindow = hAzzle.isWindow = function(obj) {
            return obj !== null && obj === obj.window;
        },

        isArraylike = hAzzle.isArraylike = function(obj) {
            var length = obj.length,
                type;

            if (typeof obj === 'function' || isWindow(obj)) {
                return false;
            }

            if (obj.nodeType === 1 && length) {
                return true;
            }

            type = hAzzle.type(obj);

            return type === 'array' || length === 0 ||
                typeof length === 'number' && length > 0 && (length - 1) in obj;
        };


    function isPlainObject(obj) {
        if (hAzzle.type(obj) !== 'object' || obj.nodeType || hAzzle.isWindow(obj)) {
            return false;
        }

        if (obj.constructor &&
            !hAzzle.hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
            return false;
        }
        return true;
    }

    // Special detection for IE, because we got a lot of trouble
    // with it. Damn IE!!

    hAzzle.ie = (function() {
        if (document.documentMode) {
            return document.documentMode;
        } else {

            hAzzle.assert(function(div) {
                var i = 7;
                for (; i > 4; i--) {
                    div.innerHTML = '<!--[if IE ' + i + ']><span></span><![endif]-->';

                    if (div.getElementsByTagName('span').length) {
                        return i;
                    }
                }
            });
        }

        return undefined;
    })();

    // Expose

    hAzzle.docElem = docElem;

    // Populate the native list

    hAzzle.each(['Boolean',
        'String',
        'Function',
        'Array',
        'Date',
        'RegExp',
        'Object',
        'Error',
        'Arguments'
    ], function() {
        natives['[object ' + this + ']'] = this.toLowerCase();
    });

    // Expose hAzzle to the global object

    if (typeof noGlobal === 'undefined') {
        window.hAzzle = hAzzle;
    }
    return hAzzle;

}));