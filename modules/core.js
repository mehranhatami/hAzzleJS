/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight
 * Version: 0.24a
 * Released under the MIT License.
 *
 * Date: 2014-04-07
 *
 * NOTE!!
 *
 * As it is now, the "selector" engine is very basic and lack support for complex selectors.
 * I will deal with this soon everything else is fixed.
 *
 * I just mention quickly that hAzzle is not jQuery or a jQuery / Zepto clone. And therefor
 * people can't expect hAzzle to work like that eiter.
 *
 * But I will re-build the selector engine ASAP. I also holding back because I want to see the
 * outcome of the CSS4 specs.
 *
 */
(function (window, undefined) {

    // hAzzle already defined, leave now

    if (window['hAzzle']) return;

    var doc = window.document,
        byClass = 'getElementsByClassName',
        byTag = 'getElementsByTagName',
        byId = 'getElementById',
        byAll = 'querySelectorAll',
        nodeType = 'nodeType',

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

        uid = {
            current: 0,
            next: function () {
                return ++this.current;
            }
        },

        cached = [],

        // Selector caching

        cache = [],

        // RegExp we are using

        expr = {

            idClassTagNameExp: /^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/,
            tagNameAndOrIdAndOrClassExp: /^(\w+)(?:#([\w-]+)|)(?:\.([\w-]+)|)$/
        },

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

        var pixelPositionVal, boxSizingReliableVal,
            docElem = doc.documentElement,
            container = doc.createElement("div"),
            div = doc.createElement("div");

        if (!div.style) {
            return;
        }

        div.style.backgroundClip = "content-box";
        div.cloneNode(true).style.backgroundClip = "";
        support.clearCloneStyle = div.style.backgroundClip === "content-box";

        container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" +
            "position:absolute";

        container.appendChild(div);



        function computePixelPositionAndBoxSizingReliable() {
            div.style.cssText =
            // Support: Firefox<29, Android 2.3
            // Vendor-prefix box-sizing
            "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
                "box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
                "border:1px;padding:1px;width:4px;position:absolute";
            div.innerHTML = "";
            docElem.appendChild(container);

            var divStyle = window.getComputedStyle(div, null);
            pixelPositionVal = divStyle.top !== "1%";
            boxSizingReliableVal = divStyle.width === "4px";

            docElem.removeChild(container);
        }

        var pixelPosition = function () {
            return pixelPositionVal;
        },
            boxSizingReliable = function () {
                if (boxSizingReliableVal === null) {
                    computePixelPositionAndBoxSizingReliable();
                }
                return boxSizingReliableVal;
            };
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
                if (!nodeTypes[nt]) return hAzzle.pluck(this.elems, prop);
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
         * Determine if the element contains the klass.
         * Uses the `classList` api if it's supported.
         * https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
         *
         * @param {Object} el
         * @param {String} klass
         *
         * @return {Array}
         */

        containsClass: function (el, klass) {
            if (support.classList) {
                return el.classList.contains(klass);
            } else {
                return hAzzle.contains(('' + el.className).split(' '), klass);
            }
        },

        /**
         * Normalize context.
         *
         * @param {String|Array} ctx
         *
         * @return {Object}
         */

        normalizeCtx: function (ctx) {
            if (!ctx) return doc;
            if (typeof ctx === 'string') return hAzzle.select(ctx)[0];
            if (!ctx[nodeType] && ctx instanceof Array) return ctx[0];
            if (ctx[nodeType]) return ctx;
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

            ctx = hAzzle.normalizeCtx(ctx);

            if (m = expr['idClassTagNameExp'].exec(sel)) {
                if ((sel = m[1])) {
                    els = ((els = ctx[byId](sel))) ? [els] : [];
                } else if ((sel = m[2])) {
                    els = ctx[byClass](sel);
                } else if ((sel = m[3])) {
                    els = ctx[byTag](sel);
                }
            } else if (m = expr['tagNameAndOrIdAndOrClassExp'].exec(sel)) {
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
                } catch (e) {}
            }

            return hAzzle.isNodeList(els) ? slice.call(els) : hAzzle.isElement(els) ? [els] : els;
        },

        /**
         * Check if an element contains another element
         */

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

    window['hAzzle'] = hAzzle;

})(window);