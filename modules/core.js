/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight
 * Version: 0.31d - Beta 4
 * Released under the MIT License.
 *
 * Date: 2014-04-19
 *
 * TO DO! Just now we are using jQuery's DOM ready way to do things. We let it be up to the developer to use the DOM ready function or not.
 *        My idea is that we skip that, and run the DOM ready automaticly before the library can be used.
 *        Followed by injection of all modules - modular loading.
 *
 *
 * IN THE FUTURE:
 * ===============
 *
 * Automaticly module loading. Load the Core.js upon pagelaod, and inject the rest of the modules after the document become ready.
 * Option to load modules from CDN or locale.
 *
 *
 * IMPORTANT!!
 * ===========
 *
 * I'm a Closure fan, but still hAzzle are written with Protoype chain. Two reasons for this. Closure read / write are terrible slow on large scale.
 * hAzzle need to be fast. Compare here: http://jsperf.com/prototype-vs-closures/34
 *
 * Second. People are familiar with jQuery, so I loosely try to follow the jQuery skeleton so it's easier for people out there to use hAzzle and
 * convert jQuery plugins to hAzzle.
 *
 * The Core have been optimized for speed and the average speed is 60 - 70% fater then Underscore.js, zepto, jQuery and Angular JS.
 *
 */
 
