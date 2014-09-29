/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight & Mehran Hatami
 * Version: 0.9.9f RC3
 * Released under the MIT License.
 *
 * Date: 2014-09-29
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

        // Prototype references.

        AP = Array.prototype,

        // Save a reference to some core methods    

        indexOf = AP.indexOf,
        concat = AP.concat,
        slice = AP.slice,
        push = AP.push,

        isArray = Array.isArray,

        // Holds javascript natives

        natives = {},

        // Javascript native list

        nativeList = ('Boolean String Function Array Date RegExp Object Error Arguments').split(' '),

        // Define a local copy of hAzzle

        hAzzle = function(selector, context) {

            // NOTE!! domReady() will be triggered only if the selector is a
            // function. hAzzle ready function are not designed to work selector
            // based (e.g. hAzzle(#'test').ready()

            return typeof selector === 'function' ?
                hAzzle.ready(selector) :
                new Core(selector, context);
        },

        Implement = function() {
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
        },

        //  Checks if `obj` is a window object.

        isWindow = function(obj) {
            return obj !== null && obj === obj.window;
        },

        isArraylike = function(obj) {

            if (obj == null || isWindow(obj)) {
                return false;
            }

            var length = obj.length;

            if (obj.nodeType === 1 && length) {
                return true;
            }

            return typeof obj === 'string' ||
                isArray(obj) ||
                length === 0 ||
                typeof length === 'number' && length > 0 && (length - 1) in obj;
        },

        isPlainObject = function(obj) {
            if (hAzzle.type(obj) !== 'object' ||
                obj.nodeType ||
                isWindow(obj)) {
                return false;
            }

            if (obj.constructor &&
                !hAzzle.hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
            return true;
        },

        // Core

        Core = function(selector, context) {

            if (selector) {

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

                // Initialize a new hAzzle Object with the given `selector`

                var i = this.length = this.size = selector.length;

                while (i--) {
                    this[i] = selector[i];
                }
            }
            return this;
        };

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

    Implement({

        // A global UID counter for objects

        UID: 1,

        // Return current time

        now: Date.now,

        // Default promise library are ES6 by default, but this 
        // can be overwritten with a third-party promises library.

        promise: window.Promise,

        // Error function

        error: function(msg) {
            throw new Error(msg);
        },

        getID: function(node, name, /* OPTIONAL */ exposed) {

            name = name || 'hAzzle_';

            // If boolean true / false value - return a new UID
            // without attaching it to a object 

            if (typeof node === 'boolean') {
                return hAzzle.UID++;
            } else if (typeof node === 'object') {

                // If 'exposed' are true - set the UID as an attribute
                // value on the node.

                if (exposed) {

                    var uid = node.getAttribute(hAzzle.UID);

                    if (!uid) {

                        uid = hAzzle.UID++;
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
         * @param {String} scope
         * @param {Boolean} rev
         * @return {hAzzle}
         */

        each: function(obj, fn, scope, rev) {

            if (obj) {

                var key = 0,
                    i,
                    len = obj.length;

                // Iterate through array	

                if (isArraylike(obj)) {

                    for (; key < len; key++) {
                        i = rev ? obj.length - key - 1 : key;
                        if (fn.call(scope || obj[i], obj[i], i) === false) {
                            break;
                        }
                    }
                } else {

                    for (key in obj) {
                        if (fn.call(scope || obj[key], obj[key], key) === false) {
                            break;
                        }
                    }
                }
            }
            return obj;
        },

        str: Object.prototype.toString,

        indexOf: function(elem, arr, i) {
            return arr === null ? -1 : indexOf.call(arr, elem, i);
        },

        // Check if an element exist in an array

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
        map: function(elems, callback, arg) {

            var value,
                i = 0,
                length = elems.length,
                ret = [];

            if (isArraylike(elems)) {

                for (; i < length; i++) {

                    value = callback(elems[i], i, arg);

                    if (value != null) {
                        ret.push(value);
                    }
                }

                // Go through every key on the object,
            } else {
                for (i in elems) {
                    value = callback(elems[i], i, arg);

                    if (value != null) {
                        ret.push(value);
                    }
                }
            }

            // Flatten any nested arrays
            return concat.apply([], ret);
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

        /**
         * Feature detection of elements
         *
         * @param {Function} fn
         * @return {hAzzle|Boolean}
         */

        assert: function(fn) {

            var el = document.createElement('fieldset');

            try {
                return !!fn(el);
            } catch (e) {
                return false;
            } finally {

                // Remove from its parent by default
                if (el.parentNode && el.tagName !== 'BODY') {
                    el.parentNode.removeChild(el);
                }
                // release memory in IE
                el = null;
            }
        },

        // Determine the type of object being tested.

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

        // Check for SVG support

        isSVG: function(elem) {
            return window.SVGElement && (elem instanceof SVGElement);
        },

        hasOwn: natives.hasOwnProperty,

        mergeArray: function(arr, results) {

            var ret = results || [];

            if (arr != null) {
                if (isArraylike(Object(arr))) {
                    hAzzle.merge(ret,
                        typeof arr === 'string' ? [arr] : arr
                    );
                } else {
                    push.call(ret, arr);
                }
            }

            return ret;
        },

        // Finds the elements of an array which satisfy a filter function.

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

            var curryArgs = arguments.length > 2 ?
                slice.call(arguments, 2) : [],
                tmp;

            if (typeof context === 'string') {

                tmp = fn[context];
                context = fn;
                fn = tmp;
            }

            if (typeof fn === 'function' && !(context instanceof RegExp)) {
                return curryArgs.length ? function() {
                    return arguments.length ?
                        fn.apply(context || this, curryArgs.concat(slice.call(arguments, 0))) :
                        fn.apply(context || this, curryArgs);
                } : function() {
                    return arguments.length ?
                        fn.apply(context || this, arguments) :
                        fn.call(context || this);
                };

            } else {
                return context;
            }
        }
    }, hAzzle);

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

    // Populate the native list

    hAzzle.each(nativeList, function() {
        natives['[object ' + this + ']'] = this.toLowerCase();
    });

    // Expose

    hAzzle.isWindow = isWindow;
    hAzzle.isArray = isArray;
    hAzzle.isPlainObject = isPlainObject;
    hAzzle.extend = Implement;
    hAzzle.natives = natives;

    // Expose hAzzle to the global object

    if (typeof noGlobal === 'undefined') {
        window.hAzzle = hAzzle;
    }
    return hAzzle;

}));