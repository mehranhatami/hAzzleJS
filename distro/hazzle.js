/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight
 * Version: 0.29d - Beta 3
 * Released under the MIT License.
 *
 * Date: 2014-04-12
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

            if (index == null) {
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

        reduce: function (index, list) {
            var initial = arguments.length > 2;
            hAzzle.each(this.elems, function (value, index, list) {
                if (!initial) {
                    memo = value;
                    initial = true;
                } else {
                    memo = iterator.call(context, memo, value, index, list);
                }
            })
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

            for (var name in obj) {
                return false;
            }
            return true;
        },

        isFunction: function (value) {
            return typeof value === 'function';
        },

        isArray: Array.isArray, //use native version here

        isArrayLike: function (elem) {
            if (elem === null || this.isWindow(elem)) return false;

        },

        likeArray: function (obj) {
            return typeof obj.length == 'number';
        },

        isWindow: function (obj) {
            return obj != null && obj == obj.window
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
        grep: function (elems, callback, invert) {
            var callbackInverse,
                matches = [],
                i = 0,
                length = elems.length,
                callbackExpect = !invert;

            for (; i < length; i++) {
                callbackInverse = !callback(elems[i], i);
                if (callbackInverse !== callbackExpect) {
                    matches.push(elems[i]);
                }
            }

            return matches;
        }
    });

    /**
     * Setting up the nodeTypes we are using
     */

    hAzzle.each(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], function (value) {
        nodeTypes[value] = function (elem) {
            if (elem.nodeType === value) return true;
        };
    });

    /**
     * hAzzle selector engine
     *
     * This is a separate module. It can can be replaced with the selector engine you want to use.
     * Just make sure the returned result are a "flattened" array before returning to hAzzle Core.
     *
     * It's using QuerySelectorAll (QSA) with a few pseudos
     *
     **/

    var byClass = 'getElementsByClassName',
        byTag = 'getElementsByTagName',
        byId = 'getElementById',
        nodeType = 'nodeType',
        byAll = 'querySelectorAll',

        // RegExp we are using

        expresso = {

            idClassTagNameExp: /^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/,
            tagNameAndOrIdAndOrClassExp: /^(\w+)(?:#([\w-]+)|)(?:\.([\w-]+)|)$/,
            pseudos: /(.*):(\w+)(?:\(([^)]+)\))?$\s*/
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

        pseudos: {
            disabled: function () {
                return this.disabled === true;
            },
            enabled: function () {
                return this.disabled === false && this.type !== "hidden";
            },
            selected: function () {

                if (this.parentNode) {
                    this.parentNode.selectedIndex;
                }

                return this.selected === true;
            },
            checked: function () {
                var nodeName = this.nodeName.toLowerCase();
                return (nodeName === "input" && !! this.checked) || (nodeName === "option" && !! this.selected);
            },
            parent: function () {
                return this.parentNode;
            },
            first: function (elem) {
                if (elem === 0) return this;
            },
            last: function (elem, nodes) {
                if (elem === nodes.length - 1) return this;
            },
            empty: function () {
                var elem = this;
                for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                    if (elem.nodeType < 6) {
                        return false;
                    }
                }
                return true;
            },
            eq: function (elem, _, value) {
                if (elem === value) return this;
            },
            contains: function (elem, _, text) {
                if (hAzzle(this).text().indexOf(text) > -1) return this;
            },
            has: function (elem, _, sel) {
                if (hAzzle.qsa(this, sel).length) return this;
            },
            radio: function () {
                return "radio" === this.type;
            },
            checkbox: function () {
                return "checkbox" === this.type;
            },
            file: function () {
                return "file" === this.type;
            },
            password: function () {
                return "password" === this.type;
            },
            submit: function () {
                return "submit" === this.type;
            },
            image: function () {
                return "image" === this.type;
            },
            button: function () {
                var name = this.nodeName.toLowerCase();
                return name === "input" && this.type === "button" || name === "button";
            },
            target: function () {

                var hash = window.location && window.location.hash;
                return hash && hash.slice(1) === this.id;
            },
            input: function () {
                return (/input|select|textarea|button/i).test(this.nodeName);
            },
            focus: function () {
                return this === document.activeElement && (!document.hasFocus || document.hasFocus()) && !! (this.type || this.href || ~this.tabIndex);
            }
        },

        /*
         * QuerySelectorAll function
         */

        qsa: function (sel, ctx) {

            try {
                return ctx[byAll](sel);

            } catch (e) {
                console.error('error performing selector: %o', sel);
            }
        },

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
                hAzzle.each(result, function (_, res) {
                    if (res.id === id || containsClass(res, className)) els.push(res);
                });
            } else { // Pseudos

                if (m = expresso['pseudos'].exec(sel)) {

                    var filter = hAzzle.pseudos[m[2]],
                        arg = m[3];

                    sel = this.qsa(m[1], ctx);

                    els = hAzzle.unique(hAzzle.map(sel, function (n, i) {

                        try {
                            return filter.call(n, i, sel, arg);

                        } catch (e) {
                            console.error('error performing selector: %o', sel);
                        }


                    }));

                } else { // QuerySelectorAll

                    els = this.qsa(sel, ctx);
                }
            }
            return hAzzle.isNodeList(els) ? slice.call(els) : hAzzle.isElement(els) ? [els] : els;
        }
    });


    /*!
     * DOM ready
     */

    var readyList = [],
        readyFired = false,
        readyEventHandlersInstalled = false;

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

    hAzzle.extend({

        ready: function (callback, context) {

            // context are are optional, but document by default

            context = context || document;

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
            if (document.readyState === "complete") {

                setTimeout(ready, 1);

            } else if (!readyEventHandlersInstalled) {

                // otherwise if we don't have event handlers installed, install them

                document.addEventListener("DOMContentLoaded", ready, false);
                // backup is window load event
                window.addEventListener("load", ready, false);

                readyEventHandlersInstalled = true;
            }
        }
    });

    // Data

    var storage = {};

    /**
     * Store data on an element
     *
     * @param{Object} elem
     * @param{String} key
     * @param{String} value
     * @return {Object}
     */

    function set(elem, key, value) {

        if (!hAzzle.nodeType(1, elem) || hAzzle.nodeType(9, elem) || !(+elem.nodeType)) {
            return 0;
        }

        // Get or create and unique ID
        var id = hAzzle.getUID(elem),
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

    function get(elem, key) {

        var obj = storage[hAzzle.getUID(elem)];

        if (!obj) {

            return;
        }

        // If no key, return all data stored on the object

        if (arguments.length === 1) {

            return obj;

        } else {

            return obj[key];
        }

    }

    /**
     * Check if an element contains any data
     *
     * @param{Object} elem
     * @param{String} key
     * @return {Object}
     */

    function has(elem, key) {
        var obj = storage[hAzzle.getUID(elem)];
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


    function remove(elem, key) {
        var id = hAzzle.getUID(elem);

        // If no key, remove all data

        if (key === undefined && hAzzle.nodeType(1, elem)) {
            storage[id] = {};

        } else {

            if (storage[id]) {
                delete storage[id].key;
            } else {
                storage[id] = null;

            }
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
            if (elem[0].nodeType) {
                if (storage[hAzzle.getUID(elem[0])]) return true;

                else {

                    return false;

                }

            }
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
                if (remove(elem[0], key)) return true;
            } else if (remove(hAzzle(elem)[0], key)) return true;
            return false;
        },

        data: function (elem, key, value) {
            len = arguments.length;
            keyType = typeof key;
            len === 1 ? set(elem[0], key, value) : len === 2 && get(elem[0], key);
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
            return this.each(function () {
                remove(this, key);
            });
        },

        /**
         * Store random data on the hAzzle Object
         *
         * @param {String} key(s)
         * @param {String|Object} value
         *
         * @return {Object|String}
         *
         */

        data: function (key, value) {

            var len = arguments.length,
                keyType = typeof key;

            if (len === 1) {

                if (this.elems.length === 1) {

                    return get(this.elems[0], key);
                } else {

                    return this.elems.map(function (value) {
                        return get(value, key);
                    });
                }

            } else if (len === 2) {

                return this.each(function () {
                    set(this, key, value);
                })
            } else {
                return get(this[0]);
            }
        }

    });

    // Class manipulation

    // Check if we can support classList
    var csp = !! document.createElement('p').classList,
        whitespace = (/\S+/g),
        rclass = /[\t\r\n\f]/g;

    hAzzle.fn.extend({

        /**
         * Add class(es) to element collection
         *
         * @param {String} value
         */

        addClass: function (value) {
            if (hAzzle.isFunction(value)) {
                return this.each(function (j) {
                    hAzzle(this).addClass(value.call(this, j, this.className));
                });
            }

            var cur,
                j,
                clazz,
                finalValue,
                classes = (value || "").match(whitespace) || [];

            return this.each(function (_, elem) {

                // classList

                if (csp && hAzzle.nodeType(1, elem)) {
                    return hAzzle.each(classes, function (_, cls) {
                        return elem.classList.add(cls);
                    });
                }

                // The old way


                cur = hAzzle.nodeType(1, elem) && (elem.className ?

                    (" " + elem.className + " ").replace(rclass, " ") : " ");

                if (cur) {
                    j = 0;
                    while ((clazz = classes[j++])) {
                        if (cur.indexOf(" " + clazz + " ") < 0) {
                            cur += clazz + " ";
                        }
                    }

                    // only assign if different to avoid unneeded rendering.
                    finalValue = hAzzle.trim(cur);
                    if (elem.className !== finalValue) {
                        elem.className = finalValue;
                    }
                }
            });
        },

        /**
         * Remove class(es) from element
         *
         * @param {String} value
         */

        removeClass: function (value) {

            var classes, cur, clazz, j, finalValue;

            if (hAzzle.isFunction(value)) {
                return this.each(function (j) {
                    hAzzle(this).removeClass(value.call(this, j, this.className));
                });
            }

            classes = (value || "").match(whitespace) || [];

            return this.each(function (_, elem) {

                if (!value) {

                    return elem.className = "";
                }

                // ClassList

                if (csp && hAzzle.nodeType(1, elem)) {
                    return hAzzle.each(classes, function (_, classes) {
                        elem.classList.remove(classes);
                    });
                }

                // Old way of doing things

                cur = hAzzle.nodeType(1, elem) && (elem.className ?
                    (" " + elem.className + " ").replace(rclass, " ") :
                    ""
                );

                if (cur) {
                    j = 0;
                    while ((clazz = classes[j++])) {
                        // Remove *all* instances
                        while (cur.indexOf(" " + clazz + " ") >= 0) {
                            cur = cur.replace(" " + clazz + " ", " ");
                        }
                    }

                    // Only assign if different to avoid unneeded rendering.

                    finalValue = value ? hAzzle.trim(cur) : "";
                    if (elem.className !== finalValue) {
                        elem.className = finalValue;
                    }
                }
            });
        },

        /**
         * Checks if an element has the given class
         *
         * @param {String} selector(s)
         * @return {Boolean} true if the element contains all classes
         */

        hasClass: function (selector) {

            for (var className = " " + selector + " ", i = 0, d = this.length; i < d; i++) {

                // Use classList if browser supports it

                if (csp && hAzzle.nodeType(1, this[i])) return this[i].classList.contains(selector);

                // Fallback to the "old way" if classList not supported

                if (hAzzle.nodeType(1, this[i]) && 0 <= (" " + this[i].className + " ").replace(rclass, " ").indexOf(className)) return true;

            }
            return false;
        },


        /**
         * Replace a class in a element collection
         *
         * @param {String} clA
         * @param {String} clB
         */

        replaceClass: function (clA, clB) {
            var current, found;
            return this.each(function () {
                current = this.className.split(' '),
                found = false;

                for (var i = current.length; i--;) {
                    if (current[i] == clA) {
                        found = true;
                        current[i] = clB;
                    }
                }
                if (!found) {
                    return hAzzle(this).addClass(clB, this);
                }
                this.className = current.join(' ');
            });
        },

        /**
         * Add class(es) to element, and remove after 'duration' milliseconds
         * @param {String} clas
         * @param {Number} duration
         */

        tempClass: function (clas, duration) {
            return this.each(function (_, elem) {
                hAzzle(elem).addClass(clas);
                setTimeout((function () {
                    hAzzle(elem).removeClass(clas);
                }), duration || /* default 100ms */ 100);
            });
        },

        /**
         * Retrive all classes that belong to one element
         */

        allClass: function () {
            if (csp) return this[0].classList;
            else return this;
        },

        /**
         * Toggle class(es) on element
         *
         * @param {String} value
         * @param {Boolean} state
         * @return {Boolean}
         */

        toggleClass: function (value, state) {

            var type = typeof value;

            if (typeof state === "boolean" && type === "string") {
                return state ? this.addClass(value) : this.removeClass(value);
            }

            if (hAzzle.isFunction(value)) {
                return this.each(function (i) {
                    hAzzle(this).toggleClass(value.call(this, i, this.className, state), state);
                });
            }

            return this.each(function (_, elem) {

                // ClassList
                if (csp) {

                    return this.classList.toggle(value);
                }
                // The "old way"	

                if (typeof value === "string") {
                    // toggle individual class names
                    var className,
                        i = 0,
                        self = hAzzle(this),
                        classNames = value.match(whitespace) || [];

                    while ((className = classNames[i++])) {
                        // check each className given, space separated list
                        if (self.hasClass(className)) {
                            self.removeClass(className);
                        } else {
                            self.addClass(className);
                        }
                    }

                    // Toggle whole class name
                } else if (type === typeof undefined || type === "boolean") {
                    if (this.className) {
                        // store className if set
                        hAzzle.data(this, "__className__", this.className);
                    }

                    this.className = this.className || value === false ? "" : hAzzle.data(this, "__className__") || "";
                }
            });
        }
    });

    // Clone


    // Support check 
    (function () {

        var fragment = document.createDocumentFragment(),
            div = fragment.appendChild(document.createElement("div")),
            input = document.createElement("input");

        div.appendChild(input);

        support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;

        div.innerHTML = "<textarea>x</textarea>";

        support.noCloneChecked = !! div.cloneNode(true).lastChild.defaultValue;

    }());

    var rcheckableType = (/^(?:checkbox|radio)$/i);

    /**
     *  TODO!!!
     *
     * - Clone data
     * - deal with the script tags
     */


    function fixInput(src, dest) {
        var nodeName = dest.nodeName.toLowerCase();
        if ("input" === nodeName && rcheckableType.test(src.type)) dest.checked = src.checked;
        else if ("input" === nodeName || "textarea" === nodeName) dest.defaultValue = src.defaultValue;
    };

    hAzzle.fn.extend({

        clone: function () {

            var clone,
                storage,
                srcElements, destElements;

            return this.map(function (elem) {

                /* Get all handlers from the original elem before we do a clone job
	
	   NOTE!! This has to be done BEFORE we clone the elem, else
	          hAzzle will be confused and wonder wich of the two
			  'identical' elems to get the handlers and data from
	*/

                var handlers = hAzzle.Events.getHandler(elem, '', null, false),
                    l = handlers.length,
                    i = 0,
                    args, hDlr;

                // Get the data before we clone

                storage = hAzzle(elem).data();

                // Clone the elem

                clone = elem.cloneNode(true);

                // Copy the events from the original to the clone

                for (; i < l; i++) {
                    if (handlers[i].original) {

                        args = [clone, handlers[i].type];
                        if (hDlr = handlers[i].handler.__handler) args.push(hDlr.selector);
                        args.push(handlers[i].original);
                        hAzzle.Events.add.apply(null, args);
                    }
                }

                // Copy data from the original to the clone

                hAzzle.each(storage, function (key, value) {
                    hAzzle.data(clone, key, value);
                });

                // Preserve the rest 

                if (!hAzzle.support.noCloneChecked && (hAzzle.nodeType(1, elem) || hAzzle.nodeType(11, elem)) && !hAzzle.isXML(elem)) {

                    destElements = hAzzle.getChildren(clone);
                    srcElements = hAzzle.getChildren(elem);

                    for (i = 0, l = srcElements.length; i < l; i++) {
                        fixInput(srcElements[i], destElements[i]);
                    }
                }

                // Preserve script evaluation history

                destElements = hAzzle.getChildren(clone, "script");

                if (destElements.length > 0) {

                    hAzzle.Evaluated(destElements, !hAzzle.contains(elem.ownerDocument, elem) && hAzzle.getChildren(elem, "script"));

                }
                // Return the cloned set
                return clone;
            });
        }
    });




    // Event handler

    var win = window,
        namespaceRegex = /[^\.]*(?=\..*)\.|.*/,
        nameRegex = /\..*/,
        addEvent = 'addEventListener',
        removeEvent = 'removeEventListener',
        own = 'hasOwnProperty',
        call = 'call',
        doc = document || {},
        root = doc.documentElement || {},

        container = {},

        rkeyEvent = /^key/,
        rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,

        treated = {},

        /**
         * Prototype references.
         */

        ArrayProto = Array.prototype,
        ObjProto = Object.prototype,

        /**
         * Create reference for speeding up the access to the prototype.
         */

        slice = ArrayProto.slice,
        concat = ArrayProto.concat,
        toString = ObjProto.toString,

        threatment = {

            // Don't do events on disabeled nodes

            disabeled: function (el, type) {
                if (el.disabeled && type === "click") return true;
            },

            // Don't do events on text and comment nodes 

            nodeType: function (el) {
                if (hAzzle.nodeType(3, el) || hAzzle.nodeType(8, el)) return true;
            }
        },

        special = {
            pointerenter: {
                fix: "pointerover",
                condition: checkPointer
            },

            pointerleave: {
                fix: "pointerout",
                condition: checkPointer
            },
            mouseenter: {
                fix: 'mouseover',
                condition: checkMouse
            },
            mouseleave: {
                fix: 'mouseout',
                condition: checkMouse
            },
            mousewheel: {
                fix: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel'
            }
        },

        // Includes some event props shared by different events

        commonProps = "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" ");

    // Check mouse

    function checkMouse(evt) {
        if (evt = evt.relatedTarget) {
            var ac;
            if (ac = evt !== this)
                if (ac = "xul" !== evt.prefix)
                    if (ac = !/document/.test(this.toString())) {
                        a: {
                            for (; evt = evt.parentNode;)
                                if (evt === this) {
                                    evt = 1;
                                    break a;
                                }
                            evt = 0;
                        }
                        ac = !evt;
                    }
            evt = ac;
        } else evt = null === evt;
        return evt;
    }

    /**
  * FIX ME!!  I don't have a pointer device so can't fix this. Maybe in the future.
              But need to run a check about this condition here.
  */

    function checkPointer(evt) {
        return evt;
    }


    function Event(evt, element) {

        // Allow instantiation without the 'new' keyword
        if (!(this instanceof Event)) {
            return new Event(evt, element);
        }

        if (!arguments.length) return;

        evt = evt || ((element.ownerDocument || element.document || element).parentWindow || win).evt;

        this.originalEvent = evt;

        if (!evt) return;

        var type = evt.type,
            target = evt.target,
            i, l, p, props, fixHook;

        this.target = target && hAzzle.nodeType(3, target) ? target.parentNode : target;

        fixHook = treated[type];

        if (!fixHook) {

            // More or less the same way as jQuery does it, but
            // I introduced "eventHooks", so it's possible to check
            // against other events too from plugins.
            //
            // NOTE!! I used the same "props" as in jQuery. I hope that was the right thing to do :)

            treated[type] = fixHook = rmouseEvent.test(type) ? hAzzle.eventHooks['mouse'] :
                rkeyEvent.test(type) ? hAzzle.eventHooks['keys'] :
                function () {
                    return commonProps;
            };
        }

        props = fixHook(evt, this, type);

        for (i = props.length; i--;) {
            if (!((p = props[i]) in this) && p in evt) this[p] = evt[p];
        }
    }

    Event.prototype = {

        preventDefault: function () {
            if (this.originalEvent.preventDefault) this.originalEvent.preventDefault();
            else this.originalEvent.returnValue = false;
        },
        stopPropagation: function () {
            if (this.originalEvent.stopPropagation) this.originalEvent.stopPropagation();
            else this.originalEvent.cancelBubble = true;
        },
        stop: function () {
            this.preventDefault();
            this.stopPropagation();
            this.stopped = true;
        },
        stopImmediatePropagation: function () {
            if (this.originalEvent.stopImmediatePropagation) this.originalEvent.stopImmediatePropagation();
            this.isImmediatePropagationStopped = function () {

                return true;
            };
        },
        isImmediatePropagationStopped: function () {
            return this.originalEvent.isImmediatePropagationStopped && this.originalEvent.isImmediatePropagationStopped();
        },
        clone: function (currentTarget) {
            var ne = Event(this, this.element);
            ne.currentTarget = currentTarget;
            return ne;
        }
    };
    // Same as jQuery / Zepto

    hAzzle.Events = {

        // Add event listener

        add: function (el, events, selector, fn, one) {
            var originalFn, type, types, i, args, entry, first;

            // Dont' allow click on disabeled elements, or events on text and comment nodes

            if (threatment['disabeled'](el, events) || threatment['nodeType'](el)) return false;

            if (selector === undefined && typeof events === 'object')

                for (type in events) {
                    if (events.hasOwnProperty(type)) {
                        hAzzle.Events.add.call(this, el, type, events[type]);
                    }
                } else {

                    // Delegated event

                    if (!hAzzle.isFunction(selector)) {
                        originalFn = fn;
                        args = slice.call(arguments, 4);
                        fn = hAzzle.Events.delegate(selector, originalFn);
                    } else {
                        args = slice.call(arguments, 3);
                        fn = originalFn = selector;
                    }

                    types = events.split(' ');

                    // One

                    if (one === 1) fn = hAzzle.Events.once(hAzzle.Events.remove, el, events, fn, originalFn);

                    for (i = types.length; i--;) {
                        first = hAzzle.Events.putHandler(entry = hAzzle.Kernel(
                            el, types[i].replace(nameRegex, '') // event type
                            , fn, originalFn, types[i].replace(namespaceRegex, '').split('.') // namespaces
                            , args, false
                        ));

                        // First event of this type on this el, add root listener

                        if (first) el[addEvent](entry.eventType, hAzzle.Events.rootListener, false);
                    }
                    return el;
                }

        },

        // Remove event listener

        remove: function (el, typeSpec, fn) {
            var isTypeStr = hAzzle.isString(typeSpec),
                type, namespaces, i;

            if (isTypeStr && typeSpec.indexOf(' ') > 0) {

                // off(el, 't1 t2 t3', fn) or off(el, 't1 t2 t3')

                typeSpec = typeSpec.split(typeSpec);

                for (i = typeSpec.length; i--;)
                    hAzzle.Events.remove(el, typeSpec[i], fn);
                return el;
            }

            type = isTypeStr && typeSpec.replace(nameRegex, '');

            if (type && special[type]) type = special[type].fix;

            if (!typeSpec || isTypeStr) {
                // off(el) or off(el, t1.ns) or off(el, .ns) or off(el, .ns1.ns2.ns3)
                if (namespaces = isTypeStr && typeSpec.replace(namespaceRegex, '')) namespaces = namespaces.split('.');
                hAzzle.Events.removeListener(el, type, fn, namespaces);
            } else if (hAzzle.isFunction(typeSpec)) {
                // off(el, fn);
                hAzzle.Events.removeListener(el, null, typeSpec);
            } else {

                for (var k in typeSpec) {
                    if (typeSpec.hasOwnProperty(k)) hAzzle.Events.remove(el, k, typeSpec[k]);
                }
            }

            return el;
        },

        /**
         * Set up a delegate helper using the given selector, wrap the handler function
         */

        delegate: function (selector, fn) {

            function findTarget(target, root) {
                var i, array = hAzzle.isString(selector) ? hAzzle.select(selector, root) : selector;
                for (; target && target !== root; target = target.parentNode) {
                    if (array !== null) {
                        for (i = array.length; i--;) {
                            if (array[i] === target) return target;
                        }
                    }
                }
            }

            function handler(e) {
                if (e.target.disabled !== true) {
                    var match = findTarget(e.target, this);
                    if (match) fn.apply(match, arguments);
                }
            }

            handler.__handlers = {
                ft: findTarget // attach it here for special to use too
                ,
                selector: selector
            };
            return handler;
        },

        removeListener: function (element, orgType, handler, namespaces) {

            var type = orgType && orgType.replace(nameRegex, ''),
                handlers = hAzzle.Events.getHandler(element, type, null, false),
                removed = {}, i, l;

            // Namespace

            for (i = 0, l = handlers.length; i < l; i++) {
                if ((!handler || handlers[i].original === handler) && handlers[i].inNamespaces(namespaces)) {
                    hAzzle.Events.delHandler(handlers[i]);
                    if (!removed[handlers[i].eventType])
                        removed[handlers[i].eventType] = {
                            t: handlers[i].eventType,
                            c: handlers[i].type
                        };
                }
            }

            for (i in removed) {
                if (!hAzzle.Events.hasHandler(element, removed[i].t, null, false)) {
                    // last listener of this type, remove the rootListener
                    element[removeEvent](removed[i].t, hAzzle.Events.rootListener, false);
                }
            }
        },

        once: function (rm, element, type, fn, originalFn) {
            return function () {
                fn.apply(this, arguments);
                rm(element, type, originalFn);
            };
        },

        rootListener: function (evt, type) {
            var listeners = hAzzle.Events.getHandler(this, type || evt.type, null, false),
                l = listeners.length,
                i = 0;

            evt = Event(evt, this, true);
            if (type) evt.type = type;

            // iterate through all handlers registered for this type, calling them unless they have
            // been removed by a previous handler or stopImmediatePropagation() has been called
            for (; i < l && !evt.isImmediatePropagationStopped(); i++) {
                if (!listeners[i].removed) listeners[i].handler.call(this, evt);
            }
        },

        wrappedHandler: function (element, fn, condition, args) {

            function call(evt, eargs) {

                return fn.apply(element, args ? slice.call(eargs).concat(args) : eargs);
            }

            function findTarget(evt, eventElement) {

                return fn.__handlers ? fn.__handlers.ft(evt.target, element) : eventElement;
            }

            var handler = condition ? function (evt) {

                    var target = findTarget(evt, this); // delegated event

                    if (condition.apply(target, arguments)) {
                        if (evt) evt.currentTarget = target;
                        return call(evt, arguments);
                    }
                } : function (evt) {
                    if (fn.__handlers) evt = evt.clone(findTarget(evt));
                    return call(evt, arguments);
                };

            handler.__handlers = fn.__handlers;
            return handler;
        },

        findIt: function (element, type, original, handler, root, fn) {

            if (!type || type === '*') {

                for (var t in container) {

                    if (t.charAt(0) === root ? 'r' : '#') {

                        hAzzle.Events.findIt(element, t.substr(1), original, handler, root, fn);
                    }
                }

            } else {

                var i = 0,
                    l, list = container[root ? 'r' : '#' + type],
                    all = element === '*';
                if (!list) return;
                for (l = list.length; i < l; i++) {
                    if ((all || list[i].matches(element, original, handler)) && !fn(list[i], list, i, type)) return;
                }
            }
        },

        hasHandler: function (element, type, original, root) {
            if (root = container[(root ? "r" : "#") + type])
                for (type = root.length; type--;)
                    if (!root[type].root && root[type].matches(element, original, null)) return true;
            return false;
        },
        getHandler: function (element, type, original, root) {
            var entries = [];
            hAzzle.Events.findIt(element, type, original, null, root, function (entry) {
                entries.push(entry);
            });
            return entries;
        },
        putHandler: function (entry) {
            var has = !entry.root && !this.hasHandler(entry.element, entry.type, null, false),
                key = (entry.root ? 'r' : '#') + entry.type;
            (container[key] || (container[key] = [])).push(entry);
            return has;
        },
        // Find handlers for event delegation
        delHandler: function (entry) {
            hAzzle.Events.findIt(entry.element, entry.type, null, entry.handler, entry.root, function (entry, list, i) {
                list.splice(i, 1);
                entry.removed = true;
                if (list.length === 0) delete container[(entry.root ? 'r' : '#') + entry.type];
                return false;
            });
        }
    };

    hAzzle.extend({

        eventHooks: {

            keys: function (evt, original) {
                original.keyCode = evt.keyCode || evt.which;
                return commonProps.concat(["char", "charCode", "key", "keyCode"]);

            },
            mouse: function (evt, original) {

                original.rightClick = evt.which === 3 || evt.button === 2;

                original.pos = {
                    x: 0,
                    y: 0
                };

                // Calculate pageX/Y if missing and clientX/Y available

                if (evt.pageX || evt.pageY) {
                    original.clientX = evt.pageX;
                    original.clientY = evt.pageY;
                } else if (evt.clientX || evt.clientY) {
                    original.clientX = evt.clientX + doc.body.scrollLeft + root.scrollLeft;
                    original.clientY = evt.clientY + doc.body.scrollTop + root.scrollTop;
                }

                return commonProps.concat("button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "));
            }
        },

        Kernel: function (element, type, handler, original, namespaces, args) {

            // Allow instantiation without the 'new' keyword

            if (!(this instanceof hAzzle.Kernel)) {
                return new hAzzle.Kernel(element, type, handler, original, namespaces, args);
            }

            var _special = special[type];

            // Only load the event once upon unload

            if (type === 'unload') handler = hAzzle.Events.once(hAzzle.Events.removeListener, element, type, handler, original);

            if (_special) {
                if (_special.condition) {
                    handler = hAzzle.Events.wrappedHandler(element, handler, _special.condition, args);
                }

                type = _special.fix || type;
            }

            this.element = element;
            this.type = type;
            this.original = original;
            this.namespaces = namespaces;
            this.eventType = type;
            this.target = element;
            this.handler = hAzzle.Events.wrappedHandler(element, handler, null, args);
        }
    });


    hAzzle.Kernel.prototype['inNamespaces'] = function (checkNamespaces) {

        var i, j, c = 0;
        if (!checkNamespaces) return true;
        if (!this.namespaces) return false;
        for (i = checkNamespaces.length; i--;) {
            for (j = this.namespaces.length; j--;) {
                if (checkNamespaces[i] == this.namespaces[j]) c++;
            }
        }
        return checkNamespaces.length === c;
    };

    hAzzle.Kernel.prototype['matches'] = function (checkElement, checkOriginal, checkHandler) {
        return this.element === checkElement &&
            (!checkOriginal || this.original === checkOriginal) &&
            (!checkHandler || this.handler === checkHandler);
    };


    hAzzle.fn.extend({

        /**
         * Bind a DOM event to element
         *
         * @param {String} events
         * @param {String} selector
         * @param {Function} fn
         * @param {Boolean} one
         * @return {Object}
         */

        on: function (events, selector, fn, one) {
            return this.each(function () {
                hAzzle.Events.add(this, events, selector, fn, one);
            });
        },

        /**
         * Bind a DOM event but trigger it once before removing it
         *
         * @param {String} events
         * @param {String} selector
         * @param {Function} fn
         * @return {Object}
         **/

        one: function (types, selector, fn) {
            return this.on(types, selector, fn, 1);
        },

        /**
         * Unbind an event from the element
         *
         * @param {String} events
         * @param {Function} fn
         * @return {Object}
         */

        off: function (events, fn) {
            return this.each(function () {
                hAzzle.Events.remove(this, events, fn);
            });
        },

        /**
         * Triggers an event of specific type with optional extra arguments
         *
         * @param {Object|String} type
         * @param {Object|String} args
         * @return {Object}
         */

        trigger: function (type, args) {

            var el = this[0];

            var types = type.split(' '),
                i, j, l, call, evt, names, handlers;

            if (threatment['disabeled'](el, type) || threatment['nodeType'](el)) return false;

            for (i = types.length; i--;) {
                type = types[i].replace(nameRegex, '');
                if (names = types[i].replace(namespaceRegex, '')) names = names.split('.');
                if (!names && !args) {
                    var HTMLEvt = doc.createEvent('HTMLEvents');
                    HTMLEvt['initEvent'](type, true, true, win, 1);
                    el.dispatchEvent(HTMLEvt);

                } else {
                    handlers = hAzzle.Events.getHandler(el, type, null, false);
                    evt = Event(null, el);
                    evt.type = type;
                    call = args ? 'apply' : 'call';
                    args = args ? [evt].concat(args) : evt;
                    for (j = 0, l = handlers.length; j < l; j++) {
                        if (handlers[j].inNamespaces(names)) {
                            handlers[j].handler[call](el, args);
                        }
                    }
                }
            }
            return el;
        }
    });

    // Shortcut methods for 'on'

    hAzzle.each(("blur focus focusin focusout load resize scroll unload click dblclick " +
        "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
        "change select submit keydown keypress keyup error contextmenu").split(" "), function (_, name) {

        // Handle event binding

        hAzzle.fn[name] = function (data, fn) {
            //events, fn, delfn, one
            return arguments.length > 0 ?
                this.on(name, data, fn) :
                this.trigger(name);
        };
    });




    // CSS


    var
    docElem = window.document.documentElement,
        rootNodeRE = /^(?:body|html)$/i,
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

        offset: {
            setOffset: function (elem, coordinates, i) {
                var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
                    position = hAzzle.css(elem, "position"),
                    curElem = hAzzle(elem),
                    props = {};

                // Set position first, in-case top/left are set even on static elem
                if (position === "static") {
                    elem.style.position = "relative";
                }

                curOffset = curElem.offset();
                curCSSTop = hAzzle.css(elem, "top");
                curCSSLeft = hAzzle.css(elem, "left");
                calculatePosition = (position === "absolute" || position === "fixed") &&
                    (curCSSTop + curCSSLeft).indexOf("auto") > -1;

                // Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
                if (calculatePosition) {
                    curPosition = curElem.position();
                    curTop = curPosition.top;
                    curLeft = curPosition.left;

                } else {
                    curTop = parseFloat(curCSSTop) || 0;
                    curLeft = parseFloat(curCSSLeft) || 0;
                }

                if (hAzzle.isFunction(coordinates)) {
                    coordinates = coordinates.call(elem, i, curOffset);
                }

                if (coordinates.top != null) {
                    props.top = (coordinates.top - curOffset.top) + curTop;
                }
                if (coordinates.left != null) {
                    props.left = (coordinates.left - curOffset.left) + curLeft;
                }

                if ("using" in coordinates) {
                    coordinates.using.call(elem, props);

                } else {
                    curElem.css(props);
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

        offset: function (coordinates) {
            if (arguments.length) {
                return coordinates === undefined ?
                    this :
                    this.each(function (i) {
                        hAzzle.offset.setOffset(this, coordinates, i);
                    });
            }

            var docElem, win,
                elem = this[0],
                box = {
                    top: 0,
                    left: 0
                },
                doc = elem && elem.ownerDocument;

            if (!doc) {
                return;
            }

            docElem = doc.documentElement;

            // Make sure it's not a disconnected DOM node
            if (!hAzzle.contains(docElem, elem)) {
                return box;
            }
            if (typeof elem.getBoundingClientRect !== typeof undefined) {
                box = elem.getBoundingClientRect();
            }
            win = getWindow(doc);
            return {
                top: box.top + win.pageYOffset - docElem.clientTop,
                left: box.left + win.pageXOffset - docElem.clientLeft
            };
        },

        position: function () {

            if (this.length) {

                var offsetParent, offset,
                    elem = this[0],
                    parentOffset = {
                        top: 0,
                        left: 0
                    };

                if (hAzzle.css(elem, "position") === "fixed") {

                    offset = elem.getBoundingClientRect();

                } else {

                    // Get *real* offsetParent

                    offsetParent = this.offsetParent();

                    // Get correct offsets
                    offset = this.offset();

                    if (!hAzzle.nodeName(offsetParent[0], "html")) {
                        parentOffset = offsetParent.offset();
                    }

                    // Subtract element margins

                    parentOffset.top += hAzzle.css(offsetParent[0], "borderTopWidth", true);
                    parentOffset.left += hAzzle.css(offsetParent[0], "borderLeftWidth", true);
                }

                // Subtract parent offsets and element margins
                return {
                    top: offset.top - parentOffset.top - hAzzle.css(elem, "marginTop", true),
                    left: offset.left - parentOffset.left - hAzzle.css(elem, "marginLeft", true)
                };
            }
        },

        /**  
         * Get the closest ancestor element that is positioned.
         */

        offsetParent: function () {
            return this.map(function () {
                var offsetParent = this.offsetParent || docElem;
                while (offsetParent && (!hAzzle.nodeName(offsetParent, "html") && hAzzle.css(offsetParent, "position") === "static")) {
                    offsetParent = offsetParent.offsetParent;
                }
                return offsetParent || docElem;
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
        },

        tagExpander = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
        rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/),
        rtagName = /<([\w:]+)/,
        rhtml = /<|&#?\w+;/,
        rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
        rscriptType = /^$|\/(?:java|ecma)script/i,
        rscriptTypeMasked = /^true\/(.*)/,
        rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;


    function getBooleanAttrName(element, name) {
        // check dom last since we will most likely fail on name
        var booleanAttr = boolean_attr[name.toLowerCase()];
        // booleanAttr is here twice to minimize DOM access
        return booleanAttr && boolean_elements[element.nodeName] && booleanAttr;
    }

    /**
     * Check if the elem matches the current nodeType
     */

    function NodeMatching(elem) {
        return hAzzle.nodeType(1, elem) || hAzzle.nodeType(9, elem) || hAzzle.nodeType(11, elem) ? true : false;
    }

    /**
     * Disable "script" tags
     **/


    function disableScript(elem) {
        elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
        return elem;
    }

    /**
     * Restore "script" tags
     **/


    function restoreScript(elem) {
        var m = rscriptTypeMasked.exec(elem.type);
        m ? elem.type = m[1] : elem.removeAttribute("type");
        return elem;
    }



    // Global

    hAzzle.extend({
        /**
         * HTML Hook created for the future. If hAzzle need to support HTML 6 or other
         * HTML tags, it's easy enough to do it from plugins
         */

        htmlHooks: {

            regex: /<([\w:]+)/,

            'option': function () {

                return [1, "<select multiple='multiple'>", "</select>"];
            },

            'thead': function () {

                return [1, "<table>", "</table>"];

            },

            'col': function () {

                return [2, "<table><colgroup>", "</colgroup></table>"];

            },
            'tr': function () {

                return [2, "<table><tbody>", "</tbody></table>"];

            },
            'td': function () {

                return [3, "<table><tbody><tr>", "</tr></tbody></table>"];

            }
        },

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
        },

        Evaluated: function (elems, refElements) {
            var i = 0,
                l = elems.length;

            for (; i < l; i++) {
                hAzzle.data(elems[i], "evaluated", !refElements || hAzzle.data(refElements[i], "evaluated"));
            }
        },

        parseHTML: function (data, context, keepScripts) {

            if (!data || typeof data !== "string") {
                return null;
            }

            if (typeof context === "boolean") {
                keepScripts = context;
                context = false;
            }
            context = context || document;

            var parsed = rsingleTag.exec(data),
                scripts = !keepScripts && [];

            // Single tag

            if (parsed) {
                return [context.createElement(parsed[1])];
            }

            parsed = hAzzle.createHTML([data], context, scripts);

            if (scripts && scripts.length) {
                hAzzle(scripts).remove();
            }

            return hAzzle.merge([], parsed.childNodes);
        },

        /*
	  Create the HTML
	  *
	  * Support for HTML 6 through the 'htmlHooks'
	   *
	*/

        createHTML: function (elems, context, scripts, selection) {

            var elem, tmp, tag, wrap, contains, j,
                fragment = context.createDocumentFragment(),
                nodes = [],
                i = 0,
                l = elems.length;

            hAzzle.each(elems, function (_, elem) {

                if (elem || elem === 0) {

                    // Add nodes directly

                    if (typeof elem === "object") {

                        hAzzle.merge(nodes, elem.nodeType ? [elem] : elem);

                    } else if (!rhtml.test(elem)) {

                        nodes.push(context.createTextNode(elem));

                    } else { // Suport for HTML 6

                        tmp = tmp || fragment.appendChild(context.createElement("div"));

                        // RegEx used here is to recognize HTML5 tags, but can be extended through the 'hook'

                        tag = (hAzzle.htmlHooks['regex'].exec(elem) || ["", ""])[1].toLowerCase();

                        wrap = hAzzle.htmlHooks[tag] || [0, "", ""];

                        tmp.innerHTML = wrap[1] + elem.replace(tagExpander, "<$1></$2>") + wrap[2];

                        // Descend through wrappers to the right content
                        j = wrap[0];

                        while (j--) {
                            tmp = tmp.lastChild;
                        }

                        hAzzle.merge(nodes, tmp.childNodes);

                        tmp = fragment.firstChild;

                        tmp.textContent = "";
                    }
                }
            });

            // Remove wrapper from fragment
            fragment.textContent = "";

            i = 0;
            while ((elem = nodes[i++])) {

                if (selection && hAzzle.indexOf.call(selection, elem) === -1) continue;

                contains = hAzzle.contains(elem.ownerDocument, elem);

                // Append to fragment

                tmp = hAzzle.getChildren(fragment.appendChild(elem), "script");

                if (contains) {

                    hAzzle.Evaluated(tmp);
                }

                // Capture executables
                if (scripts) {
                    j = 0;
                    while ((elem = tmp[j++])) {
                        if (rscriptType.test(elem.type || "")) {
                            scripts.push(elem);
                        }
                    }
                }
            }

            return fragment;
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

        /*
         * Remove properties from DOM elements
         *
         * @param {String}
         *
         * @return {Object}
         */

        removeProp: function (name) {

            return this.each(function () {
                delete this[propMap[name] || name];
            });
        },

        /**
         * Replace each element in the set of matched elements with the provided new content
         *
         * @param {String} html
         * @return {Object}
         */

        replaceWith: function (html) {
            return this.before(html).remove();
        },

        /**
         * Append the current element to another
         *
         * @param {Object|String} sel
         * @return {Object}
         */

        appendTo: function (sel) {
            return this.each(function () {
                hAzzle(sel).append(this);
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
                hAzzle(sel).prepend(this);
            });
        },


        manipulateDOM: function (args, callback) {

            // Flatten any nested arrays
            args = concat.apply([], args);

            var fragment, first, scripts, hasScripts, node, doc,
                i = 0,
                l = this.length,
                set = this,
                iNoClone = l - 1,
                value = args[0],
                isFunction = hAzzle.isFunction(value);

            // We can't cloneNode fragments that contain checked, in WebKit
            if (isFunction ||
                (l > 1 && typeof value === "string" && !support.checkClone && rchecked.test(value))) {
                return this.each(function (index) {
                    var self = set.eq(index);
                    if (isFunction) {
                        args[0] = value.call(this, index, self.html());
                    }
                    self.manipulateDOM(args, callback);
                });
            }

            if (l) {
                fragment = hAzzle.createHTML(args, this[0].ownerDocument, false, this);
                first = fragment.firstChild;

                if (fragment.childNodes.length === 1) {
                    fragment = first;
                }

                if (first) {
                    scripts = hAzzle.map(hAzzle.getChildren(fragment, "script"), disableScript);
                    hasScripts = scripts.length;

                    // Use the original fragment for the last item instead of the first because it can end up
                    // being emptied incorrectly in certain situations (#8070).
                    for (; i < l; i++) {
                        node = fragment;

                        if (i !== iNoClone) {
                            node = hAzzle.clone(node, true, true);

                            // Keep references to cloned scripts for later restoration
                            if (hasScripts) {
                                // Support: QtWebKit
                                // hAzzle.merge because push.apply(_, arraylike) throws
                                hAzzle.merge(scripts, hAzzle.getChildren(node, "script"));
                            }
                        }

                        callback.call(this[i], node, i);
                    }

                    if (hasScripts) {
                        doc = scripts[scripts.length - 1].ownerDocument;

                        // Reenable scripts
                        hAzzle.map(scripts, restoreScript);

                        // Evaluate executable scripts on first document insertion
                        for (i = 0; i < hasScripts; i++) {

                            node = scripts[i];
                            if (rscriptType.test(node.type || "") && !hAzzle.data(node, "evaluated") && hAzzle.contains(doc, node)) {

                                if (node.src) {
                                    // Optional AJAX dependency, but won't run scripts if not present
                                    if (hAzzle._evalUrl) {
                                        hAzzle._evalUrl(node.src);
                                    }
                                } else {
                                    hAzzle.Evaluated(node.textContent.replace(rcleanScript, ""));
                                }
                            }
                        }
                    }
                }
            }

            return this;
        },

        /**
         * Wrap html string with a `div` or wrap special tags with their containers.
         *
         * @param {String} html
         * @return {Object}
         */

        wrap: function (html) {

            var isFunction = hAzzle.isFunction(html);

            return this.each(function (i) {
                hAzzle(this).wrapAll(hAzzle.isFunction(html) ? html.call(this, i) : html);
            });
        },

        /**
         *  Wrap an HTML structure around the content of each element in the set of matched elements.
         *
         * @param {String} html
         * @return {Object}
         *
         */

        wrapAll: function (html) {

            if (this[0]) {

                hAzzle(this[0]).before(html = hAzzle(html, this[0].ownerDocument).eq(0)); //.clone(true));

                var children;
                // drill down to the inmost element
                while ((children = html.children()).length) html = children.first();

                hAzzle(html).append(this);
            }
            return this;
        },

        wrapInner: function (html) {
            if (hAzzle.isFunction(html)) {
                return this.each(function (i) {
                    hAzzle(this).wrapInner(html.call(this, i));
                });
            }

            return this.each(function () {
                var self = hAzzle(this),
                    contents = self.contents();

                if (contents.length) {
                    contents.wrapAll(html);

                } else {
                    self.append(html);
                }
            });

        },

        /**
         *  Wrap an HTML structure around the content of each element in the set of matched elements.
         *
         * @param {String} html
         * @return {Object}
         *
         */

        unwrap: function () {
            this.parent().each(function () {
                if (!hAzzle.nodeName(this, "body")) {
                    hAzzle(this).replaceWith(hAzzle(this).children()).remove();
                }
            });
            return this;
        }
    });


    /**
     * Extend the HTMLHook
     */

    hAzzle.each(['optgroup', 'tbody', 'tfoot', 'colgroup', 'caption'], function (name) {
        hAzzle.htmlHooks[name] = function () {
            return hAzzle.htmlHooks['thead'];
        };
    });

    /* 
     * Prepend, Append, Befor and After
     *
     *  NOTE!!!
     *
     *  If 'html' are plain text, we use the insertAdjacentHTML to inject the content.
     *	   This method is faster, and now supported by all major browsers.
     *
     *	   If not a pure string, we have to go the long way jQuery walked before us :)
     *
     *	   K.F
     */


    hAzzle.each({
        prepend: "afterbegin",
        append: "beforeend"
    }, function (name, second) {

        hAzzle.fn[name] = function (html) {
            // Take the easy and fastest way if it's a string
            if (typeof html === 'string') {
                return this.each(function (_, elem) {
                    if (NodeMatching(this)) {
                        elem.insertAdjacentHTML(second, html);
                    }
                });
            } else { // The long walk :(
                return this.manipulateDOM(arguments, function (elem) {
                    if (NodeMatching(this)) {

                        var target = hAzzle.nodeName(this, "table") &&
                            hAzzle.nodeName(hAzzle.nodeType(11, elem) ? elem : elem.firstChild, "tr") ?
                            this.getElementsByTagName("tbody")[0] ||
                            elem.appendChild(this.ownerDocument.createElement("tbody")) :
                            this;
                        // Choose correct method	
                        name === 'prepend' ? target.insertBefore(elem, target.firstChild) : target.appendChild(elem);
                    }
                });
            }
        };
    });

    /**
     * Before and After
     */

    hAzzle.each({
        before: "beforebegin",
        after: "afterend"
    }, function (name, second) {

        hAzzle.fn[name] = function (html) {
            if (hAzzle.isString(html)) {
                return this.each(function () {
                    this.insertAdjacentHTML(second, html);
                });
            }
            return this.manipulateDOM(arguments, function (elem) {
                if (this.parentNode) {
                    this.parentNode.insertBefore(elem, name === 'after' ? this : this.nextSibling);
                }
            });
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


    // Removeable


    var cahce = [],
        timeout;

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

            // Discard any data on the element

            return this.removeData().each(function () {

                // Locate all nodes that belong to this element

                var elements = hAzzle(this).find('*');
                elements = elements.add(this);

                // Remove all attached event handlers

                hAzzle.each(elements, function () {
                    hAzzle.Events.remove(this);
                });

                // Remove all parent nodes
                if (this.parentNode)
                    if (this.tagName === 'IMG') {
                        cache.push(this)
                        this.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
                        if (timeout) clearTimeout(timeout)
                        timeout = setTimeout(function () {
                            cache = []
                        }, 60000)
                    }
                try {
                    this.parentNode.removeChild(this)
                } catch (e) {}
            })
        }
    });


    // Traversing


    /*!
     * Traversing.js
     */
    var
    cached = [],
        slice = Array.prototype.slice;

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

        closest: function (sel, context) {
            return this.map(function (elem) {
                if (hAzzle.nodeType(1, elem) && elem !== context && !hAzzle.isDocument(elem) && hAzzle.matches(elem, typeof sel == 'object' ? hAzzle(sel) : sel)) {
                    return elem;
                }
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

        has: function (target) {
            var targets = hAzzle(target, this),
                l = targets.length;

            return this.filter(function () {
			   for ( var i = 0; i < l; i++ ) {
                    if (hAzzle.contains(this, targets[i])) {
                        return true;
                    }
                }
            });
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
                        if (hAzzle.nodeType(1, element)) {
                            ancestors.push(element);
                            return element;
                        }
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

        contents: function () {
            return this.map(function (elem) {
                return elem.contentDocument || slice.call(elem.childNodes)
            })
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
                        if (hAzzle.isElement(children[i]) && hAzzle.nodeType(1, children[i]) && children[i] !== elem) {
                            siblings.push(children[i]);
                        }
                    }
                });
                cached[sel] = siblings;
            }
            return hAzzle.create(cached[sel], sel);
        }

    });


    /**
     * Lightweight, but powerfull animation engine
     *
     *  BUGGY WORK IN PROGRESS !!!!!!
     *
     * Features:
     *
     * - RAF support
     * - Animation of single and multiple elements
     * - Animation of all border colors at the same time
     * - Animation of only one border - top, left, right, bottom
     * - Animation of background colors
     * - Background animation
     * - Build-in hooks for CSS transformation support (external plugin)
     *
     * hAzzle functions added here:
     *
     * - fadeIn
     * - fadeOut
     */
    var dictionary = [],
        defaultEase = 'easeOutQuad',
        engineRunning,
        defaultDuration = 500,
        trans,
        timer,
        intervalSpeed,
        borColor,
        rip,
        moved,
        cancel = hAzzle.prefix('CancelAnimationFrame'),
        request = hAzzle.prefix('RequestAnimationFrame'),

        clrs = /(#|rgb)/,
        gotcha = /(auto|inherit|rgb|%|#)/,

        // credit: http://www.bitstorm.org/jquery/color-animation/
        color2 = /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/,
        color1 = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/;

    /**
     * Our animation engine
     */

    function engine() {

        var run = false,
            leg = length,
            internal;

        while (leg--) {

            internal = dictionary[leg];

            if (!internal) break;
            if (internal.transactive) continue;

            if (internal.cycle()) {

                run = true;

            } else {

                internal.stop(false, internal.complete, false, true);
            }

        }

        if (request) {

            if (run) {

                request(engine);

            } else {

                cancel(engine);
                internal = trans = null;
            }

        } else {

            if (run) {

                if (!engineRunning) timer = setInterval(engine, intervalSpeed);

            } else {

                clearInterval(timer);
                internal = trans = null;

            }

        }

        engineRunning = run;

    }

    function Tween(obj, to, sets) {

        // Get the "running" length

        length = dictionary.length;

        hAzzle.data(obj, 'cj', dictionary[length++] = this);

        var self = hAzzle.data(obj, 'cj');

        this.runner = function (force) {

            self.obj = obj;
            self.complete = sets.callback;
            self.completeParams = sets.callbackParams;

            if (force === true) {

                self.transitions = [];
                return;
            }

            var key,
                i = 0,
                tweens = [],
                duration = sets.duration || defaultDuration,
                easing = hAzzle.isFunction(hAzzle.easing[defaultEase]) ? hAzzle.easing[defaultEase] : hAzzle.easing[sets.ease];

            // Set the element to "visible" 

            hAzzle.style(obj, "visibility", "visible");

            if (sets.fadeIn) {

                hAzzle.style(obj, "display", sets.display || "block");
                hAzzle.setOpacity(obj, 0);
            }

            // Animation of border colors

            if (to.borderColor && !borColor) {

                var clr = to.borderColor;

                to.borderTopColor = clr;
                to.borderRightColor = clr;
                to.borderBottomColor = clr;
                to.borderLeftColor = clr;

                delete to.borderColor;

            }

            // Animate backgroundPosition or normal animation

            for (key in to) {
                if (!to.hasOwnProperty(key)) continue;
                tweens[i++] = self[key === "backgroundPosition" ? 'bgPosition' : 'animate'](obj, key, to[key], duration, easing);
            }

            self.transitions = tweens;
            (engineRunning) ? setTimeout(checkEngine, 10) : engine();

        };

        if (sets.fadeOut) {

            hAzzle.data(obj, 'fadeOut', true);

        } else if (sets.fadeIn) {

            hAzzle.data(obj, 'fadeIn', true);

        }

        if (sets.duration === 0) {

            this.runner(true);
            this.stop();
            return;

        }

        if (!sets.delay) {

            this.runner();

        } else {

            this.delayed = setTimeout(this.runner, sets.delay);

        }
    }


    Tween.prototype = {

        // Allmost the same as "step" in jQuery

        cycle: function () {

            trans = this.transitions;
            if (!trans) return true;

            rip = trans.length;
            moved = false;

            while (rip--) {

                if (trans[rip]()) moved = true;
            }

            return moved;
        },

        // Run the animation

        animate: function (obj, prop, value, duration, ease) {

            var tick, opacity = prop === "opacity",
                passed = true;

            tick = curCSS(obj, prop);

            if (!gotcha.test(tick)) {

                tick = parseFloat(tick);

            } else {

                if (!clrs.test(tick)) {

                    tick = 0;

                } else {

                    if (value.search("rgb") === -1) {

                        return this.color(obj, prop, tick, value, duration, ease);

                    } else {

                        passed = false;

                    }
                }
            }

            var px = !opacity ? "px" : 0,
                constant = value - tick,
                range = tick < value,
                then = hAzzle.now(),
                begin = tick,
                timed = 0,
                finish,
                pTick,
                now;

            finish = value + px;

            // Define correct range

            if (range) {

                value -= (opacity ? 0.025 : 0.025);

            } else {

                value += (opacity ? 0.025 : 0.025)
            }


            // Start transformation

            function trans() {

                now = hAzzle.now();
                timed += now - then;
                tick = ease(timed, begin, constant, duration);
                then = now;

                if (!opacity) {

                    tick = range ? (tick + 0.5) | 0 : (tick - 0.5) | 0;
                }

                if (tick === pTick) return true;

                if (range) {

                    if (tick >= value) {

                        hAzzle.style(obj, prop, finish);
                        return false;

                    }

                } else {

                    if (tick <= value) {

                        hAzzle.style(obj, prop, finish);
                        return false;
                    }

                }

                pTick = tick;

                hAzzle.style(obj, prop, tick + px);

                return true;

            }

            function cancelled() {

                return false;

            }

            if (passed) {

                trans.stored = [prop, finish];
                return trans;

            } else {

                cancelled.stored = [prop, finish];
                return cancelled;

            }
        },

        /**
         * Background animation
         */

        bgPosition: function (obj, prop, value, duration, ease) {

            var style = obj.style,
                val = style[prop],
                then = hAzzle.now(),
                passed = true,
                timed = 0,
                finalX,
                finalY,
                finish,
                prevX,
                prevY,
                hasX,
                hasY,
                difX,
                difY,
                tick,
                now,
                xx,
                yy,
                x,
                y;

            /**
             * WORK IN PROGRESSS
             *
             */
            //tick = curCSS(obj, prop);		
            tick = (val !== "") ? val.split(" ") : compute(obj, null).backgroundPosition.split(" ");

            x = tick[0];
            y = tick[1];

            if (x.search("%") !== -1) {

                if (x !== "0%") passed = false;

            }

            if (y.search("%") !== -1) {

                if (y !== "0%") passed = false;

            }

            x = parseInt(x, 10);
            y = parseInt(y, 10);

            if (value.hasOwnProperty("x")) {

                xx = value.x;
                hasX = true;

            } else {

                xx = x;
                hasX = false;

            }

            if (value.hasOwnProperty("y")) {

                yy = value.y;
                hasY = true;

            } else {

                yy = y;
                hasY = false;

            }

            hasX = hasX && x !== xx;
            hasY = hasY && y !== yy;
            if (!hasX && !hasY) passed = false;

            difX = xx - x;
            difY = yy - y;
            finalX = xx + "px";
            finalY = yy + "px";
            finish = finalX + " " + finalY;

            function trans() {

                now = hAzzle.now();
                timed += now - then;
                then = now;

                tick = ease(timed, 0, 1, duration);

                if (tick < 0.99) {

                    if (hasX) {

                        xx = ((x + (difX * tick)) + 0.5) | 0;

                    }

                    if (hasY) {

                        yy = ((y + (difY * tick)) + 0.5) | 0;

                    }

                    if (xx === prevX && yy === prevY) return true;

                    prevX = xx;
                    prevY = yy;

                    style.backgroundPosition = xx + "px" + " " + yy + "px";

                    return true;

                } else {

                    style[prop] = finish;

                    return false;

                }

            }

            function cancelled() {

                return false;

            }

            if (passed) {

                trans.stored = [prop, finish];
                return trans;

            } else {

                cancelled.stored = [prop, finish];
                return cancelled;

            }

        },




        /**
         * Color animation
         **/

        color: function (obj, prop, tick, value, duration, ease) {

            var pound = value.search("#") !== -1 ? "" : "#",
                finish = pound + value,
                then = hAzzle.now(),
                style = obj.style,
                passed = false,
                starts = [],
                ends = [],
                timed = 0,
                i = -1,
                now,
                clr,
                st;

            if (tick.search("rgb") !== -1) {

                i = -1;
                starts = tick.split("(")[1].split(")")[0].split(",");
                while (++i < 3) starts[i] = parseInt(starts[i], 10);

            } else {

                starts = getColor(tick);

            }

            ends = getColor(value);
            i = -1;

            while (++i < 3) {

                if (starts[i] !== ends[i]) passed = true;

            }

            function trans() {

                now = hAzzle.now();
                timed += now - then;
                then = now;

                tick = ease(timed, 0, 1, duration);

                if (tick < 0.99) {

                    i = -1;
                    st = "rgb(";

                    while (++i < 3) {

                        clr = starts[i];
                        st += (clr + tick * (ends[i] - clr)) | 0;
                        if (i < 2) st += ",";

                    }

                    style[prop] = st + ")";
                    return true;

                } else {

                    style[prop] = finish;
                    return false;

                }

            }

            function cancelled() {

                return false;

            }

            if (passed) {

                trans.stored = [prop, finish];
                return trans;

            } else {

                cancelled.stored = [prop, finish];
                return cancelled;

            }

        },

        /**
         * Stop current animation
         **/

        stop: function (complete, callback, popped) {


            var element = this.obj;

            if (!element) {

                clearTimeout(this.delayed);

                this.runner(true);
                this.stop(complete, callback);

                return;

            }

            hAzzle.removeData(element, 'cj');

            if (complete) {

                var group = this.transitions,
                    i = group.length,
                    ar, prop;

                while (i--) {

                    ar = group[i].stored;
                    prop = ar[0];


                    element.style[prop] = ar[1];
                }
            }

            checkElement(element);
            if (callback) callback = this.complete;
            if (!popped) popTween(this, element, callback, this.completeParams);

        }

    };




    hAzzle.fn.extend({

        // FIXME!! We don't have a queue, so we need to stop the animation every time.
        //         Todo - Add animation queue. KF

        animate: function (to, settings) {
            return this.stop().each(function () {
                new Tween(this, to, settings || {});
                return this;
            });
        },

        /**
         *  FadeIn an element
         *
         */


        fadeIn: function (settings) {

            if (!settings) settings = {};

            settings.fadeIn = true;

            this.animate({
                opacity: 1
            }, settings);

        },

        /**
         *  FadeOut an element
         *
         */

        fadeOut: function (settings) {

            if (!settings) settings = {};

            settings.fadeOut = true;

            this.animate({
                opacity: 0
            }, settings);

        },

        /**
         *  Stop all running aniamtions on an object
         **/

        stop: function (complete, callback) {
            return this.each(function () {
                var dcj = hAzzle.data(this, "cj");

                if (dcj) {
                    // CSS transformation
                    if (dcj.transactive) {
                        return dcj.stop(callback);
                    } else {
                        return dcj.stop(complete, callback);

                    }
                }

            });
        }

    });


    hAzzle.extend({

        /**
         * Used *ONLY* if we are dealing with CSS transformation (not supported in IE9)
         * If CSS transform antimation plugin are added, set 'transactive' to true
         */

        transactive: false,

        easing: {
            'easeInQuad': function (t, b, c, d) {

                return c * (t /= d) * t + b;
            },
            'easeOutQuad': function (t, b, c, d) {
                return -c * (t /= d) * (t - 2) + b;
            },
            'easeInOutQuad': function (t, b, c, d) {
                return ((t /= d / 2) < 1) ? c / 2 * t * t + b : -c / 2 * ((--t) * (t - 2) - 1) + b;
            },
            easeInCubic: function (t, b, c, d) {
                return c * (t /= d) * t * t + b;
            },
            easeOutCubic: function (t, b, c, d) {
                return c * ((t = t / d - 1) * t * t + 1) + b;
            },
            easeInOutCubic: function (t, b, c, d) {
                return ((t /= d / 2) < 1) ? c / 2 * t * t * t + b : c / 2 * ((t -= 2) * t * t + 2) + b;
            },
            easeInQuart: function (t, b, c, d) {
                return c * (t /= d) * t * t * t + b;
            },
            easeOutQuart: function (t, b, c, d) {
                return -c * ((t = t / d - 1) * t * t * t - 1) + b;
            },
            easeInOutQuart: function (t, b, c, d) {
                if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
                return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
            },
            easeInQuint: function (t, b, c, d) {
                return c * (t /= d) * t * t * t * t + b;
            },
            easeOutQuint: function (t, b, c, d) {
                return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
            },
            easeInOutQuint: function (t, b, c, d) {
                return ((t /= d / 2) < 1) ? c / 2 * t * t * t * t * t + b : c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
            },
            easeInSine: function (t, b, c, d) {
                return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
            },
            easeOutSine: function (t, b, c, d) {
                return c * Math.sin(t / d * (Math.PI / 2)) + b;
            },
            easeInOutSine: function (t, b, c, d) {
                return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
            },
            easeInExpo: function (t, b, c, d) {
                return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
            },
            easeOutExpo: function (t, b, c, d) {
                return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
            },
            easeInOutExpo: function (t, b, c, d) {
                if (t === 0) return b;
                if (t === d) return b + c;
                if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;

                return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
            },
            easeInCirc: function (t, b, c, d) {
                return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
            },
            easeOutCirc: function (t, b, c, d) {
                return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
            },
            easeInOutCirc: function (t, b, c, d) {
                return ((t /= d / 2) < 1) ? -c / 2 * (Math.sqrt(1 - t * t) - 1) + b : c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
            },
            easeInElastic: function (t, b, c, d) {
                var s = 1.70158;
                var p = 0;
                var a = c;
                if (t === 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                if (a < Math.abs(c)) {
                    a = c;
                    s = p / 4;
                } else s = p / (2 * Math.PI) * Math.asin(c / a);
                return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            },
            easeOutElastic: function (t, b, c, d) {
                var s = 1.70158,
                    p = 0,
                    a = c;
                if (t === 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                if (a < Math.abs(c)) {
                    a = c;
                    var s = p / 4;
                } else var s = p / (2 * Math.PI) * Math.asin(c / a);
                return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
            },
            easeInOutElastic: function (t, b, c, d) {
                var s = 1.70158;
                var p = 0;
                var a = c;
                if (t === 0) return b;
                if ((t /= d / 2) == 2) return b + c;
                if (!p) p = d * (.3 * 1.5);
                if (a < Math.abs(c)) {
                    a = c;
                    s = p / 4;
                } else s = p / (2 * Math.PI) * Math.asin(c / a);
                if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
                return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
            },
            easeInBack: function (t, b, c, d, s) {
                if (s === undefined) s = 1.70158;
                return c * (t /= d) * t * ((s + 1) * t - s) + b;
            },

            easeOutBack: function (t, b, c, d, s) {
                if (s === undefined) s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            },
            easeInOutBack: function (t, b, c, d, s) {
                if (s === undefined) s = 1.70158;
                if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
            },
            easeOutBounce: function (t, b, c, d) {
                if ((t /= d) < (1 / 2.75)) {
                    return c * (7.5625 * t * t) + b;
                } else if (t < (2 / 2.75)) {
                    return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
                } else if (t < (2.5 / 2.75)) {
                    return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
                } else {
                    return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
                }
            }

        },

        stop: function (obj, complete, callback) {

            var dcj = hAzzle.data(obj, "cj");

            // CSS transformation are running

            if (!dcj.transactive) {
                return dcj.stop(complete, callback);
            } else {
                return dcj.stop(callback);
            }

        },

        stopAll: function (complete) {

            if (cancel) {

                cancel(engine);

            } else {

                clearInterval(timer);
            }
            var i = dictionary.length,
                itm;
            length = 0;

            while (i--) {

                itm = dictionary[i];

                if (!itm.transactive) {

                    itm.stop(complete, false, true, true);

                } else {

                    itm.stop(false, true);
                }
            }

            dictionary = [];
            engineRunning = false;
            itm = trans = null;
        },

        /**
         * Set the default easing function
         */

        setEase: function (easing) {
            defaultEase = easing;
        },

        /**
         * Set default duration
         */

        setDuration: function (num) {
            defaultDuration = num;
        }

    });


    // if CSS3 fadeIn/fadeOut gets aborted, restore the properties
    function checkElement(element) {

        if (hAzzle.data(element, 'fadeIn')) {
            hAzzle.removeData(element, 'fadeIn');
            element.style.opacity = 1;
            element.style.visibility = "visible";

        } else if (hAzzle.data(element, 'fadeOut')) {
            hAzzle.removeData(element, 'fadeOut');
            element.style.display = "none";
        }
    }


    /**
     * Checks to make sure the timeline engine starts
     */

    function checkEngine() {
        if (!engineRunning) engine();

    }

    /**
     * Removes the tween from memory when finished
     */

    function popTween($this, element, callback, params) {

        dictionary.splice(dictionary.indexOf($this), 1);
        length = dictionary.length;

        if (callback) callback(element, params);

    }


    // parse hex color
    // credit: http://www.bitstorm.org/jquery/color-animation/
    function getColor(color) {

        var matched;

        if (matched = color1.exec(color)) {

            return [parseInt(matched[1], 16), parseInt(matched[2], 16), parseInt(matched[3], 16), 1];

        } else if (matched = color2.exec(color)) {

            return [parseInt(matched[1], 16) * 17, parseInt(matched[2], 16) * 17, parseInt(matched[3], 16) * 17, 1];

        }

    }

    window['hAzzle'] = hAzzle;

})(window);