(function (window, undefined) {

    // hAzzle already defined, leave now

    if (window['hAzzle']) return;

    var doc = window.document,
        html = window.document.documentElement,

        /**
         * Prototype references.
         */

        ArrayProto = Array.prototype,
        ObjProto = Object.prototype,

        /**
         * Create a reference to some core methods
         */

        push = ArrayProto.push,
        slice = ArrayProto.slice,
        splice = ArrayProto.splice,
        concat = ArrayProto.concat,
        toString = ObjProto.toString,

        hasOwn = ObjProto.hasOwnProperty,

        getTime = (Date.now || function () {
            return new Date().getTime();
        }),

        /*
         * ID used on elements for data, animation and events
         */

        uid = {
            current: 0,
            next: function () {
                return ++this.current;
            }
        },

        cached = [],

        // Selector caching
        cache = [],

        // Different nodeTypes we are checking against for faster speed
        nodeTypes = {},

        // Dummy div we are using in different functions

        ghost = doc.createElement('div'),

        // Main function
        hAzzle = function (sel, ctx) {
            return new hAzzle.fn.init(sel, ctx);
        };

    /**
     * An object used to flag environments/features.
     */
    var support = hAzzle.support = {};

    (function () {
        /**
         * Detect classList support.
         */
        support.classList = !! doc.createElement('p').classList;
        if (!ghost.style) {
            return;
        }

        ghost.style.backgroundClip = "content-box";
        ghost.cloneNode(true).style.backgroundClip = "";
        support.clearCloneStyle = ghost.style.backgroundClip === "content-box";

    }());

    hAzzle.fn = hAzzle.prototype = {
        init: function (sel, ctx) {
            var elems, i;
            if (sel instanceof hAzzle) return sel;
            if (hAzzle.isString(sel)) {
                if (sel[0] === "<" && sel[sel.length - 1] === ">" && sel.length >= 3) {

                    /**
                     * The parsed HTML has to be set as an elem in the "elem stack", and not merged with the hAzzle Object
                     */

                    this.elems = hAzzle.parseHTML(sel, ctx && ctx.nodeType ? ctx.ownerDocument || ctx : doc, true);

                } else {

                    if (cache[sel] && !ctx) {

                        // Backup the "elems stack" before we loop through

                        this.elems = elems = cache[sel];

                        // Copy the stack over to the hAzzle object so we can access the Protoype

                        for (i = this.length = elems.length; i--;) this[i] = elems[i];

                        // Return the hAzzle Object

                        return this;
                    }


                    this.elems = cache[sel] = hAzzle.select(sel, ctx);
                }
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

            elems = this.elems;
            for (i = this.length = elems.length; i--;) this[i] = elems[i];
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

        find: function (sel) {
            if (typeof sel === "string") {
                var elements;
                if (this.length === 1) {
                    if (typeof sel !== "string") {
                        elements = sel[0];
                    } else {
                        elements = hAzzle(sel, this.elems);
                    }
                } else {
                    elements = this.elems.reduce(function (elements, element) {
                        return elements.concat(hAzzle.select(sel, element));
                    }, []);
                }
                return hAzzle.create(elements);
            }

            if (typeof sel === 'object') {
                var _ = this;
                elements = hAzzle(sel).filter(function () {
                    var node = this;
                    return _.elems.some.call(_, function (parent) {
                        return hAzzle.contains(parent, node);
                    });
                });
                return hAzzle.create(elements);
            }


            return this;
        },

        /**
         * Filter the collection to contain only items that match the CSS selector
         */

        filter: function (sel, inverse) {
            if (typeof sel === 'function') {
                var fn = sel;
                return hAzzle.create(this.elems.filter(function (element, index) {
                    return fn.call(element, element, index) !== (inverse || false);

                }));
            }
            if (sel && sel[0] === '!') { // ! === not
                sel = sel.substr(1);
                inverse = true;
            }
            return hAzzle.create(this.elems.filter(function (element) {
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
            var matches;
            return hAzzle.create(this.elems.reduce(function (elements, element) {
                matches = hAzzle.select(sel, element);
                return elements.concat(matches.length ? element : null);
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

            if (index === null) {
                return this.elems.slice();
            }
            return this.elems[0 > index ? this.elems.length + index : index];
        },

        /**
         * Returns a new array with the result of calling callback on each element of the array
         *
         * Native 'map' are not fastest solution, and the speed
         * are different from browser to browser. To get same
         * speed in all browsers, we have to do it this way.
         *
         *  http://jsperf.com/eam-map-vs-for-loop/3
         */

        map: function (callback) {
            var results = [],
                elems = this.elems;

            for (var i = 0; i < elems.length; i++) {
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
            var args = slice.call(arguments).map(function (arr) {
                return arr instanceof hAzzle ? arr.elements : arr;
            });

            return hAzzle(concat.apply(this.elems, args));
        },

        /**
         * Slice elements in the "elems" stack
         */

        slice: function (start, end) {
            return hAzzle(slice.call(this.elems, start, end));
        },

        splice: function (start, end) {
            return hAzzle(splice.call(this.elems, start, end));
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

        reduce: function (iterator, memo) {

            var arr = this.elems,
                len = arr.length,
                reduced,
                i;

            // If zero-length array, return memo, even if undefined
            if (!len) return memo;

            // If no memo, use first item of array (we know length !== 0 here)
            // and adjust i to start at second item
            if (arguments.length === 1) {
                reduced = arr[0];
                i = 1;
            } else {
                reduced = memo;
                i = 0;
            }

            while (i < len) {
                // Test for sparse array
                if (i in arr) reduced = iterator(reduced, arr[i], i, arr);
                ++i;
            }

            return reduced;

        },

        /**
         * Reduce to right, the number of elems in the "elems" stack
         */

        reduceRight: function (previousValue, currentValue, index, array) {
            return this.elems['reduceRight'].call(previousValue, currentValue, index, array);
        },

        compact: function (a) {

            return this.filter(a, function (value) {

                return !!value;
            });
        },

        memo: function (fn, hasher) {
            var store = {};
            hasher || (hasher = function (v) {
                return v;
            });
            return function () {
                var key = hasher.apply(this, arguments);
                return hasOwn.call(store, key) ? store[key] : (store[key] = fn.apply(this, arguments));
            };
        },

        /**
         *  Returns a function that will call 'fn' with 'ctx' for every element in collection.elements.
         */

        iterate: function (fn, ctx) {
            return function (a, b, c, d) {
                return this.each(function () {
                    fn.call(ctx, this, a, b, c, d);
                });
            };
        },

        /**
         * Get the element at position specified by index from the current collection.
         * If no index specified, return all elemnts in the "elems" stack
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
            return hAzzle(index === null ? '' : this.get(index));
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

        // async-each    


each: function (obj, callback) {
            var i = 0,
                name,
                length = obj.length;

            if (obj.length === +obj.length) {

                for (; i < length;) {
                    if (callback.call(obj[i], i, obj[i++]) === false) {
                        break;
                    }
                }

            } else {

                for (name in obj) {
                    if (callback.call(obj[name], name, obj[name]) === false) {
                        break;
                    }
                }
            }

            return obj;
        },

        type: function (obj) {
            return toString.call(obj);
        },

        is: function (kind, obj) {
            return hAzzle.indexOf(kind, this.type(obj)) >= 0;
        },

        /**
         * Checks if element is a NODE_ELEMENT or DOCUMENT_ELEMENT.
         */

        isElement: function (elem) {
            return elem && (nodeTypes[1](elem) || nodeTypes[9](elem) || !( +elem.nodeType ) );
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

            return typeof value === 'undefined';
        },

        isDefined: function (value) {

            return typeof value !== 'undefined';
        },

        isString: function (value) {

            return typeof value === 'string';

        },
		
		isFunction: function (value) {
			
			return typeof value === 'function';
		},

        isNumber: function (value) {

            return typeof value === 'number';
        },

        isObject: function (obj) {
            return obj === Object(obj);
        },

        isNumeric: function (obj) {
            return !hAzzle.isArray( obj ) && obj - parseFloat( obj ) >= 0;
        },

        isEmptyObject: function (obj) {

            for (var name in obj) {
                return false;
            }
            return true;
        },


        isArray: Array.isArray || toString.call(value) === '[object Array]',  //use native version here

        isArrayLike: function (obj) {

            if (obj === null || hAzzle.isWindow(obj)) {
                return false;
            }

            var length = obj.length;

            if (nodeTypes[1](obj) && length) {
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
            return typeof value === 'boolean';
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
        contains: function (obj, target) {

            if (html['compareDocumentPosition']) {
                var adown = nodeTypes[9](obj) ? obj.documentElement : obj,
                    bup = target && target.parentNode;
                return obj === bup || !! (bup && nodeTypes[1](bup) && (
                    adown.contains ?
                    adown.contains(bup) :
                    obj.compareDocumentPosition && obj.compareDocumentPosition(bup) && 16
                ));

            } else {
                if (target) {
                    while ((target = target.parentNode)) {
                        if (target === obj) {
                            return true;
                        }
                    }
                }
                return false;

            }
        },

        /**
         * Native indexOf is slow and the value is enough for us as argument.
         * Therefor we create our own
         */

        indexOf: function (array, obj) {
            for (var i = 0, len; len = array[i]; i += 1) {
                if (obj === len) return i;
            }
            return !1;
        },

        /** 
         * Return current time
         */

        now: getTime,

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
         */

        trim: function (str) {
            return str.trim();
        },

        /**
         *  Same as hAzzle.indexOf.
         * Added for compability with Zepto and Jquery
         */

        inArray: function (arr, elem) {
            return hAzzle.indexOf(arr, elem);
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
            return hAzzle.each(array, function (index) {
                if (hAzzle.isDefined(nt) && (array !== null && !hAzzle.nodeType(nt, array))) {
                    array[index][prop] = value;
                } else {
                    array[index][prop] = value;
                }
            });
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

        /**
         * Delays a function for the given number of milliseconds, and then calls it with the arguments supplied.
         *
         * @param {Function} func
         * @return {String} wait
         * @return {Function}
         */

        delay: function (func, wait) {
            var args = slice.call(arguments, 2);
            return setTimeout(function () {
                return func.apply(null, args);
            }, wait);
        },

        /**
         * Defers a function, scheduling it to run after the current call stack has cleared
         *
         * @param {Function} func
         * @return {Function}
         */

        defer: function (func) {
            return hAzzle.delay.apply(hAzzle, [func, 1].concat(slice.call(arguments, 1)));
        },

        /**
         * Returns a function that will be executed at most one time
         *
         * @param {Function} func
         * @return {Function}
         */

        once: function (func) {
            var ran = false,
                memo;
            return function () {
                if (ran) return memo;
                ran = true;
                memo = func.apply(this, arguments);
                func = null;
                return memo;
            };
        },

        nodeName: function (elem, name) {
            return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
        },

        /**
         * camelCase CSS string
         * - we are using our prefixCache for faster speed
         *
         * @param{String} str
         * @return{String}
         */

        camelCase: function (str) {
            cached[str] || (cached[str] = str.replace(/^-ms-/, "ms-").replace(/^.|-./g, function (letter, index) {
                return index === 0 ? letter.toLowerCase() : letter.substr(1).toUpperCase();
            }));
            return cached[str];
        },

        map: function (elements, callback) {
            var value, values = [],
                i,
                key;

            // Go through the array, translating each of the items to their new values

            if (hAzzle.likeArray(elements))
                for (i = elements.length; i--;) {

                    value = callback(elements[i], i);

                    if (value !== null) {

                        values.push(value);
                    }
                } else
                    for (key in elements) {
                        value = callback(elements[key], key);

                        if (value !== null) {

                            values.push(value);
                        }
                    }
            return values;
        },

        isXML: function (elem) {
            var documentElement = elem && (elem.ownerDocument || elem).documentElement;
            return documentElement ? documentElement.nodeName !== "HTML" : false;
        },

        /*
         * Finds the elements of an array which satisfy a filter function.
         */

        grep: function (elems, callback, inv, args) {
            var ret = [],
                retVal;
            inv = !! inv;
            for (var i = 0, length = elems.length; i < length; i++) {
                if (i in elems) { // check existance
                    retVal = !! callback.call(args, elems[i], i); // set callback this
                    if (inv !== retVal) {
                        ret.push(elems[i]);
                    }
                }
            }
            return ret;
        },

        toArray: function () {
            return slice.call(this, 0);
        },

        makeArray: function (arr, results) {

            var ret = results || [];

            if (arr !== null) {
                if (hAzzle.isArraylike(Object(arr))) {
                    hAzzle.merge(ret, typeof arr === "string" ? [arr] : arr);
                } else {
                    push.call(ret, arr);
                }
            }

            return ret;
        },
        // A function that performs no operations.

        noop: function () {

        }

    });

    /**
     * Add some nodeTypes
     */

    hAzzle.each(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], function (value) {
        nodeTypes[value] = function (elem) {
            return elem.nodeType === value;
        };
    });

    /**
     * Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
     */

    hAzzle.each(['Arguments', 'Function', 'Date', 'RegExp'], function (_, name) {
        hAzzle['is' + name] = function (obj) {
            return toString.call(obj) == '[object ' + name + ']';
        };
    });

    if (typeof window['hAzzle'] === "undefined") {

        window['hAzzle'] = hAzzle;
    }

})(window);