/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight
 * Version: 0.2.6 - BETA
 * Released under the MIT License.
 *
 * Date: 2014-04-08
 *
 */
 
(function (window, undefined) {

    // hAzzle already defined, leave now

    if (window['hAzzle']) return;

    var doc = window.document,
        nodeType = 'nodeType',
        html = doc.documentElement,
        /**
         * Prototype references.
         */

        ArrayProto = Array.prototype,
        ObjProto = Object.prototype,

        /**
         * Create reference for speeding up the access to the prototype.
         */

        slice = ArrayProto.slice,
        splice = ArrayProto.splice,
        concat = ArrayProto.concat,
        toString = ObjProto.toString,

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

        nodeTypes = {
            '1': function (elem) {
                if (elem["nodeType"] === 1) return true; // Element
            },
            '2': function (elem) {
                if (elem["nodeType"] === 2) return true; // Attr
            },

            '3': function (elem) {
                if (elem["nodeType"] === 3) return true; // Text
            },
            '4': function (elem) {
                if (elem["nodeType"] === 4) return true; // CDATASection
            },
            '6': function (elem) {
                if (elem["nodeType"] === 6) return true; // Entity
            },
            '8': function (elem) {
                if (elem["nodeType"] === 8) return true; // Comment
            },
            '9': function (elem) {
                if (elem["nodeType"] === 9) return true; // Document
            },
            '11': function (elem) {
                if (elem["nodeType"] === 11) return true; // Documentfragment
            }
        },

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

        var div = doc.createElement("div");

        if (!div.style) {
            return;
        }

        div.style.backgroundClip = "content-box";
        div.cloneNode(true).style.backgroundClip = "";
        support.clearCloneStyle = div.style.backgroundClip === "content-box";

    }());


    hAzzle.fn = hAzzle.prototype = {

        // Default length allways 0

        length: 0,

        init: function (sel, ctx) {
            var elems, i;

            if (sel instanceof hAzzle) return sel;

            if (hAzzle.isString(sel)) {

                // If the selector are cache, we return it after giving it some special threatment

                if (cache[sel] && !ctx) {
                    this.elems = elems = cache[sel];
                    for (i = this.length = elems.length; i--;) this[i] = elems[i];
                    return this;
                }

                this.elems = cache[sel] = hAzzle.select(sel, ctx);

            } else {

                // Domready

                if (hAzzle.isFunction(sel)) {

                    return hAzzle.ready(sel);
                }

                //Array

                if (hAzzle.isArray(sel)) {

                    this.elems = hAzzle.unique(sel.filter(hAzzle.isElement));

                } else {

                    // Object

                    if (sel && (sel.document || (sel.nodeType && nodeTypes[9](sel)))) {

                        if (!ctx) {

                            return this.elems = [sel], this.length = 1, this[0] = sel, this;

                        } else return [];
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
            if (sel) {
                var elements;
                if (this.length === 1) {
                    if (typeof sel !== "string") {
                        elements = sel[0];
                    } else {
                        elements = hAzzle(sel, this.elems[0]);
                    }
                } else {
                    if (typeof sel == 'object') {
                        var $this = this;
                        elements = hAzzle(sel).filter(function () {
                            var node = this;
                            return $this.elems.some.call($this, function (parent) {
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
            if (nt && hAzzle.isNumber(nt)) {
                if (nodeTypes[nt]) return hAzzle.pluck(this.elems, prop);
            }
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

        get: function (num) {
            return num !== null ? this.elems[0 > num ? this.elems.length + num : num] : this.elems;
        },

        /**
         * Map the elements in the "elems" stack
         */

        map: function (callback) {
            return hAzzle(this.elems['map'](callback));
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
            return this.elems['reduce'](iterator, memo);
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
            var ref = toString.call(obj).match(/\s(\w+)\]$/);
            return ref && ref[1].toLowerCase();
        },

        is: function (kind, obj) {
            return hAzzle.indexOf(kind, hAzzle.type(obj)) >= 0;
        },

        isElement: function (elem) {
            return elem && (nodeTypes[1](elem) || nodeTypes[9](elem));
        },

        isNodeList: function (obj) {
            return obj && hAzzle.is(['nodelist', 'htmlcollection', 'htmlformcontrolscollection'], obj);
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

        isObject: function (value) {
            return value !== null && typeof value == 'object';
        },

        isString: function (value) {
            return typeof value === 'string';
        },

        isNumeric: function (obj) {
            return !this.IsNaN(parseFloat(obj)) && isFinite(obj);
        },
        isNumber: function (value) {
            return typeof value === "number";
        },
        isEmptyObject: function (obj) {
            var name;
            for (name in obj) {
                return false;
            }
            return true;
        },

        isFunction: function (value) {
            return typeof value === 'function';
        },

        isArray: Array.isArray,

        isArrayLike: function (elem) {
            if (elem === null || this.isWindow(elem)) return false;
        },

        isWindow: function (obj) {
            if (obj)
                return obj !== null && obj === obj.window;
        },

        isDocument: function (obj) {
            return obj !== null && obj.nodeType == obj.DOCUMENT_NODE;
        },

        isPlainObject: function (obj) {
            return this.isObject(obj) && !this.isWindow(obj) && Object.getPrototypeOf(obj) === ObjProto;
        },
        isBoolean: function (str) {
            return typeof str === 'boolean';
        },

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
            matchesSelector = cached[matchesSelector] ? cached[matchesSelector] : cached[matchesSelector] = hAzzle.prefix('matchesSelector', ghost);

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
         * Check if an element contains another element
         */
        /*
        contains: function (obj, target) {
            if (target) {
                while ((target = target.parentNode)) {
                    if (target === obj) {
                        return true;
                    }
                }
            }
            return false;
        },
		*/
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
         * Nothing at all
         */

        noop: function () {},

        /**
         *  Same as hAzzle.indexOf.
         * Added for compability with Zepto and Jquery
         */

        inArray: function (arr, elem) {
            return hAzzle.inArray(arr, elem);
        },

        /**
         * Get / set an elements ID
         *
         * @param{Object} elem
         * @return{Object}
         */

        getUID: function (elem) {
            return elem.hAzzle_id || (elem.hAzzle_id = uid.next());
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
            var len = +second.length,
                j = 0,
                i = first.length;

            for (; j < len; j++) {
                first[i++] = second[j];
            }

            first.length = i;

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
        }

    });

    // Selector engine


    var doc = document,
        byClass = 'getElementsByClassName',
        byTag = 'getElementsByTagName',
        byId = 'getElementById',
        byAll = 'querySelectorAll',


        // RegExp we are using

        expresso = {

            idClassTagNameExp: /^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/,
            tagNameAndOrIdAndOrClassExp: /^(\w+)(?:#([\w-]+)|)(?:\.([\w-]+)|)$/
        };

    /**
     * Normalize context.
     *
     * @param {String|Array} ctx
     *
     * @return {Object}
     */

    function normalizeCtx(ctx) {
        if (!ctx) return doc;
        if (typeof ctx === 'string') return hAzzle.select(ctx)[0];
        if (!ctx[nodeType] && typeof ctx === 'object' && isFinite(ctx.length)) return ctx[0];
        if (ctx[nodeType]) return ctx;
        return ctx;
    }

    /**
     * Determine if the element contains the klass.
     * Uses the `classList` api if it's supported.
     * https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
     *
     * @param {Object} el
     * @param {String} klass
     *
     * @return {Array}
     */

    function containsClass(el, klass) {
        if (hAzzle.support.classList) {
            return el.classList.contains(klass);
        } else {
            return hAzzle.contains(('' + el.className).split(' '), klass);
        }
    }

    hAzzle.extend({

        /**
         * Find elements by selectors.
         *
         * @param {String} sel
         * @param {Object} ctx
         * @return {Object}
         */

        select: function (sel, ctx) {

            var m, els = [];

            // Get the right context to use.

            ctx = normalizeCtx(ctx);

            if (m = expresso['idClassTagNameExp'].exec(sel)) {
                if ((sel = m[1])) {
                    els = ((els = ctx[byId](sel))) ? [els] : [];
                } else if ((sel = m[2])) {
                    els = ctx[byClass](sel);
                } else if ((sel = m[3])) {
                    els = ctx[byTag](sel);
                }
            } else if (m = expresso['tagNameAndOrIdAndOrClassExp'].exec(sel)) {
                var result = ctx[byTag](m[1]),
                    id = m[2],
                    className = m[3];
                hAzzle.each(result, function () {
                    if (this.id === id || hAzzle.containsClass(this, className)) els.push(this);
                });
            } else { // QuerySelectorAll

                /**
                 * try / catch are going to be removed. Added now just to stop an error message from being thrown.
                 *
                 * TODO! Fix this
                 **/
                try {
                    els = ctx[byAll](sel);
                } catch (e) {
                    console.error('error performing selector: %o', sel)
                }
            }

            return hAzzle.isNodeList(els) ? slice.call(els) : hAzzle.isElement(els) ? [els] : els;
        }
    });



    // Dom ready

    var fns = [],
        args = [],
        call = 'call',
        isReady = false,
        errorHandler = null;

    /**
     * Prepare a ready handler
     * @private
     * @param {function} fn
     */

    function prepareDOM(fn) {

        try {
            // Call function
            fn.apply(this, args);
        } catch (e) {
            // Error occured while executing function
            if (null !== errorHandler) errorHandler[call](this, fn);
        }
    }

    /**
     * Call all ready handlers
     */

    function run() {

        isReady = true;

        for (var x = 0, len = fns.length; x < len; x = x + 1) prepareDOM(fns[x]);
        fns = [];
    }

    hAzzle.extend({

        ready: function (fn) {

            // Let the event live only once and then die...

            document.addEventListener('DOMContentLoaded', function () {
                run();
            }, true);

            if (isReady) prepareDOM(fn);
            else fns[fns.length] = fn;
        }

    });

    // Storage

    var storage = {};

    /**
     * Store data on an element
     *
     * @param{Object} elem
     * @param{String} key
     * @param{String} value
     * @return {Object}
     */

    function set(element, key, value) {
        var id = hAzzle.getUID(element),
            obj = storage[id] || (storage[id] = {});
        obj[key] = value;
    }

    /**
     * Get data from an element
     *
     * @param{Object} elem
     * @param{String} key
     * @return {Object}
     */

    function get(element, key) {
        var obj = storage[hAzzle.getUID(element)];
        return key === null ? obj : obj && obj[key]
    }

    /**
     * Check if an element contains any data
     *
     * @param{Object} elem
     * @param{String} key
     * @return {Object}
     */

    function has(element, key) {
        var obj = storage[hAzzle.getUID(element)];
        if (key === null) {
            return false;
        }
        if (obj && obj[key]) return true;
    }

    /**
     * Remove data from an element
     *
     * @param{Object} elem
     * @param{String} key
     * @return {Object}
     */


    function remove(element, key) {
        var id = hAzzle.getUID(element);
        if (key === undefined && hAzzle.nodeType(1, element)) {
            storage[id] = {};
        } else {
            var obj = storage[id];
            obj && delete obj[key];
        }
    }


    hAzzle.extend({

        /**
         * Check if an element contains data
         *
         * @param{String/Object} elem
         * @param{String} key
         * @return {Object}
         */
        hasData: function (elem, key) {

            if (elem instanceof hAzzle) {
                if (has(elem, key)) return true;
            } else if (has(hAzzle(elem)[0], key)) return true;
            return false;
        },

        /**
         * Remove data from an element
         *
         * @param {String/Object} elem
         * @param {String} key
         * @return {Object}
         */

        removeData: function (elem, key) {
            if (elem instanceof hAzzle) {
                if (remove(elem, key)) return true;
            } else if (remove(hAzzle(elem)[0], key)) return true;
            return false;
        },

        data: function (elem, key, value) {
            return hAzzle.isDefined(value) ? set(elem, key, value) : get(elem, key);
        }
    });

    hAzzle.fn.extend({

        /**
         * Remove attributes from element collection
         *
         * @param {String} key
         *
         * @return {Object}
         */

        removeData: function (key) {
            this.each(function () {
                remove(this, key);
            });
            return this;
        },

        /**
         * Store random data on the hAzzle Object
         *
         * @param {String} key
         * @param {String|Object} value
         *
         * @return {Object|String}
         *
         */

        data: function (key, value) {
            return hAzzle.isDefined(value) ? (this.each(function () {
                set(this, key, value);
            }), this) : this.elems.length === 1 ? get(this.elems[0], key) : this.elems.map(function (value) {
                return get(value, key);
            });
        }

    });



    // Events 


    var isFunction = hAzzle.isFunction,
        isString = hAzzle.isString,

        slice = Array.prototype.slice,

        specialEvents = {},
        focusinSupported = 'onfocusin' in window,

        _focus = {
            focus: 'focusin',
            blur: 'focusout'
        },

        _mouse = {
            mouseenter: 'mouseover',
            mouseleave: 'mouseout'
        },

        ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
        eventMethods = {
            preventDefault: 'isDefaultPrevented',
            stopImmediatePropagation: 'isImmediatePropagationStopped',
            stopPropagation: 'isPropagationStopped'
        };

    /******************************************
     * Event Core Functions ( ECF )
     ******************************************/

    /**
     * Handlers
     *
     * In hAzzle each event handler is attached to the element, and
     * we check here if the element has the handler we search for,
     * or not.
     *
     * @param {Object} element
     * @return {Object}
     */

    function handlers(element) {
        return element._hdlers || (element._hdlers = []);
    }

    /**
     * Find event handler
     *
     * @param {Object} element
     * @param {Function} event
     * @param {String} fn
     * @param {Function} selector
     * @return {Object}
     */


    function findHandlers(element, event, fn, selector) {

        // Check for namespace

        event = getEventParts(event);

        // If namespace event...

        if (event.ns) var matcher = matcherFor(event.ns);

        return (handlers(element) || []).filter(function (handler) {
            return handler && (!event.e || handler.e == event.e) && (!event.ns || matcher.test(handler.ns)) && (!fn || hAzzle.getUID(handler.fn) === hAzzle.getUID(fn)) && (!selector || handler.sel == selector);
        });
    }

    /**
     * Get event parts.
     *
     * @param {String} event
     *
     * @return {Object}
     */

    function getEventParts(event) {
        var parts = ('' + event).split('.');
        return {
            e: parts[0],
            ns: parts.slice(1).sort().join(' ')
        };
    }


    function matcherFor(ns) {
        return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)');
    }

    /**
     * Get real event.
     *
     * @param {String} event
     *
     * @return {String}
     */

    function realEvent(type) {
        return _mouse[type] || (focusinSupported && _focus[type]) || type;
    }


    function BubbleCatching(handler, boobleSetting) {
        return handler.del && (!focusinSupported && (_focus[handler.e])) || !! boobleSetting;
    }

    function returnTrue() {
        return true;
    }

    function returnFalse() {
        return false;
    }


    /**
     * Quick fix
     */

    function QuickFix(event, original) {

        if (original || !event.isDefaultPrevented) {
            original || (original = event);

            hAzzle.each(eventMethods, function (name, predicate) {

                var originalMethod = original[name];

                event[name] = function () {

                    this[predicate] = returnTrue;

                    var e = this.originalEvent;

                    if (!e) {
                        return;
                    }

                    return originalMethod && originalMethod.apply(original, arguments);
                };
                event[predicate] = returnFalse;
            });

            if (original.defaultPrevented !== undefined ? original.defaultPrevented :
                'returnValue' in original ? original.returnValue === false :
                original.getPreventDefault && original.getPreventDefault())
                event.isDefaultPrevented = returnTrue;
        }
        return event;
    }

    /**
     * Create event proxy for delegated events.
     *
     * @param {Object} event
     *
     * @return {Object}
     */

    function createProxy(evt) {
        var proxy = {
            originalEvent: evt
        };

        for (var key in evt)
            if (!ignoreProperties.test(key) && evt[key] !== undefined) {
                proxy[key] = evt[key];
            }
        return QuickFix(proxy, evt);
    }

    hAzzle.proxy = function (fn, context) {
        if (isFunction(fn)) {
            var passedArgs = slice.call(arguments, 2),
                proxyFn = function () {
                    return fn.apply(context, passedArgs.length ? passedArgs : arguments);
                };
            proxyFn.hAzzle_id = hAzzle.getUID(fn);
            return proxyFn;
        } else if (isString(context)) {
            return hAzzle.proxy(fn[context], fn);
        } else {
            throw new TypeError("expected function");
        }
    };

    hAzzle.fn.extend({

        /**
         * Add event to element
         *
         * @param {String/Object} events
         * @param {String} selector
         * @param {string} data
         * @param {Function} fn
         * @param {Boolean} one
         * @return {Object}

         */

        on: function (events, selector, data, fn, one) {

            var autoRemove, delegator, type;

            if (events && !isString(events)) {

                for (type in events) {

                    this.on(type, selector, data, events[type], one);
                }
                return this;
            }

            if (!isString(selector) && !isFunction(fn) && fn !== false) {
                fn = data, data = selector, selector = undefined;
            }

            if (isFunction(data) || data === false) {
                fn = data, data = undefined;
            }
            return this.each(function (_, element) {

                if (one) {
                    autoRemove = function (e) {
                        hAzzle.event.remove(element, e.type, fn);
                        return fn.apply(this, arguments);
                    };
                }

                // Event delegation
                if (selector) {

                    delegator = function (e) {
                        var evt, match = hAzzle(e.target).closest(selector, element).get(0);
                        if (match && match !== element) {
                            evt = hAzzle.extend(createProxy(e), {
                                currentTarget: match,
                                liveFired: element
                            });
                            return (autoRemove || fn).apply(match, [evt].concat(slice.call(arguments, 1)));
                        }
                    };
                }

                hAzzle.event.add(element, events, fn, data, selector, delegator || autoRemove);
            });

        },

        /**
         * Add event to element only once
         * The event will be removed after the first time it's triggered
         *
         * @param {String/Object} events
         * @param {String} selector
         * @param {string} data
         * @param {Function} fn
         * @return {Object}
         */

        one: function (events, selector, data, fn) {
            return this.on(events, selector, data, fn, true);
        },

        /**
         * Remove event from element
         *
         * @param {String} events
         * @param {String} selector
         * @param {Function} fn
         * @return {Object}
         */

        off: function (events, selector, fn) {

            if (typeof events === "object") {
                // ( types-object [, selector] )
                for (var type in events) {
                    this.off(type, selector, events[type]);
                }
                return this;
            }

            if (selector === false || typeof selector === "function") {
                // ( types [, fn] )
                fn = selector;
                selector = undefined;
            }
            if (fn === false) {
                fn = returnFalse;
            }

            return this.each(function () {
                hAzzle.event.remove(this, events, fn, selector);
            });
        },

        trigger: function (event, args) {
            event = (isString(event) || hAzzle.isPlainObject(event)) ? hAzzle.Event(event) : QuickFix(event)
            event._args = args
            return this.each(function () {

                if (this.type === "checkbox" && this.click && hAzzle.nodeName(this, "input")) {
                    this.click();
                    return false;
                }

                if ('dispatchEvent' in this) this.dispatchEvent(event)
                else hAzzle(this).triggerHandler(event, args)
            })
        },

        triggerHandler: function (events, args) {
            var e, result;
            this.each(function (i, element) {
                e = createProxy(isString(events) ? hAzzle.Event(events) : events);
                e._args = args;
                e.target = element;
                hAzzle.each(findHandlers(element, events.type || events), function (_, handler) {
                    result = handler.proxy(e);
                    if (e.isImmediatePropagationStopped()) return false;
                });
            });
            return result;
        },

        hover: function (fnOver, fnOut) {
            return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
        }
    });

    hAzzle.event = {

        /**
         * Add event to element.
         * Using addEventListener or attachEvent (IE)
         *
         * @param {Object} el
         * @param {String} events
         * @param {Function} fn
         * @param {String} selector
         */
        add: function (element, events, fn, data, selector, delegator, bubble) {

            if (hAzzle.nodeType(3, element) || hAzzle.nodeType(8, element)) return;

            // Set handler on the element

            var set = handlers(element);

            // Handle multiple events seperated by a space

            hAzzle.each(events.split(/\s/), function (index, type) {

                if (type == 'ready') return hAzzle(fn);

                // Namespace check

                var handler = getEventParts(type);
                handler.fn = fn;
                handler.sel = selector;

                if (_mouse[handler.e]) {

                    fn = function (e) {
                        var related = e.relatedTarget;
                        if (!related || (related !== this && !hAzzle.contains(this, related)));
                        return handler.fn.apply(this, arguments);
                    };

                }

                handler.del = delegator;

                var cb = delegator || fn;

                handler.proxy = function (e) {
                    e = QuickFix(e);
                    if (e.isImmediatePropagationStopped()) return;
                    e.data = data;
                    var result = cb.apply(element, e._args === undefined ? [e] : [e].concat(e._args));
                    if (result === false) e.preventDefault(), e.stopPropagation();
                    return result;
                };
                handler.i = set.length;
                set.push(handler);
                if (element.addEventListener) {
                    element.addEventListener(realEvent(handler.e), handler.proxy, BubbleCatching(handler, bubble));
                }
            });
        },

        /**
         * Remove event to element.
         *
         * @param {Object} el
         * @param {String} events
         * @param {Function} fn
         * @param {String} selector
         */
        remove: function (element, events, fn, selector, bubble) {
            hAzzle.each((events || '').split(/\s/), function (_, evt) {
                hAzzle.each(findHandlers(element, evt, fn, selector), function (_, handler) {
                    delete handlers(element)[handler.i];
                    if (element.removeEventListener) {
                        element.removeEventListener(realEvent(handler.e), handler.proxy, BubbleCatching(handler, bubble));
                    }
                });
            });
        }
    };

    hAzzle.Event = function (type, props) {

        if (!isString(type)) props = type, type = props.type;

        var event = document.createEvent(specialEvents[type] || 'Events'),
            bubbles = true;



        if (props)

            for (var name in props)(name == 'bubbles') ? (bubbles = !! props[name]) : (event[name] = props[name]);

        event.initEvent(type, bubbles, true);

        return QuickFix(event);
    };

    // Shortcut methods for 'on'

    hAzzle.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
        "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
        "change select submit keydown keypress keyup error contextmenu").split(" "), function (_, name) {

        // Handle event binding

        hAzzle.fn[name] = function (data, fn) {

            if (fn === null) {
                fn = data;
                data = null;
            }

            return arguments.length > 0 ?
                this.on(name, null, data, fn) :
                this.trigger(name);
        };
    });

    // Util

    hAzzle.fn.extend({

        /**
         * Remove all childNodes from an element
         *
         * @return {Object}
         */

        empty: function () {

            return this.removeData().each(function () {

                this.textContent = "";
            });
        },


        /**
         *  Remove an element from the DOM
         */

        remove: function () {
            return this.removeData().each(function () {

                // Locate all nodes that belong to this element

                var elements = hAzzle(this).find('*');
                elements = elements.add(this);

                // Remove all attached event handlers
                hAzzle.each(elements, function () {
                    hAzzle.event.remove(this);
                });

                if (this.parentNode)
                    this.parentNode.removeChild(this)
            })
        },

        /**
         * Create a deep copy of the element and it's children
         *
         * TODO!!
         *
         *  - Use documentfrag
         *  - Clone data
         *  - Clone events
         */

        clone: function () {
            return this.map(function () {
                return this.cloneNode(true);
            });
        }
    });

    // Manipulation

    var

    // Get the properties right

    propMap = {
        'tabindex': 'tabIndex',
        'readonly': 'readOnly',
        'for': 'htmlFor',
        'class': 'className',
        'maxlength': 'maxLength',
        'cellspacing': 'cellSpacing',
        'cellpadding': 'cellPadding',
        'rowspan': 'rowSpan',
        'colspan': 'colSpan',
        'usemap': 'useMap',
        'frameborder': 'frameBorder',
        'contenteditable': 'contentEditable'
    },

        // Boolean attributes and elements

        boolean_attr = {
            'multiple': true,
            'selected': true,
            'checked': true,
            'disabled': true,
            'readOnly': true,
            'required': true,
            'open': true
        },

        boolean_elements = {
            'input': true,
            'select': true,
            'option': true,
            'textarea': true,
            'button': true,
            'form': true,
            'details': true
        },

        /**
         * Direction for where to insert the text
         */

        direction = {
            'first': 'beforeBegin', // Beginning of the sentence
            'middle': 'afterBegin', // Middle of the sentence
            'center': 'afterBegin', // Middle of the sentence
            'last': 'beforeEnd' // End of the sentence
        };

    function getBooleanAttrName(element, name) {
        // check dom last since we will most likely fail on name
        var booleanAttr = boolean_attr[name.toLowerCase()];
        // booleanAttr is here twice to minimize DOM access
        return booleanAttr && boolean_elements[element.nodeName] && booleanAttr;
    }

    function NodeMatching(elem) {
        return hAzzle.nodeType(1, elem) || hAzzle.nodeType(9, elem) || hAzzle.nodeType(11, elem) ? true : false;
    }

    // Global

    hAzzle.extend({

        getValue: function (elem) {

            if (elem.nodeName === 'SELECT' && elem.multiple) {

                var option,
                    options = elem.options,
                    index = elem.selectedIndex,
                    one = elem.type === "select-one" || index < 0,
                    values = one ? null : [],
                    value,
                    max = one ? index + 1 : options.length,
                    i = index < 0 ?
                        max :
                        one ? index : 0;

                for (; i < max; i++) {

                    option = options[i];

                    if ((option.selected || i === index) && !option.disabled &&
                        (!option.parentNode.disabled || !hAzzle.nodeName(option.parentNode, "optgroup"))) {

                        // Get the specific value for the option
                        value = hAzzle(option).val();

                        // We don't need an array for one selects
                        if (one) {
                            return value;
                        }

                        // Multi-Selects return an array
                        values.push(value);
                    }
                }
                return values;
            }

            // Return normal value

            return elem.value;
        },


        /**
         * Get text
         */

        getText: function (elem) {
            var node, ret = "",
                i = 0;

            if (!elem.nodeType) {
                // If no nodeType, this is expected to be an array
                for (; node = elem[i++];) ret += hAzzle.getText(node);

            } else if (NodeMatching(elem)) {

                if (hAzzle.isString(elem.textContent)) return elem.textContent;
                for (elem = elem.firstChild; elem; elem = elem.nextSibling) ret += hAzzle.getText(elem);

            } else if (hAzzle.nodeType(3, elem) || hAzzle.nodeType(4, elem)) {
                return elem.nodeValue;
            }
            return ret;
        },

        prop: function (elem, name, value) {
            // don't get/set properties on text, comment and attribute nodes
            if (!(hAzzle.nodeType(2, elem) || hAzzle.nodeType(3, elem) || hAzzle.nodeType(8, elem))) {
                return name = propMap[name] || name, value !== undefined ? elem[name] = value : elem[name];
            }
        },

        attr: function (elem, name, value) {
            if (!(hAzzle.nodeType(2, elem) || hAzzle.nodeType(3, elem) || hAzzle.nodeType(8, elem))) {
                if ("undefined" === typeof elem.getAttribute) return hAzzle.prop(elem, name, value);
                if (hAzzle.isUndefined(value)) {
                    if (name === "value" && name.nodeName.toLowerCase() === "input") return hAzzle.getValue(elem);
                    elem = elem.getAttribute(name);
                    return null === elem ? undefined : elem;
                }
                return elem.setAttribute(name, value + "");
            }
        }

    });


    // Core

    hAzzle.fn.extend({

        /**
         * Get text for the first element in the collection
         * Set text for every element in the collection
         *
         * hAzzle('div').text() => div text
         *
         * @param {String} value
         * @param {String} dir
         * @return {Object|String}
         *
         * NOTE!!
         *
         *  insertAdjacentText is faster then textContent, but not supported by Firefox, so we have to check for that.
         *
         * 'dir' let user choose where to insert the text - start- center - end of a sentence. This is NOT WORKING in
         *	Firefox because of the missing feature. Need to fix this ASAP!!
         */

        text: function (value, dir) {
            return hAzzle.isUndefined(value) ?
                hAzzle.getText(this) :
                this.empty().each(function () {
                    if (NodeMatching(this)) {
                        if (hAzzle.isDefined(HTMLElement) && HTMLElement.prototype.insertAdjacentText) {
                            this.insertAdjacentText(direction[dir] ? direction[dir] : 'beforeEnd', value);
                        } else {
                            this.textContent = value;
                        }
                    }
                });
        },

        /**
         * Get html from element.
         * Set html to element.
         *
         * @param {String} value
         * @param {String} dir
         * @return {Object|String}
         */

        html: function (value, dir) {

            if (value === undefined && this[0].nodeType === 1) {
                return this[0].innerHTML;
            }

            if (hAzzle.isString(value)) {
                return this.removeData().each(function () {
                    if (hAzzle.nodeType(1, this)) {
                        this.textContent = '';
                        this.insertAdjacentHTML('beforeend', value || '');
                    }
                });
            }
            return this.empty().append(value);
        },

        /**
         * Get value for input/select elements
         * Set value for input/select elements
         *
         * @param {String} value
         * @return {Object|String}
         */
        val: function (value) {

            return value ? this.each(function (index, elem) {
                var val;

                if (!hAzzle.nodeType(1, elem)) {
                    return;
                }

                if (hAzzle.isFunction(value)) {
                    val = value.call(elem, index, hAzzle(elem).val());
                } else {
                    val = value;
                }

                if (val === null) {

                    val = "";

                } else if (typeof val === "number") {
                    val += "";
                }

                elem.value = val;
            }) : this[0] && hAzzle.getValue(this[0]);
        },

        /**
         * Get attribute from element
         * Set attribute to element collection
         *
         * @param {String} name
         * @param {String|Object} value
         *
         * @return {Object|String}
         */

        attr: function (name, value) {
            return hAzzle.isObject(name) ? this.each(function (index, element) {
                hAzzle.each(name, function (key, value) {
                    hAzzle.attr(element, key, value);
                });
            }) : hAzzle.isUndefined(value) ? hAzzle.attr(this[0], name) : this.length === 1 ? hAzzle.attr(this[0], name, value) : this.each(function () {
                return hAzzle.attr(this, name, value);
            })
        },

        /**
         * Remove a given attribute from an element
         *
         * @param {String} value
         *
         * @return {Object}
         */

        removeAttr: function (value) {
            var elem, name, propName, i, attrNames = value && value.match((/\S+/g));
            return this.each(function () {
                elem = this;
                i = 0;

                if (attrNames && hAzzle.nodeType(1, elem)) {
                    while ((name = attrNames[i++])) {
                        propName = propMap[name] || name;
                        if (getBooleanAttrName(elem, name)) {
                            elem[propName] = false;
                        }
                        elem.removeAttribute(name);
                    }
                }
            });
        },

        /**
         * Read or set properties of DOM elements
         *
         * @param {String/Object}
         * @param {String/Null}
         *
         * @return {Object}
         */
        prop: function (name, value) {
            return hAzzle.isObject(name) ? this.each(function (value, element) {
                hAzzle.each(name, function (key, value) {
                    hAzzle.prop(element, key, value);
                });
            }) : hAzzle.isUndefined(value) ? this[0] && this[0][propMap[name] || name] : hAzzle.prop(element, key, value);
        },


        /**
         * Append node to one or more elements.
         *
         * @param {Object|String} html
         * @return {Object}
         *
         */

        append: function (html) {
            return this.each(function () {
                if (hAzzle.isString(html)) {
                    this.insertAdjacentHTML('beforeend', html);
                } else {
                    if (html instanceof hAzzle) {

                        if (html.length === 1) {
                            return this.appendChild(html[0]);
                        }

                        var _this = this;
                        return hAzzle.each(html, function () {
                            _this.appendChild(this);
                        });
                    }

                    this.appendChild(html);
                }
            });
        },

        /**
         * Append the current element to another
         *
         * @param {Object|String} sel
         * @return {Object}
         */

        appendTo: function (sel) {
            return this.each(function () {
                hAzzle(selector).append(this);
            });
        },

        /**
         * Prepend node to element.
         *
         * @param {Object|String} html
         * @return {Object}
         *
         */

        prepend: function (html) {
            var first;
            return this.each(function () {
                if (hAzzle.isString(html)) {
                    this.insertAdjacentHTML('afterbegin', html);
                } else if (first = this.childNodes[0]) {
                    this.insertBefore(html, first);
                } else {
                    if (html instanceof hAzzle) {

                        if (html.length === 1) {
                            return this.appendChild(html[0]);
                        }

                        var _this = this;
                        return hAzzle.each(html, function () {
                            _this.appendChild(this);
                        });
                    }
                    this.appendChild(html);
                }
            });
        },

        /**
         * Prepend the current element to another.
         *
         * @param {Object|String} sel
         * @return {Object}
         */

        prependTo: function (sel) {
            return this.each(function () {
                hAzzle(selector).prepend(this);
            });
        },

        /**
         * Add node after element.
         *
         * @param {Object|String} html
         * @return {Object}
         */

        after: function (html) {
            var next;
            return this.each(function () {
                if (hAzzle.isString(html)) {
                    this.insertAdjacentHTML('afterend', html);
                } else if (next = hAzzle.getClosestNode(this, 'nextSibling')) {

                    if (html instanceof hAzzle) {
                        if (this.parentNode) this.parentNode.insertBefore(html[0], next);
                    } else {
                        if (this.parentNode) this.parentNode.insertBefore(html, next);
                    }
                } else {
                    if (html instanceof hAzzle) {
                        if (this.parentNode) this.parentNode.appendChild(html[0]);
                    } else {
                        if (this.parentNode) this.parentNode.appendChild(html);
                    }
                }
            });
        },

        /**
         * Add node before element.
         *
         * @param {Object|String} html
         * @return {Object}
         */

        before: function (html) {
            return this.each(function () {

                if (hAzzle.isString(html)) {
                    this.insertAdjacentHTML('beforebegin', html);
                } else {
                    if (html instanceof hAzzle) {
                        if (this.parentNode) this.parentNode.insertBefore(html[0], this);
                    } else {
                        if (this.parentNode) this.parentNode.insertBefore(html, this);
                    }
                }
            });
        },

        /**
         * Replace each element in the set of matched elements with the provided new content
         *
         * @param {String} html
         * @return {Object}
         */

        replaceWith: function (html) {
            if (typeof html === "string") return this.before(html).remove()
        }

    });


    // Traversing


    hAzzle.fn.extend({

        /**
         * Fetch property from elements
         *
         * @param {String} prop
         * @return {Array}
         */

        pluckNode: function (prop) {
            return this.map(function (element) {
                return hAzzle.getClosestNode(element, prop);
            });
        },

        /**
         * Get the  element that matches the selector, beginning at the current element and progressing up through the DOM tree.
         *
         * @param {String} sel
         * @return {Object}
         */

        closest: function (sel) {
            return this.map(function (elem) {
                // Only check for match if nodeType 1
                if (hAzzle.nodeType(1, elem) && hAzzle.matches(elem, sel)) {
                    return elem;
                }
                // Exclude document fragments
                return hAzzle.getClosestNode(elem, 'parentNode', sel, /* NodeType 11 */ 11);
            });
        },

        /** Determine the position of an element within the matched set of elements
         *
         * @param {string} elem
         * @param {return} Object
         */

        index: function (elem) {
            return elem ? this.indexOf(hAzzle(elem)[0]) : this.parent().children().indexOf(this[0]) || -1;
        },

        /**
         * Adds one element to the set of matched elements.
         *
         * @param {String} sel
         * @param {String} ctx
         * @return {Object}
         */

        add: function (sel, ctx) {
            var elements = sel;
            if (hAzzle.isString(sel)) {
                elements = hAzzle(sel, ctx).elems;
            }
            return this.concat(elements);
        },

        /**
         * Get immediate parents of each element in the collection.
         * If CSS selector is given, filter results to include only ones matching the selector.
         *
         * @param {String} sel
         * @return {Object}
         */

        parent: function (sel) {
            return hAzzle(this.pluck('parentNode'), sel, /* NodeType 11 */ 11);
        },

        /**
         *  Get the ancestors of each element in the current set of matched elements
         *
         * @param {String} sel
         * @return {Object}
         */

        parents: function (sel) {
            var ancestors = [],
                elements = this.elems,
                fn = function (element) {
                    if ((element = element.parentNode) && element !== document && ancestors.indexOf(element) < 0) {
                        ancestors.push(element);
                        return element;
                    }
                };

            while (elements.length > 0 && elements[0] !== undefined) {
                elements = elements.map(fn);
            }

            return hAzzle.create(ancestors, sel);
        },

        /**
         * Get all decending elements of a given element
         * If selector is given, filter the results to only include ones matching the CSS selector.
         *
         * @param {String} sel
         * @return {Object}
         */

        children: function (sel) {
            return hAzzle.create(this.reduce(function (elements, elem) {
                var childrens = slice.call(elem.children);
                return elements.concat(childrens);
            }, []), sel);
        },

        /**
         *  Return the element's next sibling
         *
         * @return {Object}
         */

        next: function (selector) {
            return selector ? hAzzle(this.pluckNode('nextSibling').filter(selector)) : hAzzle(this.pluckNode('nextSibling'));
        },

        /**
         *  Return the element's previous sibling
         *
         * @return {Object}
         */

        prev: function (selector) {
            return selector ? hAzzle(this.pluckNode('previousSibling').filter(selector)) : hAzzle(this.pluckNode('previousSibling'));
        },

        /**
         * Reduce the set of matched elements to the first in the set.
         */

        first: function () {
            return hAzzle(this.get(0));
        },

        /**
         * Reduce the set of matched elements to the last one in the set.
         */

        last: function () {
            return hAzzle(this.get(-1));
        },

        /**
         * Return the element's siblings
         * @param {String} sel
         * @return {Object}
         */

        siblings: function (sel) {
            var siblings = [],
                children,
                elem,
                i,
                len;

            if (!cached[sel]) {
                this.each(function () {
                    elem = this;
                    children = slice.call(elem.parentNode.childNodes);

                    for (i = 0, len = children.length; i < len; i++) {
                        if (hAzzle.isElement(children[i]) && children[i] !== elem) {
                            siblings.push(children[i]);
                        }
                    }
                });
                cached[sel] = siblings;
            }
            return hAzzle.create(cached[sel], sel);
        }

    });

    // Parsing
    hAzzle.extend({

        /**
         * Cross-browser JSON parsing
         *
         * @param {String} data
         */

        parseJSON: function (data) {
            return JSON.parse(data + "");
        },

        parseXML: function (data) {
            var xml, tmp;
            if (!data || typeof data !== "string") {
                return null;
            }

            // Support: IE9
            try {
                tmp = new DOMParser();
                xml = tmp.parseFromString(data, "text/xml");
            } catch (e) {
                xml = undefined;
            }

            if (!xml || xml.getElementsByTagName("parsererror").length) {
                return new Error("Invalid XML: " + data);
            }
            return xml;
        }

    });

    // CSS


    var
    cssNormalTransform = {
        letterSpacing: "0",
        fontWeight: "400"
    },
        cached = [],

        cssPrefixes = ["Webkit", "O", "Moz", "ms"],

        cssExpand = ["Top", "Right", "Bottom", "Left"],

        cssShow = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
        },

        rmargin = (/^margin/),
        rnumnonpx = /^([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(?!px)[a-z%]+$/i,
        rdisplayswap = /^(none|table(?!-c[ea]).+)/,
        pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source,
        rnumsplit = new RegExp("^(" + pnum + ")(.*)$", "i"),
        rrelNum = /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i;


    /**
     * Get the documents width or height
     * margin / padding are optional
     */

    function predefultValue(elem, name, extra) {

        if (!elem) return;

        if (hAzzle.isWindow(elem)) {
            return elem.document.documentElement.clientHeight;
        }

        // Get document width or height
        if (hAzzle.nodeType(9, elem)) {

            var doc = elem.documentElement;

            // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
            // whichever is greatest
            return Math.max(
                elem.body["scroll" + name], doc["scroll" + name],
                elem.body["offset" + name], doc["offset" + name],
                doc["client" + name]
            );
        }

        return hAzzle.css(elem, name, extra);
    }

    /**
     * Gets a window from an element
     */
    function getWindow(elem) {
        return hAzzle.isWindow(elem) ? elem : hAzzle.nodeType(9, elem) && elem.defaultView;
    }


    /**
     * Get styles
     */

    var getStyles = function (elem) {
        return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
    };

    function setPositiveNumber(value, subs) {
        var matches = rnumsplit.exec(value);
        return matches ? Math.max(0, matches[1] - (subs || 0)) + (matches[2] || "px") : value
    }

    function getWidthOrHeight(elem, name, extra) {
        var valueIsBorderBox = true,
            val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
            styles = getStyles(elem),
            isBorderBox = hAzzle.css(elem, "boxSizing", false, styles) === "border-box";

        if (val <= 0 || val === null) {
            val = curCSS(elem, name, styles);

            if (val < 0 || val === null) val = elem.style[name];

            if (rnumnonpx.test(val)) return val;

            valueIsBorderBox = isBorderBox && (hAzzle.support.boxSizingReliable() || val === elem.style[name]);
            val = parseFloat(val) || 0;

        }
        return val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles) + "px";
    }


    function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {

        var i = extra === (isBorderBox ? "border" : "content") ? 4 : name === "width" ? 1 : 0,

            val = 0;

        for (; i < 4; i += 2) {

            // both box models exclude margin, so add it if we want it
            if (extra === "margin") {
                val += hAzzle.css(elem, extra + cssExpand[i], true, styles);
            }

            if (isBorderBox) {
                // border-box includes padding, so remove it if we want content
                if (extra === "content") {
                    val -= hAzzle.css(elem, "padding" + cssExpand[i], true, styles);
                }

                // at this point, extra isn't border nor margin, so remove border
                if (extra !== "margin") {
                    val -= hAzzle.css(elem, "border" + cssExpand[i] + "Width", true, styles);
                }
            } else {
                // at this point, extra isn't content, so add padding
                val += hAzzle.css(elem, "padding" + cssExpand[i], true, styles);

                // at this point, extra isn't content nor padding, so add border
                if (extra !== "padding") {
                    val += hAzzle.css(elem, "border" + cssExpand[i] + "Width", true, styles);
                }
            }
        }

        return val;
    }

    /**
     * Check if an element is hidden
     *  @return {Boolean}
     */

    function isHidden(elem, el) {
        elem = el || elem;
        return elem.style.display === "none";
    }

    /**
     * Show an element
     *
     * @param {Object} elem
     * @return Object}
     */

    function show(elem) {

        if (isHidden(elem))
            return hAzzle.style(elem, 'display', hAzzle.data(elem, 'display') || 'block');
    }

    /**
     * Hide an element
     *
     * @param {Object} elem
     * @return Object}
     */

    function hide(elem) {

        if (!isHidden(elem)) {

            var display = hAzzle.css(elem, 'display');
            if (display !== 'none') {
                hAzzle.data(elem, 'display', display);
            }

            // Hide the element
            hAzzle.style(elem, 'display', 'none');
        }
    }


    /**
     * Set and get CSS properties
     * @param {Object} elem
     * @param {String} name
     * @param {String} computed
     * @return {Object}
     *
     */

    function curCSS(elem, name, computed) {
        var width, minWidth, maxWidth, ret,
            style = elem.style;

        computed = computed || getStyles(elem);

        if (computed) {
            ret = computed.getPropertyValue(name) || computed[name];
        }

        if (computed) {

            if (ret === "" && !hAzzle.contains(elem.ownerDocument, elem)) {
                ret = hAzzle.style(elem, name);
            }

            if (rnumnonpx.test(ret) && rmargin.test(name)) {

                // Remember the original values
                width = style.width;
                minWidth = style.minWidth;
                maxWidth = style.maxWidth;

                // Put in the new values to get a computed value out
                style.minWidth = style.maxWidth = style.width = ret;
                ret = computed.width;

                // Revert the changed values
                style.width = width;
                style.minWidth = minWidth;
                style.maxWidth = maxWidth;
            }
        }
        return ret !== undefined ? ret + "" : ret;
    }
    /*
     * Check up for vendor prefixed names
     * This function is cached so we can gain better speed
     */

    function vendorCheckUp(style, name) {

        if (!cached[style + name]) {
            // Shortcut for names that are not vendor prefixed
            if (name in style) {
                return name;
            }

            // check for vendor prefixed names
            var capName = name[0].toUpperCase() + name.slice(1),
                origName = name,
                i = cssPrefixes.length;

            while (i--) {
                name = cssPrefixes[i] + capName;
                if (name in style) {
                    return name;
                }
            }
            cached[style + name] = origName;

        }
        return cached[style + name];

    }


    hAzzle.extend({

        cssProps: {

            "float": "cssFloat"
        },

        // Don't automatically add "px" to these possibly-unitless properties
        cssNumber: {
            "columnCount": true,
            "fillOpacity": true,
            "flexGrow": true,
            "flexShrink": true,
            "fontWeight": true,
            "lineHeight": true,
            "opacity": true,
            "order": true,
            "orphans": true,
            "widows": true,
            "zIndex": true,
            "zoom": true
        },

        /**
         * cssHooks similar to hAzzle
         *
         * We are in 2014 and hAzzle supports cssHooks because we need to
         * support short-hands, and a lot of HTML5 features
         * supported by IE9 and newer browsers
         */

        cssHooks: {
            'opacity': {
                get: function (elem, computed) {
                    if (computed) {
                        // We should always get a number back from opacity
                        var ret = curCSS(elem, "opacity");
                        return ret === "" ? "1" : ret;
                    }
                }
            }
        },

        // Convert some pixels into another CSS unity.
        // It's used in $.style() for the += or -=.
        // * px   : Number.
        // * unit : String, like "%", "em", "px", ...
        // * elem : Node, the current element.
        // * prop : String, the CSS property.
        pixelsToUnity: function (px, unit, elem, prop) {

            if (unit === "" || unit === "px") return px; // Don't waste our time if there is no conversion to do.

            else if (unit === "em") return px / hAzzle.css(elem, "fontSize", ""); // "em" refers to the fontSize of the current element.
            else if (unit === "%") {

                if (/^(left$|right$|margin|padding)/.test(prop)) {
                    prop = "width";
                } else if (/^(top|bottom)$/.test(prop)) {
                    prop = "height";
                }
                elem = /^(relative|absolute|fixed)$/.test(hAzzle.css(elem, "position")) ?
                    elem.offsetParent : elem.parentNode;
                if (elem) {
                    prop = hAzzle.css(elem, prop, true);
                    if (prop !== 0) {
                        return px / prop * 100;
                    }
                }
                return 0;
            }

            if (hAzzle.pixelsToUnity.units === undefined) {
                var units = hAzzle.pixelsToUnity.units = {},
                    div = document.createElement("div");
                div.style.width = "100cm";
                document.body.appendChild(div); // If we don't link the <div> to something, the offsetWidth attribute will be not set correctly.
                units.mm = div.offsetWidth / 1000;
                document.body.removeChild(div);
                units.cm = units.mm * 10;
                units.inn = units.cm * 2.54;
                units.pt = units.inn * 1 / 72;
                units.pc = units.pt * 12;
            }
            // If the unity specified is not recognized we return the value.
            unit = hAzzle.pixelsToUnity.units[unit];
            return unit ? px / unit : px;
        },


        // Globalize CSS

        css: function (elem, name, extra, styles) {

            var val, perf;

            // Normalize the property name 

            perf = hAzzle.camelCase(name);

            name = hAzzle.cssProps[perf] || (hAzzle.cssProps[perf] = vendorCheckUp(elem.style, perf));
            (perf = hAzzle.cssHooks[name] || hAzzle.cssHooks[perf]) && "get" in perf && (val = perf.get(elem, true, extra));
            val === undefined && (val = curCSS(elem, name, styles));
            val === "normal" && name in cssNormalTransform && (val = cssNormalTransform[name]);
            return "" === extra || extra ? (elem = parseFloat(val), extra === true || hAzzle.isNumeric(elem) ? elem || 0 : val) : val
        },

        style: function (elem, name, value, extra) {

            // Don't set styles on text and comment nodes
            if (!elem || hAzzle.nodeType(3, elem) || hAzzle.nodeType(8, elem) || !elem.style) {
                return;
            }

            // Make sure that we're working with the right name
            var ret, type, hooks,
                origName = hAzzle.camelCase(name),
                style = elem.style;

            name = hAzzle.cssProps[origName] || (hAzzle.cssProps[origName] = vendorCheckUp(elem.style, origName));
            hooks = hAzzle.cssHooks[name] || hAzzle.cssHooks[origName];

            // Check if we're setting a value
            if (value !== undefined) {
                type = typeof value;

                /**
                 * Convert relative numbers to strings.
                 * It can handle +=, -=, em or %
                 */

                if (type === "string" && (ret = rrelNum.exec(value))) {
                    value = hAzzle.css(elem, name, "", "", name, hooks);
                    value = hAzzle.pixelsToUnity(value, ret[3], elem, name) + (ret[1] + 1) * ret[2];
                    type = "number";
                }

                // Make sure that null and NaN values aren't set.
                if (value === null || value !== value) {
                    return;
                }

                // If a number was passed in, add 'px' to the (except for certain CSS properties)
                if (type === "number" && !hAzzle.cssNumber[origName]) {

                    value += ret && ret[3] ? ret[3] : "px";
                }

                if (value === "" && /background/i.test(name)) {
                    style[name] = "inherit";
                }

                // If a hook was provided, use that value, otherwise just set the specified value
                if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== undefined) {
                    style[name] = value;
                }

            } else {

                // Get the value from the style object
                return style[name];
            }

        }

    });

    /**
     * CSS hooks height && width
     */

    hAzzle.each(["height", "width"], function (i, name) {

        hAzzle.cssHooks[name] = {
            get: function (elem, computed, extra) {
                if (computed) {
                    return elem.offsetWidth === 0 && rdisplayswap.test(hAzzle.css(elem, "display")) ?
                        hAzzle.swap(elem, cssShow, function () {
                            return getWidthOrHeight(elem, name, extra);
                        }) :
                        getWidthOrHeight(elem, name, extra);
                }
            },

            set: function (elem, value, extra) {
                var styles = extra && getStyles(elem);
                return setPositiveNumber(value, extra ?
                    augmentWidthOrHeight(
                        elem,
                        name,
                        extra,
                        hAzzle.css(elem, "boxSizing", false, styles) === "border-box",
                        styles
                    ) : 0
                );
            }
        };

    });

    hAzzle.fn.extend({

        /**
         * Show elements in collection
         *
         * @return {Object}
         */

        show: function () {
            return this.each(function () {
                show(this);
            });
        },

        /**
         * Hide elements in collection
         *
         * @return {Object}
         */

        hide: function () {
            return this.each(function () {
                hide(this);
            });
        },

        /**
         * Toggle show/hide.
         * @return {Object}
         */

        toggle: function (state) {
            if (typeof state === "boolean") {
                return state ? this.show() : this.hide();
            }
            return this.each(function () {

                if (isHidden(this)) show(this);
                else hide(this);
            });
        },

        /**
         * Get css property
         * Set css properties
         *
         * @param {String|Object} name
         * @param {String} value
         * @return {String|Object}
         */

        css: function (name, value) {
            if (hAzzle.isDefined(value)) return this.length === 1 ? hAzzle.style(this[0], name, value) : this.each(function () {
                hAzzle.style(this, name, value);
            });
            if (hAzzle.isUndefined(value)) return hAzzle.isString(name) ? this[0] && hAzzle.css(this[0], name) : this.each(function () {
                var elem = this;
                hAzzle.each(name, function (name, value) {
                    hAzzle.style(elem, name, value);
                });
            });
        },

        /**
         * Sets the opacity for given element
         *
         * @param elem
         * @param {int} level range (0 .. 100)
         */

        setOpacity: function (value) {
            if (hAzzle.isNumber) {
                return this.each(function () {
                    this.style.opacity = value / 100;
                });
            }
        },

        /**
         * Read or write an element's height exluding margin, padding and border
         *
         * @param {Integer} value
         * @return {String}
         */

        height: function (value) {
            return hAzzle.isDefined(value) ? this.each(function () {
                hAzzle.style(this, "height", value);
            }) : predefultValue(this[0], "height", "content");
        },

        /**
         * Read an element's height including padding, border and optional margin
         *
         * @param {Boolean} includeMargin
         * @return {String}
         */
        outerHeight: function (margin) {
            return predefultValue(this[0], 'height', typeof margin === "boolean" ? "margin" : "border");
        },

        innerHeight: function () {
            return predefultValue(this[0], 'height', 'padding');
        },

        width: function (value) {
            return hAzzle.isDefined(value) ? this.each(function () {
                hAzzle.style(this, "width", value);
            }) : predefultValue(this[0], "width", "content");
        },

        /**
         * Read an element's width including padding, border and optional margin
         *
         * @param {Boolean} includeMargin
         * @return {String}
         */


        outerWidth: function (margin, value) {
            return predefultValue(this[0], 'width', typeof margin === "boolean" ? "margin" : "border", typeof value === true ? "margin" : "border");
        },

        innerWidth: function () {
            return predefultValue(this[0], 'width', "padding");
        },

        /**
         *  ScrollTop
         */

        scrollTop: function (val) {
            var elem = this[0],
                win = getWindow(elem);
            if (val === undefined) return val ? val.pageYOffset : elem.scrollTop;
            win ? win.scrollTo(window.pageYOffset) : elem.scrollTop = val;
        },

        /**
         *  ScrollLeft
         */

        scrollLeft: function (val) {
            var elem = this[0],
                win = getWindow(elem);
            if (val === undefined) return val ? val.pageXOffset : elem.scrollLeft;
            win ? win.scrollTo(window.pageXOffset) : elem.scrollLeft = val;

        },

    });

    // Ajax

    var xmlHttpRequest = 'XMLHttpRequest',
        crElm = 'createElement',
        own = 'hasOwnProperty',
        head = doc.head || doc[byTag]('head')[0],
        uniqid = 0,
        lastValue, // data stored by the most recent JSONP callback
        nav = navigator,
        isIE10 = hAzzle.indexOf(nav.userAgent, 'MSIE 10.0') !== -1,
        uniqid = 0,
        lastValue,

        getTime = (Date.now || function () {
            return new Date().getTime();
        }),

        defaultHeaders = {
            contentType: "application/x-www-form-urlencoded; charset=UTF-8", // Force UTF-8
            requestedWith: xmlHttpRequest,
            accepts: {
                '*': "*/".concat("*"),
                'text': 'text/plain',
                'html': 'text/html',
                'xml': 'application/xml, text/xml',
                'json': 'application/json, text/javascript',
                'js': 'application/javascript, text/javascript'
            }
        };

    /**
     * Convert to query string
     *
     * @param {Object} obj
     *
     * @return {String}
     *
     * - Taken from jQuery and optimized it for speed
     *
     */

    function ctqs(o, trad) {

        var prefix, i,
            traditional = trad || false,
            s = [],
            enc = encodeURIComponent,
            add = function (key, value) {
                // If value is a function, invoke it and return its value
                value = (hAzzle.isFunction(value)) ? value() : (value === null ? '' : value);
                s[s.length] = enc(key) + '=' + enc(value);
            };
        // If an array was passed in, assume that it is an array of form elements.
        if (hAzzle.isArray(o))
            for (i = 0; o && i < o.length; i++) add(o[i].name, o[i].value);
        else
            for (i = 0; prefix = nativeKeys(o)[i]; i += 1)
                buildParams(prefix, o[prefix], traditional, add, o);
        return s.join('&').replace(/%20/g, '+');
    }

    /**
     * Build params
     */

    function buildParams(prefix, obj, traditional, add, o) {
        var name, i, v, rbracket = /\[\]$/;

        if (hAzzle.isArray(obj)) {
            for (i = 0; obj && i < obj.length; i++) {
                v = obj[i];
                if (traditional || rbracket.test(prefix)) {
                    // Treat each array item as a scalar.
                    add(prefix, v);
                } else buildParams(prefix + '[' + (hAzzle.isObject(v) ? i : '') + ']', v, traditional, add);
            }
        } else if (obj && obj.toString() === '[object Object]') {
            // Serialize object item.
            for (name in obj) {
                if (o[own](prefix)) buildParams(prefix + '[' + name + ']', obj[name], traditional, add);
            }

        } else add(prefix, obj);
    }

    /**
     *  Url append
     *
     * @param {String} url
     * @param {String} query
     * @return {String}
     */

    function appendQuery(url, query) {
        return (url + '&' + query).replace(/[&?]+/, '?')
    }

    /**
     * General jsonP callback
     *
     * @param {String} url
     * @param {String} s
     *
     * @return {String}
     **/

    function generalCallback(data) {
        lastValue = data;
    }

    /**
		* jsonP

		*
		* @param {Object} o
		* @param {Function} fn
		* @param {String} url
		*
		* @return {Object}
		
		**/
    function handleJsonp(o, fn, url) {

        var reqId = uniqid++,
            cbkey = o.jsonpCallback || 'callback'; // the 'callback' key

        o = o.jsonpCallbackName || 'hAzzel_' + getTime(); // the 'callback' value

        var cbreg = new RegExp('((^|\\?|&)' + cbkey + ')=([^&]+)'),
            match = url.match(cbreg),
            script = doc[crElm]('script'),
            loaded = 0;

        if (match) {
            if (match[3] === '?') url = url.replace(cbreg, '$1=' + o); // wildcard callback func name
            else o = match[3]; // provided callback func name
        } else url = appendQuery(url, cbkey + '=' + o); // no callback details, add 'em


        win[o] = generalCallback;

        script.type = 'text/javascript';
        script.src = url;
        script.async = true;


        hAzzle.isDefined(script.onreadystatechange) && !isIE10 && (script.event = "onclick", script.htmlFor = script.id = "_hAzzel_" + reqId);

        script.onload = script.onreadystatechange = function () {

            if (script.readyState && script.readyState !== 'complete' && script.readyState !== 'loaded' || loaded) {
                return false;
            }
            script.onload = script.onreadystatechange = null;
            if (script.onclick) script.onclick();
            // Call the user callback with the last value stored and clean up values and scripts.
            fn(lastValue);
            lastValue = undefined;
            head.removeChild(script);
            loaded = 1;
        };

        // Add the script to the DOM head
        head.appendChild(script);

        // Enable JSONP timeout
        return {
            abort: function () {
                script.onload = script.onreadystatechange = null;
                lastValue = undefined;
                head.removeChild(script);
                loaded = 1;
            }
        };
    }



    hAzzle.extend({

        /**
         * Ajax method to create ajax request with XMLHTTPRequest
         *
         * @param {Object|Function} opt
         * @param {function|callback} fn
         * @return {Object}
         */

        ajax: function (opt, fn) {

            // Force options to be an object

            opt = opt || {};

            fn = fn || function () {};

            var xhr,
                xDomainRequest = 'XDomainRequest',

                error = 'error',
                headers = opt.headers || {},
                props = nativeKeys(headers),
                index = -1,
                length = props.length,
                method = (opt.method || 'GET').toLowerCase(),
                url = hAzzle.isString(opt) ? opt : opt.url; // URL or options with URL inside. 
            var type = (opt.type) ? opt.type.toLowerCase() : '',
                abortTimeout = null,
                processData = opt.processData || true, // Set to true as default
                data = (processData !== false && opt.data && !hAzzle.isString(opt.data)) ? ctqs(opt.data) : (opt.data || null),
                sendWait = false;

            // If no url, stop here and return.

            if (!url) return false;

            // If jsonp or GET, append the query string to end of URL

            if ((type === 'jsonp' || method.toLowerCase() === 'get') && data) url = appendQuery(url, data), data = null;

            // If jsonp, we stop it here 

            if (type === 'jsonp' && /(=)\?(?=&|$)|\?\?/.test(url)) return handleJsonp(opt, fn, url);

            if (opt.crossOrigin === true) {
                var _xhr = win.XMLHttpRequest ? new XMLHttpRequest() : null;
                if (_xhr && 'withCredentials' in _xhr) xhr = _xhr;
                else if (win.xDomainRequest) xhr = new xDomainRequest();
                else throw "Browser does not support cross-origin requests";
            }

            xhr.open(method, url, opt.async === false ? false : true);

            // Set headers

            headers.Accept = headers.Accept || defaultHeaders.accepts[type] || defaultHeaders.accepts['*'];

            if (!opt.crossOrigin && !headers.requestedWith) headers.requestedWith = defaultHeaders.requestedWith;

            if (opt.contentType || opt.data && type.toLowerCase() !== 'get') xhr.setRequestHeader('Content-Type', (opt.contentType || 'application/x-www-form-urlencoded'));

            // Set headers

            while (++index < length) {
                xhr.setRequestHeader(hAzzle.trim(props[index]), headers[props[index]]);
            }

            // Set credentials

            if (hAzzle.isDefined(opt.withCredentials) && hAzzle.isDefined(xhr.withCredentials)) {
                xhr.withCredentials = !! opt.withCredentials;
            }

            if (opt.timeout > 0) {
                abortTimeout = setTimeout(function () {
                    xhr.abort(); // Or should we use self.abort() ??
                }, opt.timeout);
            }

            if (win[xDomainRequest] && xhr instanceof win.xDomainRequest) {
                xhr.onload = fn;
                xhr.onerror = err;
                xhr.onprogress = function () {};
                sendWait = true;
            } else {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {

                        // Determine if successful

                        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304) {
                            var res;
                            if (xhr) {

                                // json

                                if ((type === 'json' || false) && (res = JSON.parse(xhr.responseText)) === null) res = xhr.responseText;

                                // xml

                                if (type === 'xml') {

                                    res = xhr.responseXML && xhr.responseXML.parseError && xhr.responseXML.parseError.errorCode && xhr.responseXML.parseError.reason ? null : xhr.responseXML;

                                } else {

                                    res = res || xhr.responseText;
                                }
                            }
                            if (!res && data) res = data;
                            if (opt.success) opt.success(res);
                        } else if (opt.error !== undefined) {
                            if (abortTimeout !== null) clearTimeout(abortTimeout);
                            opt.error(error, opt, xhr);
                        }
                    }
                };
            }

            // Before open

            if (opt.before) opt.before(xhr);

            if (sendWait) {
                setTimeout(function () {

                    xhr.send(data);
                }, 200);
            } else xhr.send(data);

            return xhr;
        },


        /** Shorthand function to recive JSON data with ajax
         *
         * @param {String} url
         * @param {Object} data
         * @param {Function} callback
         * @param {Function} callback
         * @return {Object}
         */

        getJSON: function (url, data, callback, error) {

            hAzzle.ajax({
                url: url,
                method: 'JSON',
                contentType: 'application/json',
                error: hAzzle.isFunction(error) ? error : function (err) {},
                data: hAzzle.isObject(data) ? data : {},
                success: hAzzle.isFunction ? callback : function (err) {}
            });
        },

        /** Shorthand function to recive GET data with ajax
         *
         * @param {String} url
         * @param {Object} data
         * @param {Function} callback
         * @param {Function} callback
         * @return {Object}
         */

        get: function (url, data, callback, error) {

            hAzzle.ajax({
                url: url,
                method: 'GET',
                contentType: '',
                error: hAzzle.isFunction(error) ? error : function (err) {},
                data: hAzzle.isObject(data) ? data : {},
                success: hAzzle.isFunction ? callback : function (err) {}
            });
        },

        /** Shorthand function to recive POST data with ajax
	
		 *
		 * @param {String} url
		 * @param {Object} data
		 * @param {Function} callback
		 * @param {Function} callback
		 * @return {Object}
		 */

        post: function (url, data, callback, error) {
            hAzzle.ajax({
                url: url,
                method: 'POST',
                contentType: '',
                error: hAzzle.isFunction(error) ? error : function (err) {},
                data: hAzzle.isObject(data) ? data : {},
                success: hAzzle.isFunction ? callback : function (err) {}
            });
        }
    });


    window['hAzzle'] = hAzzle;

})(window);