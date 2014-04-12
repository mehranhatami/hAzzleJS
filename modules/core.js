/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight
 * Version: 0.29g - Beta 3
 * Released under the MIT License.
 *
 * Date: 2014-04-12
 *
 */

// AMD and CommonJS support will be added in RC3

(function (window, undefined) {

    // hAzzle already defined, leave now

    if (window['hAzzle']) return;

    var doc = window.document,
        html = window.document.documentElement,

        /**
         * Prototype references.
         */

        ArrayProto = Array.prototype,

        /**
         * Create reference for speeding up the access to the prototype.
         */

        slice = ArrayProto.slice,
        splice = ArrayProto.splice,
        concat = ArrayProto.concat,

        getTime = (Date.now || function () {
            return new Date().getTime();
        }),

        /** 
         * Inspired by YUI3: :)
         *
         * Note!! Typeof HTMLElementCollection in Safari will report function, but type(HTMLElementCollection) will return object
         */

        hAzzleTypes = {
            'undefined': 'undefined',
            'number': 'number',
            'boolean': 'boolean',
            'string': 'string',
            '[object Function]': 'function',
            '[object RegExp]': 'regexp',
            '[object Array]': 'array',
            '[object Date]': 'date',
            '[object Error]': 'error'
        },

        toString = hAzzleTypes.toString,

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
                        this.elems = elems = cache[sel];
                        for (i = this.length = elems.length; i--;) this[i] = elems[i];
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
            var selType = typeof sel;
            if (selType === "string") {
                var elements;
                if (this.length === 1) {
                    if (selType !== "string") {
                        elements = sel[0];
                    } else {
                        elements = hAzzle(sel, this.elems[0]);
                    }
                } else {
                    if (selType == 'object') {
                        var _ = this;
                        elements = hAzzle(sel).filter(function () {
                            var node = this;
                            return _.elems.some.call(_, function (parent) {
                                return hAzzle.contains(parent, node);
                            });
                        });
                    } else {
                        elements = this.elems.reduce(function (elements, element) {
                            return elements.concat(hAzzle.select(sel, element));
                        }, []);
                    }
                }
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
            if (sel && sel[0] === '!') {
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
         * Get elements in list but not with this selector
         *
         * @param {String} sel
         * @return {Object}
         *
         */

        not: function (sel) {
            return this.filter(sel || [], true);
        },

        /**
         * Check if the first element in the element collection matches the selector
         *
         * @param {String|Object} sel
         * @return {Boolean}
         */

        is: function (sel) {
            return this.length > 0 && this.filter(sel || []).length > 0;
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

        pluck: function (prop, nt) {
            if (nodeTypes[nt]) return hAzzle.pluck(this.elems, prop);
            return hAzzle.pluck(this.elems, prop);
        },

        /**
         * Put a element on the "elems" stack
         *
         * @param {String} prop
         * @param {String} value
         * @return {Array}
         */

        put: function (prop, value, nt) {
            return hAzzle.put(this.elems, prop, value, nt);
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
         * Map the elements in the "elems" stack
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

        sort: function (elm) {
            return hAzzle(this.elems.sort(elm));
        },

        /**
         *  Concatenate two elements lists
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
         * Maybe concat is faster?
         */

        push: function (itm) {
            return hAzzle.isElement(itm) ? (this.elems.push(itm), this.length = this.elems.length, this.length - 1) : -1;
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
         * Reduce the number of elems in the "elems" stack
         */
       reduce: function (iterator, memo) {

        var arr = this.elems, 
			len = arr.length, 
		    reduced, 
			i;
    
        // If zero-length array, return memo, even if undefined
        if(!len) return memo;
    
        // If no memo, use first item of array (we know length !== 0 here)
        // and adjust i to start at second item
        if(arguments.length === 1) {
            reduced = arr[0];
            i = 1;
        } else {
            reduced = memo;
            i = 0;
        }
    
        while(i < len) {
            // Test for sparse array
            if(i in arr) reduced = iterator(reduced, arr[i], i, arr);
            ++i;
        }
    
        return reduced;
    },

        /**
         * Reduce to right, the number of elems in the "elems" stack
         */

        reduceRight: function (iterator, memo) {
            return this.elems['reduceRight'](iterator, memo);
        },

        /**
         * Iterate through elements in the collection
         */

        iterate: function (method, ctx) {
            return function (a, b, c, d) {
                return this.each(function () {
                    method.call(ctx, this, a, b, c, d);
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
     * Extend `hAzzle` with arguments, if the arguments length is one, the extend target is `hAzzle`

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

            if (obj === null) {
                return obj + "";
            }
            return typeof obj === "object" || typeof obj === "function" ?
                hAzzleTypes[toString.call(obj)] || "object" : typeof obj;
        },

        is: function (kind, obj) {
            return hAzzle.indexOf(kind, this.type(obj)) >= 0;
        },

        isElement: function (elem) {
            return elem && (nodeTypes[1](elem) || nodeTypes[9](elem));
        },

        isNodeList: function (obj) {
            return obj && this.is(['nodelist', 'htmlcollection', 'htmlformcontrolscollection'], obj);
        },

        IsNaN: function (val) {
            return !(0 >= val) && !(0 < val);
        },

        isUndefined: function (value) {
            return typeof value === 'undefined';
        },

        isDefined: function (value) {
            return typeof value !== 'undefined';
        },

        isObject: function (o) {
            return o !== null && typeof o == 'object';
        },

        isString: function (s) {
            return typeof s === 'string';
        },

        isNumeric: function (obj) {
            return !this.IsNaN(parseFloat(obj)) && isFinite(obj);
        },

        isNumber: function (value) {
            return typeof value === "number";
        },

        isEmptyObject: function (obj) {
         var name;
            for ( name in obj) {
                return false;
            }
            return true;
        },

        isFunction: function (obj) {
            return hAzzle.type(obj) === "function";
        },

        isArray: Array.isArray, //use native version here

        isArrayLike: function (obj) {

            var length = obj.length,
                type = hAzzle.type(obj);

            if (type === "function" || hAzzle.isWindow(obj)) {
                return false;
            }

            if (nodeTypes[1](obj) && length) {
                return true;
            }

            return type === "array" || length === 0 ||
                typeof length === "number" && length > 0 && (length - 1) in obj;
        },

        likeArray: function (obj) {
            return typeof obj.length == 'number';
        },

        isWindow: function (obj) {
            return obj !== null && obj == obj.window;
        },

        isDocument: function (obj) {
            return obj !== null && obj.nodeType == obj.DOCUMENT_NODE;
        },

        isPlainObject: function (obj) {

            if (hAzzle.type(obj) !== "object" || obj.nodeType || hAzzle.isWindow(obj)) {
                return false;
            }

            if (obj.constructor && !hAzzleTypes.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }

            return true;

        },

        isBoolean: function (str) {
            return typeof str === 'boolean';
        },

        /**
         * Re-wrote this one, so we now only deal with one While-loop,
         * 40% faster now.
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
            return hAzzle.isUndefined(sel) ? hAzzle(elements) : hAzzle(elements).filter(sel);
        },

        /**
         * Get correct CSS browser prefix

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
         * Returns a predicate for checking whether an object has a given set of `key:value` pairs.
         */

        matches: function (element, sel) {

            var matchesSelector, match,

                // Fall back to performing a selector if matchesSelector not supported

                fallback = (function (sel, element) {

                    if (!element.parentNode) {

                        ghost.appendChild(element);
                    }

                    match = hAzzle.indexOf(hAzzle.select(sel, element.parentNode), element) >= 0;

                    if (element.parentNode === ghost) {
                        ghost.removeChild(element);
                    }
                    return match;

                });

            if (!element || !hAzzle.isElement(element) || !sel) {
                return false;
            }

            if (sel['nodeType']) {
                return element === sel;
            }

            if (sel instanceof hAzzle) {
                return sel.elems.some(function (sel) {
                    return hAzzle.matches(element, sel);
                });
            }

            if (element === doc) {
                return false;
            }

            matchesSelector = hAzzle.prefix('matchesSelector', ghost);

            if (matchesSelector) {
                // IE9 supports matchesSelector, but doesn't work on orphaned elems
                // check for that
                var supportsOrphans = cached[sel] ? cached[sel] : cached[sel] = matchesSelector.call(ghost, 'div');

                if (supportsOrphans) {

                    return matchesSelector.call(element, sel);

                } else { // For IE9 only or other browsers who fail on orphaned elems, we walk the hard way !! :)

                    return fallback(sel, element);
                }
            }

            return fallback(sel, element);

        },

        /**
         * Same as the 'internal' pluck method, except this one is global
         */

        pluck: function (array, prop) {
            return array.map(function (itm) {
                return itm[prop];
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
                    obj.compareDocumentPosition && obj.compareDocumentPosition(bup) & 16
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
            return hAzzle.inArray(arr, elem);
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
         * Walks the DOM tree using `method`, returns when an element node is found
         *
         * @param{Object} element
         * @param{String} method
         * @param{String} sel
         * @param{Number/Null } nt
         */

        getClosestNode: function (element, method, sel, nt) {
            do {
                element = element[method];
            } while (element && ((sel && !hAzzle.matches(sel, element)) || !hAzzle.isElement(element)));
            if (hAzzle.isDefined(nt) && (element !== null && !hAzzle.nodeType(nt, element))) {
                return element;
            }
            return element;
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
                i, len, key;

            // Go through the array, translating each of the items to their new values

            if (hAzzle.likeArray(elements))
                for (i = 0, len = elements.length; i < len; i++) {

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

        /***
         * Get all child nodes...:
         */

        getChildren: function (context, tag) {
            var ret = context.getElementsByTagName ? context.getElementsByTagName(tag || "*") :
                context.querySelectorAll ? context.querySelectorAll(tag || "*") : [];

            return tag === undefined || tag && hAzzle.nodeName(context, tag) ?
                hAzzle.merge([context], ret) :
                ret;
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
        }
    });

    /**
     * Setting up the nodeTypes we are using
     */

    hAzzle.each(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], function (value) {
        nodeTypes[value] = function (elem) { if (elem.nodeType === value) return true; };
    });


    window['hAzzle'] = hAzzle;

})(window);