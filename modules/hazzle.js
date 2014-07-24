/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight & Mehran Hatami
 * Version: 0.9.5a
 * Released under the MIT License.
 *
 * Date: 2014-07-25
 */
(function (window, undefined) {

    // hAzzle already defined, leave now

    if (window.hAzzle) {

        return;
    }

    // Usefull variabels

    var win = window,
        doc = win.document,

        /**
         * Prototype references.
         */

        ArrayProto = Array.prototype,

        // Save a reference to some core methods

        indexOf = ArrayProto.indexOf,
        concat = ArrayProto.concat,

        // Left and right whitespace regexp for hAzzle.trim()

        trwl = /^\s\s*/,
        trwr = /\s\s*$/,

        escEp = /[-\\^$*+?.()|[\]{}]/g,

        // Define a local copy of hAzzle

        hAzzle = function (selector, context) {

            // Force domReady if the selector is a
            // function

            return typeof selector === 'function' ?
                hAzzle.domReady.add(selector) :
                new Core(selector, context);
        };

    // access to main function.

    function Core(selector, context) {

        if (!selector) {
            return this;
        }

        if (typeof selector === 'string') {

            selector = hAzzle.find(selector, context);

            // Instanceof hAzzle          

        } else if (selector instanceof hAzzle) {

            return selector;

            // document fragment

        } else if (selector.nodeType === 11) {

            // collect the child nodes
            selector = selector.childNodes;

            // nodeType			

        } else if (selector.nodeType) {

            selector = [selector];

        } else if (hAzzle.isNodeList(selector)) {

            selector = hAzzle.makeArray(selector);

            // Wrap DOM nodes.

        } else if (hAzzle.isElement(selector) || hAzzle.isDocument(selector) || (selector.window === selector)) {

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

        twist: function (fn) {
            var elems = this,
                i = 0,
                len = elems.length;
            for (i = len; i--;) {
                return hAzzle(fn(elems[i]));
            }
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

                if (func) {

                    func(n);
                }
                m.push(n);
            }

            return m;
        },

        ready: function (fn) {
            if (typeof fn === 'function') {
                return hAzzle.ready(fn);
            }
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

        lowercase: function (string) {
            return typeof string === 'string' ? string.toLowerCase() : string;
        },

        uppercase: function (string) {
            return typeof string === 'string' ? string.toUpperCase() : string;
        },

        /* =========================== PUBLIC FUNCTIONS ========================== */

        /**
         * Run callback for each element in the collection
         * @param {hAzzle|Array} ar
         * @param {function(Object, number, (hAzzle|Array))} fn
         * @param {Object} scope
         * @param {boolean} arg
         * @return {hAzzle|Array}
         */

        each: function (ar, callback, fn, args) {

            var ind, i = 0,
                l = ar.length;

            for (; i < l; i++) {

                if (args) {

                    ind = ar.length - i - 1;

                } else {

                    ind = i;
                }
                callback.call(fn || ar[ind], ar[ind], ind, ar);
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

        // Convert camelCase to  CSS-style
        // e.g. boxSizing -> box-sizing

        decamelize: function (str) {
            return str ? str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : str;
        },

        capitalize: function (str) {
            return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();

        },

        blank: function (str) {
            return /^\s*$/.test(str);
        },

        /**
         * toString
         */

        str: Object.prototype.toString,

        /**
         *  Convert dashed to camelCase
         *
         * @param {string} str
         * @return {string}
         */

        camelize: function (str) {

            return str.replace(/-(.)/g, function (matches, letter) {
                return letter.toUpperCase();
            });
        },

        arrayLike: function (obj) {

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
            var value,
                i = 0,
                length = elems.length,
                isArray = hAzzle.isArraylike(elems),
                ret = [];

            // Go through the array, translating each of the items to their new values

            if (isArray) {

                for (; i < length; i++) {
                    value = callback(elems[i], i, arg);

                    if (value !== null) {
                        ret.push(value);
                    }
                }

                // Go through every key on the object,
            } else {
                for (i in elems) {
                    value = callback(elems[i], i, arg);

                    if (value !== null) {
                        ret.push(value);
                    }
                }
            }

            // Flatten any nested arrays
            return concat.apply([], ret);
        },

        /**
         * Faster alternative till native prototype reduce
         *
         * @param {Array} array
         * @param {Function} fn
         * @param {Object} initial value
         */

        reduce: function (arr, fn, val) {
            var rval = val,
                i = 0,
                l = arr.length;
            for (; i < l; i++) {
                rval = fn(rval, arr[i], i, arr);
            }
            return rval;
        },

        isNode: function (node) {
            return node && node.nodeName && (node.nodeType === 1 || node.nodeType === 9 || node.nodeType === 11);
        },

        /**
         * Escape regular expression characters in `str`.
         *
         * @param {String} str
         * @return {String}
         */

        escapeRegexp: function (str) {
            str.replace(escEp, '\\$&');
        },
        /**
         * Check if it's an XML or HTML document
         */

        isXML: function (elem) {
            var documentElement = elem && (elem.ownerDocument || elem).documentElement;
            return documentElement ? documentElement.nodeName !== 'HTML' : false;
        },

        /**
         * Return the elements nodeName
         */

        nodeName: function (el, name) {
            return el.nodeName && el.nodeName.toLowerCase() === name.toLowerCase();
        },

        merge: function (first, second) {
            if (second) {
                var len = +second.length,
                    j = 0,
                    i = first.length;

                for (; j < len; j++) {

                    first[i++] = second[j];
                }

                first.length = i;

                return first;
            }
        },

        // Nothing


        noop: function () {},

        /**
         * Return only nodes matching the filter
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


        // Happy now??? -really happy
        makeArray: function (nodeList) {
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
        // Note ! A for-in loop won't guarantee property iteration order and
        // they'll iterate over anything added to the Array.prototype

        forOwn: function (obj, iterator, context) {
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

        assert: function (fn) {

            var div = doc.createElement('div');

            try {
                return !!fn(div);
            } catch (e) {
                return false;
            } finally {
                // Remove from its parent by default
                if (div.parentNode) {
                    div.parentNode.removeChild(div);
                }
                // release memory in IE
                div = null;
            }
        }
    }, hAzzle);


    // This one has to be fast...

    var setter = hAzzle.setter = function (elems, fn, key, value, exec) {

        var len = elems.length,
            k,
            i = 0;

        // Setting many attributes
        if (hAzzle.type(key) === 'object') {

            for (k in key) {

                setter(elems, fn, k, key[k], exec);
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
    };

    /**
     * Remove empty whitespace from beginning and end of a string
     *
     * @param{String} str
     * @return{String}
     *

     * String.prototype.trim() are only supported in IE9+ Standard mode.
     */


    hAzzle.trim = (function () {
        if (!String.prototype.trim) {
            return function (value) {
                return typeof value === 'string' ? value.replace(trwl, '').replace(trwr, '') : value;
            };
        }
        return function (value) {
            return value === 'string' ? value.trim() : value;
        };
    })();

    // Expose hAzzle to the global object

    window.hAzzle = hAzzle;

})(this);