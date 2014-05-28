/*!
 * hazzle.js
 * Copyright (c) 2014 Kenny Flashlight & Mehran Hatami
 * Version: 0.6
 * Released under the MIT License.
 *
 * Date: 2014-05-17
 */
(function (window, undefined) {

   // hAzzle already defined, leave now

    if (window['hAzzle']) {

        return;
    }

    var win = window,
        doc = win.document,
        html = doc.documentElement,

        // DOM ready related

        readyList = [],
        readyFired = false,
        readyEventHandlersInstalled = false,
		
		Ap = [],
        slice = Ap.slice,
        reverse = Ap.reverse,
        push = Ap.push,


        /**
         * Prototype references.
         */

        ArrayProto = Array.prototype,

        /**
         * Create a reference to some core methods
         */

        slice = ArrayProto.slice,
        concat = ArrayProto.concat,
        toString = Object.prototype.toString,

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

        hAzzle = function (selector, context) {
            return new Core(selector, context);
        }    parentNode = 'parentNode',
    setAttribute = 'setAttribute',
    getAttribute = 'getAttribute',
    singleTag = /^\s*<([^\s>]+)/,
    specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i,
    uniqueTags = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    simpleScriptTagRe = /\s*<script +src=['"]([^'"]+)['"]>/,
    wp = /\S+/g,

    // Inspiration from jQuery

    table = ['<table>', '</table>', 1],
    td = ['<table><tbody><tr>', '</tr></tbody></table>', 3],
    option = ['<select>', '</select>', 1],
    noscope = ['_', '', 0, 1],
    tagMap = { // tags that we have trouble *inserting*
          thead: table, tbody: table, tfoot: table, colgroup: table, caption: table
        , tr: ['<table><tbody>', '</tbody></table>', 2]
        , th: td , td: td
        , col: ['<table><colgroup>', '</colgroup></table>', 2]
        , fieldset: ['<form>', '</form>', 1]
        , legend: ['<form><fieldset>', '</fieldset></form>', 2]
        , option: option, optgroup: option
        , script: noscope, style: noscope, link: noscope, param: noscope, base: noscope
      },

    special = {
        "for": "htmlFor",
        "class": "className"
    },

    hooks = {

        'SELECT': function (elem) {

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
                    (hAzzle.features.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
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
        },

        'OPTION': function (elem) {

            var val = elem[getAttribute](name, 2);

            return val !== null ? val : hAzzle.trim(hAzzle.getText(elem));
        }
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

    iAh = function (el, direction, html) {
        if (el && el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
            el.insertAdjacentHTML(direction, hAzzle.trim(html));
        }
    };



    function Core(selector, context) {

        this.length = 0;

        if (selector) {

            if (typeof selector === "string") {

                selector = hAzzle.select(selector, context);

            } else {

                // Domready

                if (hAzzle.isFunction(selector)) {

                    return hAzzle.ready(selector);
                }

                //Array

                if (selector instanceof Array) {

                    selector = hAzzle.unique(sel.filter(hAzzle.isElement));

                } else if (hAzzle.isObject(selector)) {

                    selector = [selector];
                }
            }

            var i = this.length = selector.length;
            while (i--) {
                this[i] = selector[i];
            }

            return this;
        }
    }

    /**
     * hAzzle prototype
     */

    Core.prototype = {

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
                n,
                i = 0,
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
        },
		
	// Traversing
	
    /**
     * Find the first matched element by css selector
     *
     * @param {String|Object} selector
     * @return {Object}
     *
     */

    find: function (selector) {
        var i,
            len = this.length,
            ret = [],
            self = this;

        // String

        if (typeof selector === "string") {

            for (i = 0; i < len; i++) {
                hAzzle.select(selector, self[i], ret);
            }

            return hAzzle(ret);

        } else { // Object
            return hAzzle(selector).filter(function () {
                for (i = 0; i < len; i++) {
                    if (hAzzle.contains(self[i], this)) {
                        return true;
                    }
                }
            });
        }
    },


    /** Determine the position of an element within the matched set of elements
     *
     * @param {string} elem
     * @param {return} Object
     */

    index: function (element) {

        if (element) {

            return this.indexOf(hAzzle(element)[0]);

        } else {

            return this.parent().children().indexOf(this[0]) || -1;

        }
    },

    adjacent: function (selector) {
        var expressions = slice.call(arguments, 1).join(', '),
            siblings = this.siblings(selector),
            results = [],
            i = 0,
            sibling;

        for (; sibling = siblings[i]; i++) {
            if (hAzzle.select(sibling, null, null, expressions)) {
                results.push(sibling);
            }
        }

        return hAzzle(results);
    },


    /**
     * Returns element's first descendant (or the Nth descendant, if index is specified)
     * that matches expression.
     */

    down: function (selector, index) {

        index = findIndex(selector, index);

        return hAzzle(collect(this, function (el) {
            var f = hAzzle.select(typeof selector === "string" ? selector : '*', el);

            if (index === null) {

                return f;

            } else {

                return [f[index]] || [];

            }
        }));
    },

    /**
     * Returns element's first ancestor (or the Nth ancestor, if index is specified)
     * that matches expression
     */

    up: function (selector, index) {
        return hAzzle(traverse(this, 'parentNode', selector, index));
    },

    /**
     * Get immediate parents of each element in the collection.
     * If CSS selector is given, filter results to include only ones matching the selector.
     *
     * @param {String} selector
     * @return {hAzzle}
     */

    parent: function (selector) {

        var matched = hAzzle.map(this, function (elem) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null;
        });

        if (selector && typeof selector === "string") {
            matched = hAzzle.select(selector, null, null, matched);
        }
        return hAzzle(matched);
    },

    parents: function () {
        return this.up.apply(this, arguments.length ? arguments : ['*']);
    },

    parentsUntil: function (until, selector) {

        var matched = hAzzle.map(this, function (elem, i, until) {
            return dir(elem, "parentNode", until);
        }, until);


        if (selector && typeof selector === "string") {
            matched = hAzzle.select(selector, null, null, matched);
        }

        return hAzzle(matched);
    },

    /**
     * Get the element that matches the selector, beginning at the current element and progressing up through the DOM tree.
     * OR the closest Nth elements if index is specified
     *
     * @param {String} selector
     * @param {Number} index
     * @return {hAzzle}
     */

    closest: function (selector, index) {
        if (typeof selector === "number") {
            index = selector;
            selector = '*';
        } else if (typeof index !== "number") {
            index = 0;
        }
        return hAzzle(traverse(this, 'parentNode', selector, index, true));
    },

    /**
     * Get the immediately preceding sibling of each element
     * OR Nth preceding siblings of each element, if index is specified
     *
     * @param {String} selector
     * @param {Number} index
     * @return {hAzzle}
     */

    prev: function (selector, index) {
        return hAzzle(traverse(this, 'previousSibling', selector, index));

    },

    prevAll: function () {
        return hAzzle(hAzzle.map(this, function (elem) {
            return dir(elem, "nextSibling");
        }));
    },

    prevUntil: function (until, selector) {

        var matched = hAzzle.map(this, function (elem, i, until) {
            return dir(elem, "previousSibling", until);
        }, until);


        if (selector && typeof selector === "string") {
            matched = hAzzle.select(selector, null, null, matched);
        }

        return hAzzle(matched);

    },

    /**
     * Get the immediately following sibling of each element
     * OR Nth following siblings of each element, if index is specified
     *
     * @param {String} selector
     * @param {Number} index
     * @return {hAzzle}
     */

    next: function (selector, index) {
        return hAzzle(traverse(this, 'nextSibling', selector, index));

    },

    nextAll: function () {
        return hAzzle(hAzzle.map(this, function (elem) {
            return dir(elem, "nextSibling");
        }));
    },

    nextUntil: function (until, selector) {
        var matched = hAzzle.map(this, function (elem, i, until) {
            return dir(elem, "nextSibling", until);
        }, until);

        if (selector && typeof selector === "string") {
            matched = hAzzle.select(selector, null, null, matched);
        }

        return hAzzle(matched);
    },

    /**
     * Returns everything but the first entry of the array
     */

    tail: function (index) {
        return this.slice(index === null ? 1 : index);
    },

    /**
     * Return an sequense of elements from the 'elems stack', plucked
     * by the given numbers
     *
     * Example:
     *
     * hAzzle('p').collection([1,6, 9])
     *
     * Outputs elem 1,6, 9 from the stack
     *
     * @param {array} count
     * @return {object}
     *
     */

    collection: function (count) {

        if (!hAzzle.isArray(count)) {
            return [];
        }

        var holder = [],
            i = count.length;
        while (i--) {
            holder.push(this[count[i]]);
        }

        return hAzzle(holder) || this;
    },
    /**
     * Collects all of element's siblings and returns them as an Array of elements
     * OR collect Nth siblings, if index is specified
     *
     * @param {String} selector
     * @param {Number} index
     * @return {hAzzle}
     */

    siblings: function (selector, index) {
        var self = this,
            arr = slice.call(this, 0),
            i = 0,
            l = arr.length;

        for (; i < l; i++) {
            arr[i] = arr[i].parentNode.firstChild;
            while (arr[i].nodeType !== 1) {
                arr[i] = arr[i].nextSibling;
            }
        }

        return hAzzle(traverse(arr, 'nextSibling', selector || '*', index, function (el, i) {
            return el !== self[i];
        }));
    },

    /**
     * Get the children of each element in the set of matched elements, optionally filtered by a selector.
     * OR Nth children of each element, if index is specified
     *
     * @param {String} selector
     * @param {Number} index
     * @return {hAzzle}
     */

    children: function (selector, index) {
        return hAzzle(traverse(this.down.call(this), 'nextSibling', selector || '*', index, true));
    },

    /**
     * Reduce the set of matched elements to the first in the set,
     * OR to the first Nth elements, if index is specified
     *
     * @param {Number} index
     * @return {hAzzle}
     */

    first: function (index) {
        return index ? this.slice(0, index) : this.eq.call(this, 0);
    },

    /**
     * Reduce the set of matched elements to the final one in the set,
     * OR to the last Nth elements, if index is specified
     *
     * @param {Number} index
     * @return {hAzzle}
     */

    last: function (index) {
        return index ? this.slice(this.length - index) : this.eq.call(this, -1);
    },

    /**
     * Reduce the set of matched elements to the one at the specified index.
     * @param {number} index
     * @return {hAzzle}
     */

    eq: function (index) {
        return this.get(index);

    },

    /**
     * @param {number} index
     * @return {Element|Node}
     */

    get: function (index) {
        return index ? hAzzle(this[eqIndex(this.length, index, 0)]) : this;
    },

    // a crazy man wrote this, don't try to understand it, see the tests

    slice: function (start, end) {
        var e = end,
            l = this.length,
            arr = [];
        start = eqIndex(l, Math.max(-this.length, start), 0);
        e = eqIndex(end < 0 ? l : l + 1, end, l);
        end = e === null || e > l ? end < 0 ? 0 : l : e;

        while (start !== null && start < end) {

            arr.push(this[start++]);
        }

        return hAzzle(arr);
    },

    filter: function (callback) {
        return hAzzle(hAzzle.filter(this, filterFn(callback)));
    },

    /**
     * Remove elements from the set of matched elements.
     *
     * @param {String} selector
     * @return {hAzzle}
     *
     */

    not: function (selector) {
        return hAzzle(hAzzle.filter(this, function () {
            return !filterFn(selector).apply(this, arguments);
        }));
    },

    /**
     * Reduce the set of matched elements to those that have a descendant that matches the selector or DOM element.
     */

    has: function (selector) {
        return hAzzle(hAzzle.filter(
            this, selector.nodeType === 1 ? function (el) {
                return hAzzle.contains(selector, el);
            } : typeof selector === 'string' && selector.length ? function (el) {
                return hAzzle.matches(selector, el).length;
            } : function () {
                return false;
            }
        ));
    },

    /**
     * Check if the first element in the element collection matches the selector
     * Some people asked about this, so note that this function only return
     * a boolean so quick-return after first successful find.
     * And are different from jQuery / Zepto is().
     *
     * @param {String} selector
     * @return {Boolean}
     */

    is: function (selector) {

        var i = 0,
            l = this.length,
            fn = filterFn(selector);

        for (; i < l; i++) {
            if (fn(this[i], i)) {
                return true;
            }
        }
        return false;
    },

    /**
     * Adds one element to the set of matched elements.
     *
     * @param {String} selector
     * @param {String} context
     * @return {hAzzle}
     */

    add: function (selector, context) {
        this.push(hAzzle(selector, context)[0]);
        return this;
    },

    toArray: function () {
        return Ap.slice.call(this);
    },

    size: function () {
        return this.length;
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

        var elem = this[0],
            nType = elem && elem.nodeType;

        if (!elem) {

            return;
        }

        // don't get/set attributes on text, comment and attribute nodes
        if (!elem || nType === 3 || nType === 8 || nType === 2) {
            return;
        }

        if (typeof elem[getAttribute] === typeof undefined) {

            return this.prop(name, value);
        }

        if (typeof value === "undefined") {

            // Checks if a "hook" exist for this...:

            if (hooks[elem.nodeName]) {

                return hooks[elem.nodeName](elem);
            }

            elem = elem[getAttribute](name, 2);

            return elem === null ? undefined : elem;
        }

        if (value === null) {

            this.removeAttr(name);
        }

        // Value is set - no need for hooks on this one...

        if (elem.nodeName === 'SELECT') {

            var optionSet, option,
                options = elem.options,
                values = hAzzle.makeArray(value),
                i = options.length;

            while (i--) {
                option = options[i];
                if ((option.selected = hAzzle.inArray(option.value, values) >= 0)) {
                    optionSet = true;
                }
            }

            if (!optionSet) {
                elem.selectedIndex = -1;
            }
            return values;

        } else {

            elem[setAttribute](name, value + "");
            return value;
        }
    },

    /**
     * Remove a given attribute from an element
     *
     * @param {String} value
     * @return {hAzzle}
     */

    removeAttr: function (value) {

        var name, propName, i = 0,
            attrNames = value && value.match(wp);

        return this.each(function (el) {

            if (attrNames && el.nodeType === 1) {

                while ((name = attrNames[i++])) {

                    propName = special[name] || name;

                    if (getBooleanAttrName(el, name)) {

                        el[propName] = false;

                    } else {

                        el.removeAttribute(name);
                    }
                }
            }
        });
    },

    /**
     * Check if an element have an attribute
     *
     * @param{String} name
     * @return {Boolean}
     */

    hasAttr: function (name) {
        return name && typeof this.attr(name) !== 'undefined';
    },

    /**
     * Sets an HTML5 data attribute
     *
     * @param{String} dataAttribute
     * @param{String} dataValue
     *
     * @return {hAzzle}
     */

    dataAttr: function (dataAttribute, dataValue) {

        if (!dataAttribute || typeof dataAttribute !== 'string') {
            return false;
        }
		var key;

        //if dataAttribute is an object, we will use it to set a data attribute for every key
        if (typeof (dataAttribute) === "object") {
            for (key in dataAttribute) {
                this.attr('data-' + key, dataAttribute[key]);
            }

            return this;
        }

        //if a value was passed, we'll set that value for the specified dataAttribute
        else if (dataValue) {
            return this.attr('data-' + dataAttribute, dataValue);
        }

        // lastly, try to just return the requested dataAttribute's value from the element
        else {
            var value = this.attr('data-' + dataAttribute);

            // specifically checking for undefined in case "value" ends up evaluating to false

            if (typeof value === "undefined") {
                return;
            }

            return value;
        }
    },

    /**
     * Read or set properties of DOM elements
     *
     * @param {String/Object} name
     * @param {String/Null} value
     * @return {hAzzle}
     */

    prop: function (name, value) {
        var el = this[0], a;
        return typeof name === "object" ? this.each(function (el) {
            for (a in name) {
                property(el, a, name[a]);
            }
        }) : typeof value === "undefined" ? el && el[special[name] || name] : property(this[0], name, value);
    },

    /**
     * Toggle properties
     */

    toggleProp: function (property) {
        return this.each(function () {
            return this.prop(property, !this.prop(property));
        });

    },

    /*
     * Remove properties from DOM elements
     *
     * @param {String} name
     * @return {hAzzle}
     */

    removeProp: function (name) {
        return this.each(function () {
            delete this[special[name] || name];
        });
    },

    /**
     * Get value for input/select elements
     * Set value for input/select elements
     *
     * @param {String} value
     * @return {Object|String}
     */

    val: function (value) {

        if (arguments.length) {

            return this.each(function (elem, index) {

                var val;

                if (elem.nodeType !== 1) {
                    return;
                }

                if (typeof value === "function") {
                    val = value.call(elem, index, hAzzle(elem).val());

                } else {

                    val = value;
                }

                if (val === null) {

                    val = "";

                } else if (typeof val === "number") {

                    val += "";

                } else if (hAzzle.isArray(val)) {

                    val = hAzzle.map(val, function (value) {

                        return value === null ? "" : value + "";
                    });
                }

                if (elem.type === 'radio' || elem.type === 'checkbox') {

                    return (elem.checked = hAzzle.inArray(hAzzle(elem).val(), value) >= 0);
                }

                if (elem.type === "select") {

                    var optionSet, option,
                        options = elem.options,
                        values = hAzzle.makeArray(value),
                        i = options.length;

                    while (i--) {
                        option = options[i];
                        if ((option.selected = hAzzle.inArray(option.value, values) >= 0)) {
                            optionSet = true;
                        }
                    }

                    // force browsers to behave consistently when non-matching value is set

                    if (!optionSet) {

                        elem.selectedIndex = -1;
                    }

                    return values;
                }

                elem.value = val;
            });

        } else {

            var el = this[0],
                ret;

            if (!hAzzle.features.checkOn) {

                return el.getAttribute("value") === null ? "on" : el.value;
            }

            ret = hooks[el.tagName] ? hooks[el.tagName](el) : el.value;

            return typeof ret === "string" ? ret.replace(/\r\n/g, "") : ret === null ? "" : ret;

        }
    },

    /**
     * Get html from element.
     * Set html to element.
     *
     * @param {String} html
     * @return {hAzzle|string}
     */

    html: function (html) {
        var append = function (el, i) {
                hAzzle.each(hAzzle.normalize(html, i), function (node) {
                    el.appendChild(node);
                });
            },
            updateElement = function (el, i) {
                try {
                    if (typeof html === 'string' && !specialTags.test(el.tagName)) {
                        el.innerHTML = html.replace(uniqueTags, "<$1></$2>");
						return;
                    }
                } catch (e) {}
                append(el, i);
            };
        return typeof html !== 'undefined' ? this.empty().each(updateElement) : this[0] ? this[0].innerHTML : '';
    },

    /**
     * Get text for the first element in the collection
     * Set text for every element in the collection

     *
     * hAzzle('div').text() => div text
     *
     * @param {String} value
     * @return {hAzzle|String}
     */

    text: function (value) {

        if (typeof value === "function") {
            return this.each(function (i) {
                var self = hAzzle(this);
                self.text(value.call(this, i, self.text()));
            });
        }

        if (typeof value !== "object" && typeof value !== "undefined") {

            return this.empty().each(function (elem) {

                if (elem.nodeType === 1 || elem.nodeType === 9 || elem.nodeType === 11) {

                    // Firefox does not support insertAdjacentText 

                    if (typeof value === "string" && typeof HTMLElement !== 'undefined' && HTMLElement.prototype.insertAdjacentText) {

                        elem.insertAdjacentText('beforeEnd', value);

                    } else {

                        elem.textContent = value;
                    }
                }
            });
        }
        return hAzzle.getText(this);
    },

    /**
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    append: function (node) {
	return typeof node === "string" && !hAzzle.isXML(this[0]) ?
             this.each(function () {
                    iAh(this, "beforeend", node);
                })
            : this.each(function (el, i) {
            if (el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
                hAzzle.each(hAzzle.normalize(node, i), function (i) {
                    // We don't allow text nodes
                    if (node.nodeType !== 3) {
                        el.appendChild(i);
                    }
                });
            }
        });
    },

    /**
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    prepend: function (node) {
   	return typeof node === "string" && !hAzzle.isXML(this[0]) ?
		    this.each(function () {
                    iAh(this, "afterbegin", node);
                })
			: this.each(function (el, i) {
            if (el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
                var first = el.firstChild;
                hAzzle.each(hAzzle.normalize(node, i), function (i) {
                    if (node.nodeType !== 3) {
                        el.insertBefore(i, first);
                    }
                });
            }
        });
    },

    /**
     * Append the current element to another
     *
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    appendTo: function (node) {
        insert.call(this, node, this, function (t, el) {
         t.appendChild(el);
        }, 1);
		return this;
    },

    /**
     * Prepend the current element to another.
     *
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    prependTo: function (node) {
        return insert.call(this, node, this, function (t, el) {
          t.insertBefore(el, t.firstChild);
        }, 1);
    },

    /**
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    before: function (node) {
        return typeof node === "string" && !hAzzle.isXML(this[0]) ?
            this.each(function () {
                iAh(this, "beforebegin", node);
            })
        : this.each(function (el, i) {
            hAzzle.each(hAzzle.normalize(node, i), function (i) {
                el[parentNode].insertBefore(i, el);
            });
        });
    },


    /**
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    after: function (node) {
       return typeof node === "string" && !hAzzle.isXML(this[0]) ?
            this.each(function () {
                iAh(this, "afterend", node);
            })
        : this.each(function (el, i) {
            hAzzle.each(hAzzle.normalize(node, i), function (i) {
                el[parentNode].insertBefore(i, el.nextSibling);
            }, null, 1);
        });
    },


    /**
     * @param {hAzzle|string|Element|Array} target
     * @param {Object} scope
     * @return {hAzzle}
     */

    insertBefore: function (node) {
        insert.call(this, node, this, function (t, el) {
            t[parentNode].insertBefore(el, t);
        });
		return this;
    },


    /**
     * @param {hAzzle|string|Element|Array} node
     * @param {Object} scope
     * @return {hAzzle}
     */

    insertAfter: function (node) {
       insert.call(this, node, this, function (t, el) {
            var sibling = t.nextSibling;
            sibling ?
                t[parentNode].insertBefore(el, sibling) :
                t[parentNode].appendChild(el);
        }, 1);
		return this;
    },

    /**
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    replaceWith: function (node) {
	    hAzzle(hAzzle.normalize(node)).insertAfter(this);
        return this.remove();
    },
	

    // Internal usage only

    push: Ap.push,
    sort: Ap.sort,
    splice: Ap.splice,
    reverse: Ap.reverse,
    concat: Ap.concat,
    indexOf: Ap.indexOf
		
		
		
    };


    /**
     * Extend the contents of two objects
     */

    hAzzle.extend = function (destination, source) {
        for (var property in destination) {
            // Objects only
            if (destination[property] && destination[property].constructor && typeof destination[property] === "object") {
                (source || Core.prototype)[property] = destination[property] || {};
            } else {
                if (destination.hasOwnProperty(property)) {
                    (source || Core.prototype)[property] = destination[property];
                }
            }
        }
    };

    hAzzle.extend({

        uidMap: {},
        uuids: 0,

        type: function (obj) {

            if (obj === null) {

                return obj + "";
            }

            return toString.call(obj);
        },

        is: function (kind, obj) {
            return hAzzle.indexOf(kind, this.type(obj)) >= 0;
        },

        /**
         * Returns true if the given string or list is null, undefined or empty (zero length).
         * If the second argument is true, the function will ignore whitespace in the string
         */

        isEmpty: function (str, ignoreWhitespace) {
            return str === null || !str.length || (ignoreWhitespace && /^\s*$/.test(str));
        },

        isDate: function (val) {
            return !!(val && val.getTimezoneOffset && val.setUTCFullYear);
        },

        isRegExp: function (r) {
            return !!(r && r.test && r.exec && (r.ignoreCase || r.ignoreCase === false));
        },

        isArguments: function (a) {
            return !!(a && Object.prototype.hasOwnProperty.call(a, 'callee'));
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
            // parseFloat NaNs numeric-cast false positives (null|true|false|"")
            // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
            // subtraction forces infinities to NaN
            return !hAzzle.isArray(obj) && obj - parseFloat(obj) >= 0;
        },
        /**
         * Checks if an string is blank
         */

        isBlank: function (str) {
            return hAzzle.trim(str).length === 0;
        },

        isArray: Array.isArray,

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
            return obj !== null && obj.nodeType === obj.DOCUMENT_NODE;
        },

        isNull: function (obj) {
            return obj === null;
        },

        isBoolean: function (value) {
            return (value === true) || (value === false);
        },

        error: function (msg) {
            throw new Error(msg);
        },

        isNumber: function (o) {
            return toString.call(o) === '[object Number]';
        },

        isString: function (o) {
            return toString.call(o) === '[object String]';
        },

        isFunction: function (o) {
            return toString.call(o) === '[object Function]';
        },

        isDefined: function (o) {
            return o !== void 0;
        },

        isUndefined: function (o) {
            return o === void 0;
        },

        IsNaN: function (val) {
            return typeof val === "number" && val !== +val;
        },

        isElement: function (o) {
            return o && o.nodeType === 1 || o.nodeType === 9;
        },

        /**
         * Checks if elements is a NodeList or HTMLCollection.
         */

        isNodeList: function (obj) {
            return obj && hAzzle.is(['nodelist', 'htmlcollection', 'htmlformcontrolscollection'], obj);
        },

        /** 
         * Return current time
         */

        now: Date.now,

        /**
         * Native indexOf is slow and the value is enough for us as argument.
         * Therefor we create our own
         */

        indexOf: function (array, obj) {
            var i = 0,
                l = array.length;

            for (; i < l; i++) {
                if (obj === array[i]) {
                    return i;
                }
            }
            return !1;
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
            return typeof v === 'function' ? v.call(el, el) : v
        },

        /**
         * Run callback for each element in the collection
         * @param {hAzzle|Array} ar
         * @param {function(Object, number, (hAzzle|Array))} fn
         * @param {Object} scope
         * @param {boolean} arg
         * @return {hAzzle|Array}
         */

        each: function (ar, fn, scope, arg) {

            if (!ar) {

                return;
            }

            var ind, i = 0,
                l = ar.length;
            for (; i < l; i++) {
                ind = arg ? ar.length - i - 1 : i;
                fn.call(scope || ar[ind], ar[ind], ind, ar);
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
                ret = []; // don't change original array
                for (i = 0, l = node.length; i < l; i++) {

                    ret[i] = hAzzle.cloneNode(node[i]);

                }
                return ret;
            }
            return node;
        },

        /**
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
        inArray: function (elem, arr, i) {

            var iOff = function (_find, i /*opt*/ ) {

                if (typeof i === 'undefined') {
                    i = 0;
                }
                if (i < 0) {
                    i += this.length;
                }
                if (i < 0) {
                    i = 0;
                }
                for (var n = this.length; i < n; i++) {
                    if (i in this && this[i] === _find) {
                        return i;
                    }
                }
                return -1;
            };
            return arr === null ? -1 : iOff.call(arr, elem, i);
        },

        map: function (elems, callback, arg) {
            var value,
                i = 0,
                length = elems.length,

                ret = [];

            // Go through the array, translating each of the items to their new values

            if (toString.call(elems) === "[object String]") {

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
                }

                // Go through every key on the object,
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

        trim: (function () {
            if (!String.prototype.trim) {
                return function (value) {
                    return value.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                };
            }
            return function (value) {
                return value.trim();
            };
        })(),

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
            var node, ret = "",
                i = 0;

            if (!elem.nodeType) {
                // If no nodeType, this is expected to be an array
                for (; node = elem[i++];) {

                    ret += hAzzle.getText(node);

                }
            } else if (elem.nodeType === 1 || elem.nodeType === 9 || elem.nodeType === 11) {

                if (typeof elem.textContent === "string") {

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
         *  Global ID for objects
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
            return elem && (elem.ownerDocument || elem).documentElement.nodeName !== "HTML";
        },

        /**
         * Return the elements nodeName
         */

        nodeName: function (el, name) {
            return el.nodeName && el.nodeName.toLowerCase() === name.toLowerCase();
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
            return results;
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
            if (doc.readyState === "complete") {

                setTimeout(ready, 1);

            } else if (!readyEventHandlersInstalled) {

                // otherwise if we don't have event handlers installed, install them

                doc.addEventListener("DOMContentLoaded", ready, false);
                // backup is window load event
                window.addEventListener("load", ready, false);

                readyEventHandlersInstalled = true;
            }
        },

        // Invoke a method (with arguments) on every item in a collection.

        invoke: function (obj, method) {
            var args = slice.call(arguments, 2),
                isFunc = typeof method === "function";
            return hAzzle.map(obj, function (value) {
                return (isFunc ? method : value[method]).apply(value, args);
            });
        },

        /**
         * Throttle through a function
         */

        throttle: function (func, wait, options) {
            var context, args, result,
                timeout = null,
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
         * Returns a standard or browser-prefixed methods (moz, webkit, ms, o) if found.
         */

        prefix: function (key, obj) {

            var result, upcased = key[0].toUpperCase() + key.slice(1),
                prefix,
                prefixes = ['moz', 'webkit', 'ms', 'o'];

            obj = obj || window;

            result = obj[key];

            if (result) {
                return result;
            }

            while (prefix = prefixes.shift()) {
                if (result = obj[prefix + upcased]) {
                    break;
                }
            }
            return result;
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



    hAzzle.contains = 'compareDocumentPosition' in html ?
        function (container, element) {
            return (container.compareDocumentPosition(element) & 16) == 16
    } :
        function (container, element) {
            return container !== element && container.contains(element);
    };


    // Expose hAzzle to the global object

    window['hAzzle'] = hAzzle;

})(window);/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight & Mehran Hatami
 * Version: 0.6
 * Released under the MIT License.
 *
 * Date: 2014-05-16
 */
(function (window, undefined) {

    // hAzzle already defined, leave now

    if (window['hAzzle']) {

        return;
    }

    var win = window,
        doc = win.document,
        html = doc.documentElement,
        // DOM ready related

        readyList = [],
        readyFired = false,
        readyEventHandlersInstalled = false,

        /**
         * Prototype references.
         */

        ArrayProto = Array.prototype,

        /**
         * Create a reference to some core methods
         */

        slice = ArrayProto.slice,
        concat = ArrayProto.concat,
        toString = Object.prototype.toString,

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

        hAzzle = function (selector, context) {
            return new Core(selector, context);
        };


    function Core(selector, context) {

        this.length = 0;

        if (selector) {



            if (typeof selector === "string") {

                selector = hAzzle.select(selector, context);

            } else {

                // Domready

                if (hAzzle.isFunction(selector)) {

                    return hAzzle.ready(selector);
                
				} else if (hAzzle.isObject(selector)) {

                    selector = [selector];
                } 
            }

            var i = this.length = selector.length;
            while (i--) {
                this[i] = selector[i];
            }

            return this;
        }
    }

    /**
     * hAzzle prototype
     */

    Core.prototype = {

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
                n,
                i = 0,
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
            if (destination[property] && destination[property].constructor && typeof destination[property] === "object") {
                (source || Core.prototype)[property] = destination[property] || {};
            } else {
                if (destination.hasOwnProperty(property)) {
                    (source || Core.prototype)[property] = destination[property];
                }
            }
        }
    };

    hAzzle.extend({

        uidMap: {},
        uuids: 0,

        type: function (obj) {

            if (obj === null) {

                return obj + "";
            }

            return toString.call(obj);
        },

        is: function (kind, obj) {
            return hAzzle.indexOf(kind, this.type(obj)) >= 0;
        },

        /**
         * Returns true if the given string or list is null, undefined or empty (zero length).
         * If the second argument is true, the function will ignore whitespace in the string
         */

        isEmpty: function (str, ignoreWhitespace) {
            return str === null || !str.length || (ignoreWhitespace && /^\s*$/.test(str));
        },

        isDate: function (val) {
            return !!(val && val.getTimezoneOffset && val.setUTCFullYear);
        },

        isRegExp: function (r) {
            return !!(r && r.test && r.exec && (r.ignoreCase || r.ignoreCase === false));
        },

        isArguments: function (a) {
            return !!(a && Object.prototype.hasOwnProperty.call(a, 'callee'));
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
            // parseFloat NaNs numeric-cast false positives (null|true|false|"")
            // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
            // subtraction forces infinities to NaN
            return !hAzzle.isArray(obj) && obj - parseFloat(obj) >= 0;
        },
        /**
         * Checks if an string is blank
         */

        isBlank: function (str) {
            return hAzzle.trim(str).length === 0;
        },

        isArray: Array.isArray,

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
            return obj !== null && obj.nodeType === obj.DOCUMENT_NODE;
        },

        isNull: function (obj) {
            return obj === null;
        },

        isBoolean: function (value) {
            return (value === true) || (value === false);
        },

        error: function (msg) {
            throw new Error(msg);
        },

        isNumber: function (o) {
            return toString.call(o) === '[object Number]';
        },

        isString: function (o) {
            return toString.call(o) === '[object String]';
        },

        isFunction: function (o) {
            return toString.call(o) === '[object Function]';
        },

        isDefined: function (o) {
            return o !== void 0;
        },

        isUndefined: function (o) {
            return o === void 0;
        },

        IsNaN: function (val) {
            return typeof val === "number" && val !== +val;
        },

        isElement: function (o) {
            return o && o.nodeType === 1 || o.nodeType === 9;
        },

        /**
         * Checks if elements is a NodeList or HTMLCollection.
         */

        isNodeList: function (obj) {
            return obj && hAzzle.is(['nodelist', 'htmlcollection', 'htmlformcontrolscollection'], obj);
        },

        /** 
         * Return current time
         */

        now: Date.now,

        /**
         * Native indexOf is slow and the value is enough for us as argument.
         * Therefor we create our own
         */

        indexOf: function (array, obj) {
            var i = 0,
                l = array.length;

            for (; i < l; i++) {
                if (obj === array[i]) {
                    return i;
                }
            }
            return !1;
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
            return typeof v == 'function' ? v.call(el, el) : v
        },

        /**
         * Run callback for each element in the collection
         * @param {hAzzle|Array} ar
         * @param {function(Object, number, (hAzzle|Array))} fn
         * @param {Object} scope
         * @param {boolean} arg
         * @return {hAzzle|Array}
         */

        each: function (ar, fn, scope, arg) {

            if (!ar) {

                return;
            }

            var ind, i = 0,
                l = ar.length;
            for (; i < l; i++) {
                ind = arg ? ar.length - i - 1 : i;
                fn.call(scope || ar[ind], ar[ind], ind, ar);
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
                ret = []; // don't change original array
                for (i = 0, l = node.length; i < l; i++) {

                    ret[i] = hAzzle.cloneNode(node[i]);

                }
                return ret;
            }
            return node;
        },

        /**
         * @param {string} str
         * @return {string}
         */

        camelize: function (str) {
            return str.replace(/-(.)/g, function (m, m1) {
                return m1.toUpperCase();
            });
        },

        arrayLike: function (o) {
            return (typeof o === 'object' && isFinite(o.length))
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
        inArray: function (elem, arr, i) {

            var iOff = function (_find, i /*opt*/ ) {

                if (typeof i === 'undefined') {
                    i = 0;
                }
                if (i < 0) {
                    i += this.length;
                }
                if (i < 0) {
                    i = 0;
                }
                for (var n = this.length; i < n; i++) {
                    if (i in this && this[i] === _find) {
                        return i;
                    }
                }
                return -1;
            };
            return arr === null ? -1 : iOff.call(arr, elem, i);
        },

        map: function (elems, callback, arg) {
            var value,
                i = 0,
                length = elems.length,

                ret = [];

            // Go through the array, translating each of the items to their new values

            if (toString.call(elems) === "[object String]") {

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
                }

                // Go through every key on the object,
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

        trim: (function () {
            if (!String.prototype.trim) {
                return function (value) {
                    return value.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
                };
            }
            return function (value) {
                return value.trim();
            };
        })(),

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
            var node, ret = "",
                i = 0;

            if (!elem.nodeType) {
                // If no nodeType, this is expected to be an array
                for (; node = elem[i++];) {

                    ret += hAzzle.getText(node);

                }
            } else if (elem.nodeType === 1 || elem.nodeType === 9 || elem.nodeType === 11) {

                if (typeof elem.textContent === "string") {

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
         *  Global ID for objects
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
            return elem && (elem.ownerDocument || elem).documentElement.nodeName !== "HTML";
        },

        /**
         * Return the elements nodeName
         */

        nodeName: function (el, name) {
            return el.nodeName && el.nodeName.toLowerCase() === name.toLowerCase();
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

            if (obj == null) {
                return results;
            }

            hAzzle.each(obj, function (value, index, list) {

                if (predicate.call(context, value, index, list)) {

                    results.push(value);

                }
            });
            return results;
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
            if (doc.readyState === "complete") {

                setTimeout(ready, 1);

            } else if (!readyEventHandlersInstalled) {

                // otherwise if we don't have event handlers installed, install them

                doc.addEventListener("DOMContentLoaded", ready, false);
                // backup is window load event
                window.addEventListener("load", ready, false);

                readyEventHandlersInstalled = true;
            }
        },

        // Invoke a method (with arguments) on every item in a collection.

        invoke: function (obj, method) {
            var args = slice.call(arguments, 2),
                isFunc = typeof method === "function";
            return hAzzle.map(obj, function (value) {
                return (isFunc ? method : value[method]).apply(value, args);
            });
        },

        /**
         * Throttle through a function
         */

        throttle: function (func, wait, options) {
            var context, args, result,
                timeout = null,
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
         * Returns a standard or browser-prefixed methods (moz, webkit, ms, o) if found.
         */

        prefix: function (key, obj) {

            var result, upcased = key[0].toUpperCase() + key.slice(1),
                prefix,
                prefixes = ['moz', 'webkit', 'ms', 'o'];

            obj = obj || window;

            result = obj[key];

            if (result) {
                return result;
            }

            while (prefix = prefixes.shift()) {
                if (result = obj[prefix + upcased]) {
                    break;
                }
            }
            return result;
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



    hAzzle.contains = 'compareDocumentPosition' in html ?
        function (container, element) {
            return (container.compareDocumentPosition(element) & 16) == 16
    } :
        function (container, element) {
            return container !== element && container.contains(element);
    }

    
	hAzzle.features = function () {

          var input = doc.createElement("input"),
              select = doc.createElement("select"),
              opt = select.appendChild(doc.createElement("option")),
              checkOn,
              div = doc.createElement('div'),
              fragment = doc.createDocumentFragment(),
              dfdiv = fragment.appendChild(div),
              mehran,

              e = doc.createElement('p');

          checkOn = input.value !== "";

          select.disabled = true;

          input.setAttribute("type", "radio");
          input.setAttribute("checked", "checked");
          input.setAttribute("name", "t");

          div.classList.add('a', 'b');

          dfdiv.appendChild(input);

          mehran = dfdiv.cloneNode(true).cloneNode(true).lastChild.checked;

          // Make sure textarea (and checkbox) defaultValue is properly cloned
          // Support: IE9-IE11+
          dfdiv.innerHTML = "<textarea>x</textarea>";

          return {
			  clearCloneStyle: div.style.backgroundClip === "content-box",
              checkClone: mehran,
              noCloneChecked: !!dfdiv.cloneNode(true).lastChild.defaultValue,
              checkOn: checkOn,
              optSelected: opt.selected,
              optDisabled: !opt.disabled,
              radioValue: input.name === "t",

            
             
              transform: function () {
                  var props = ['transform', 'webkitTransform', 'MozTransform', 'OTransform', 'msTransform'],
                      i;
                  for (i = 0; i < props.length; i++) {
                      if (props[i] in e.style) {

                          return props[i];
                      }
                  }
              },
              classList: !!document.createElement('p').classList,
              sMa: /(^| )a( |$)/.test(div.className) && /(^| )b( |$)/.test(div.className),
          };
      }();


// Create HTML

hAzzle.create = function (node) {

    if(node !== '' && typeof node === 'string') {
      
      // Script tag
	  
	  if (simpleScriptTagRe.test(node)) {
	  
 	    return [cSFH(node)];
		
	  }
           var tag = node.match(singleTag),
                el = doc.createElement('div'),
                els = [],
                p = tag ? tagMap[tag[1].toLowerCase()] : null,
                dep = p ? p[2] + 1 : 1,
                ns = p && p[3],
                pn = parentNode;

            el.innerHTML = p ? (p[0] + node + p[1]) : node;

            while (dep--) {

                if (el.firstChild) {

                    el = el.firstChild;
                }
            }

         if (ns && el && el.nodeType !== 1) {

             el = el.nextSibling;
         }

            do {

             if (!tag || el.nodeType == 1) {

	               els.push(el);
                }

            } while (el = el.nextSibling);

            hAzzle.each(els, function (el) {
				
                el[pn] && el[pn].removeChild(el);
				
            });
			
            return els;
	
	} else {

	    return  hAzzle.isNode(node) ? [node.cloneNode(true)] : [];	
	}
		 
};


// this insert method is intense
function insert(target, node, fn, rev) {
    var i = 0,
        r = [],
        nodes = typeof target === 'string' && target.charAt(0) !== '<' ? hAzzle(target) : target;
		
    // normalize each node in case it's still a string and we need to create nodes on the fly

    hAzzle.each(hAzzle.normalize(nodes), function (t, j) {
		hAzzle.each(node, function (el) {

		    fn(t, r[i++] = j > 0 ? hAzzle.cloneNode(self, el) : el);
        
		}, null, rev);
		
    }, this, rev);

    node.length = i;
    
	hAzzle.each(r, function (e) {
    
	    node[--i] = e;
    
	}, null, !rev);
    
	return self;
}

function property(elem, name, value) {

    var ret, hooks, notxml,
        nType = elem.nodeType,
        phooks = {
            tabIndex: {
                get: function (elem) {
                    return elem.hasAttribute("tabindex") || /^(?:input|select|textarea|button)$/i.test(elem.nodeName) || elem.href ? elem.tabIndex : -1;
                }
            }
        };

    // Support: IE9+

    if (!hAzzle.features.optSelected) {
        phooks.selected = {
            get: function (elem) {
                var parent = elem.parentNode;
                if (parent && parent.parentNode) {
                    parent.parentNode.selectedIndex;
                }
                return null;
            }
        };
    }

    // don't get/set properties on text, comment and attribute nodes
    if (!elem || nType === 3 || nType === 8 || nType === 2) {
        return;
    }

    notxml = nType !== 1 || (elem.ownerDocument || elem).documentElement.nodeName === "HTML";

    if (notxml) {
        hooks = phooks[special[name] || name];
    }

    if (typeof value !== "undefined") {

        return hooks && "set" in hooks && typeof (ret = hooks.set(elem, value, name)) !== 'undefined' ? ret : (elem[name] = value);

    } else {

        return hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null ? ret : elem[name];
    }
}


/**
 * DOM traversing helper. Used with prevUntil, nextUntil,
 * prevAll, nextAll, and parentUntil
 */

function dir(elem, direction, until) {
    var matched = [],
        truncate = typeof until !== "undefined";
    while ((elem = elem[direction]) && elem.nodeType !== 9) {
        if (elem.nodeType === 1) {
            if (truncate && hAzzle(elem).is(until)) {
                break;
            }
            matched.push(elem);
        }
    }
    return matched;
}

/*
 * Collect elements
 */

function collect(el, fn) {
    var ret = [],
        res, i = 0,
        j, l = el.length,
        l2;
    while (i < l) {
        j = 0;
        l2 = (res = fn(el[i], i++)).length;
        while (j < l2) {
            ret.push(res[j++]);
        }
    }
    return ret;
}

/**
 * Traverse multiple DOM elements
 */

function findIndex(selector, index) {
    return index = typeof selector === "undefined" && typeof index !== "number" ? 0 :
        typeof selector === "number" ? selector :
        typeof index === "number" ? index :
        null;
}

function traverse(el, property, selector, index, expression) {

    index = findIndex(selector, index);

    return collect(el, function (el, elind) {

        var i = index || 0,
            isString = typeof selector === "string" ? selector : '*',
            ret = [];

        if (!expression) {

            el = el[property];
        }

        while (el && (index === null || i >= 0)) {

            if (el.nodeType === 1 && (!expression || expression === true || filterFn(el, elind)) && hAzzle.matches(isString, el) && (index === null || i-- === 0)) {

                if (index === null && property !== 'nextSibling' && property !== 'parentNode') {

                    ret.unshift(el);

                } else {

                    ret.push(el);
                }
            }

            el = el[property];
        }

        return ret;
    });
}

/**
 * Given an index & length, return a 'fixed' index, fixes non-numbers & neative indexes
 */

function eqIndex(length, index, def) {

     if (index < 0)
          index = length + index
        if (index < 0 || index >= length)
          return null
        return !index && index !== 0 ? def : index
}

/**
 * Filter function, for use by filter(), is() & not()
 */

function filterFn(callback) {
    var to;
    return callback.nodeType === 1 ? function (el) {
        return el === callback;
    } : (to = typeof callback) === 'function' ? function (el, i) {
        return callback.call(el, i);
    } : to === 'string' && callback.length ? function (el) {
        return hAzzle.matches(callback, el);
    } : function () {
        return false;
    };
}


function getBooleanAttrName(element, name) {
    // check dom last since we will most likely fail on name
    var booleanAttr = boolean_attr[name.toLowerCase()];
    // booleanAttr is here twice to minimize DOM access
    return booleanAttr && boolean_elements[element.nodeName] && booleanAttr;
}

function cSFH(html) {
     var scriptEl = doc.createElement('script'),
         matches = html.match(simpleScriptTagRe);
     scriptEl.src = matches[1];
     return scriptEl;
   }



    // Expose hAzzle to the global object

    window['hAzzle'] = hAzzle;

})(window);;  /**
   * An function used to flag environments/features.
   */
  var win = window,
      doc = win.document;

  hAzzle.features = function () {

      var input = doc.createElement("input"),
          select = doc.createElement("select"),
          opt = select.appendChild(doc.createElement("option")),
          checkOn,
          ncc,
          dcl,
          div = doc.createElement('div'),
          fragment = doc.createDocumentFragment(),
          dfdiv = fragment.appendChild(div),
          mehran,
          ccs,
          clsp,
          e = doc.createElement('p'),
          style = e.style;

      checkOn = input.value !== "";

      select.disabled = true;

      input.setAttribute("type", "radio");
      input.setAttribute("checked", "checked");
      input.setAttribute("name", "t");

      div.classList.add('a', 'b');

      dfdiv.appendChild(input);

      mehran = dfdiv.cloneNode(true).cloneNode(true).lastChild.checked;

      // Make sure textarea (and checkbox) defaultValue is properly cloned
      // Support: IE9-IE11+

      dfdiv.innerHTML = "<textarea>x</textarea>";

      ccs = div.style.backgroundClip === "content-box";
      dcl = /(^| )a( |$)/.test(div.className) && /(^| )b( |$)/.test(div.className);
      ncc = !!dfdiv.cloneNode(true).lastChild.defaultValue;
      clsp = !!e.classList;

      // Remove from its parent by default

      if (div.parentNode) {
          div.parentNode.removeChild(div);
      }

      if (dfdiv.parentNode) {
          dfdiv.parentNode.removeChild(dfdiv);
      }

      if (e.parentNode) {
          e.parentNode.removeChild(e);
      }

      // release memory in IE

      div = dfdiv = e = null;

      return {
          clearCloneStyle: ccs,
          checkClone: mehran,
          noCloneChecked: ncc,
          checkOn: checkOn,
          optSelected: opt.selected,
          optDisabled: !opt.disabled,
          radioValue: input.name === "t",

          transform: function () {
              var props = ['transform', 'webkitTransform', 'MozTransform', 'OTransform', 'msTransform'],
                  i;
              for (i = 0; i < props.length; i++) {
                  if (props[i] in style) {

                      return props[i];
                  }
              }
          },
          classList: clsp,
          sMa: dcl
      };

  }();;/*!
 * Selector
 */
var win = window,
    doc = win.document,
    html = window.document.documentElement,

  hAzzle = window.hAzzle, 
    slice = Array.prototype.slice,

    matchesSelector = html.matches ||
    html.webkitMatchesSelector ||
    html.mozMatchesSelector ||
    html.oMatchesSelector ||
    html.msMatchesSelector,

    byTag = 'getElementsByTagName',
    tagName = 'tagName',

    /**
     * RegEx we are using
     */
    rheader = /^h\d$/i,
    rinputs = /^(?:input|select|textarea|button)$/i,
    id = /#([\w\-]+)/,
    clas = /\.[\w\-]+/g,
    idOnly = /^#([\w\-]+)$/,
    tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/,
    splittable = /(^|,)\s*[>~+]/,
    normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g,
    splitters = /[\s\>\+\~]/,
    splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/,
    specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g,
    simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/,
    attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/,
    nthPattern = /\s*((?:\+|\-)?(\d*))n\s*((?:\+|\-)\s*\d+)?\s*/,
    pseudo = /:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/,
    dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g'),
    tokenizr = new RegExp(splitters.source + splittersMore.source),
    chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?'),

    // Attribute selectors

    walker = {
        ' ': function (node) {

            return node && node !== html && node.parentNode;
        },
        '>': function (node, contestant) {

            return node && node.parentNode === contestant.parentNode && node.parentNode;
        },
        '~': function (node) {

            return node && node.previousSibling;
        },
        '+': function (node, contestant, p1, p2) {

            if (!node) {
                return false;
            }
            return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 === p2 && p1;
        }
    };

/** 
 * Temporary caching
 *
 * Mehran!!
 *
 * I liked your observer ideas, and the way you thought about
 * caching. So let us continue with that !!
 *
 */

// Inspiration from Sizzle

function cache() {
    this.c = {};
}
cache.prototype = {
    g: function (k) {
        return this.c[k] || undefined;
    },
    s: function (k, v, r) {
        v = r ? new RegExp(v) : v;
        return (this.c[k] = v);
    }
};

var classCache = new cache(),
    cleanCache = new cache(),
    attrCache = new cache(),
    tokenCache = new cache();

function classRegex(c) {
    return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1);
}


/**
 * Truncate URL
 */

function truncateUrl(url, num) {
    return url
        .replace(/^(?:\w+:\/\/|\/+)/, '')
        .replace(/(?:\/+|\/*#.*?)$/, '')
        .split('/', num)
        .join('/');
}



function flatten(ar) {

    for (var r = [], i = 0, l = ar.length; i < l; ++i) {

        if (hAzzle.arrayLike(ar[i])) {

            r = r.concat(ar[i]);

        } else {

            r[r.length] = ar[i];
        }
    }

    return r;
}

function previous(n) {
    while (n = n.previousSibling) {
        if (n.nodeType === 1) {
            break;
        }
        return n;
    }
}

function q(query) {
    return query.match(chunker);
}

function processRule(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {

    var i, m, k, o, classes;

    if (this.nodeType !== 1) {

        return false;
    }

    if (tag && tag !== '*' && this[tagName] && this[tagName].toLowerCase() !== tag) {

        return false;
    }

    if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) {

        return false;
    }

    if (idsAndClasses && (classes = idsAndClasses.match(clas))) {

        for (i = classes.length; i--;) {

            if (!classRegex(classes[i].slice(1)).test(this.className)) {

                return false;
            }
        }
    }

    // Pseudo

    if (pseudo && hAzzle.pseudos[pseudo] && !hAzzle.pseudos[pseudo](this, pseudoVal)) {

        return false;
    }

    if (wholeAttribute && !value) { // select is just for existance of attrib
        o = this.attributes;
        for (k in o) {
            if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) === attribute) {
                return this;
            }
        }
    }
    if (wholeAttribute && !checkAttr(qualifier, this.getAttribute(attribute) || '', value)) {

        // select is for attrib equality

        return false;
    }

    return this;
}

function clean(s) {
    return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'));
}

function checkAttr(qualify, actual, val) {

    // else if are faster then switch

    if (qualify === '=') {
        return actual === val;
    } else if (qualify === '^=') {
        return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val), 1));
    } else if (qualify === '$=') {
        return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$', 1));
    } else if (qualify === '*=') {
        return actual.match(attrCache.g(val) || attrCache.s(val, clean(val), 1));
    } else if (qualify === '~=') {
        return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)', 1));
    } else if (qualify === '|=') {
        return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^' + clean(val) + '(-|$)', 1));
    }
    return 0;
}


function children(node, ofType) {
    var r = [],
        i,
        l,
        nodes = node.childNodes;

    for (i = 0, l = nodes.length; i < l; i++) {

        if (nodes[i].nodeType === 1 && (!ofType || nodes[i].nodeName === ofType)) {

            r.push(nodes[i]);

        }
    }
    return r;
}


function checkNthExpr(el, nodes, a, b) {
    var i, l;
    if (!a) {
        return (nodes[b - 1] === el);
    }
    for (i = b, l = nodes.length;
        ((a > 0) ? (i <= l) : (i >= 1)); i += a);
    if (el === nodes[i - 1]) {
        return true;
    }
    return false;
}

function checkNth(el, nodes, val) {
    var m;
    if (isFinite(val)) {
        return nodes[val - 1] === el;

    } else if (val === 'odd') {

        return checkNthExpr(el, nodes, 2, 1);

    } else if (val === 'even') {

        return checkNthExpr(el, nodes, 2, 0);

    } else if (m = nthPattern.exec(val)) {

        return checkNthExpr(el, nodes, (m[2] ? parseInt(m[1], 10) : parseInt(m[1] + '1', 10)), // Check case where coefficient is omitted
            (m[3] ? parseInt(m[3].replace(/\s*/, ''), 10) : 0)); // Check case where constant is omitted
    }
}

/**
 * Given a selector, first check for simple cases then collect all base candidate matches and filter
 */

function helper(selector, context) {
    var r = [],
        ret = [],
        i, l, m, token, els, intr, item, ctx = context,
        tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr)),
        dividedTokens = selector.match(dividers);

    if (!tokens.length) {

        return r;
    }

    token = (tokens = tokens.slice(0)).pop(); // copy cached tokens, take the last one

    if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) {

        ctx = byId(context, m[1]);
    }

    if (!ctx) {

        return r;
    }

    intr = q(token);

    // collect base candidates to filter
    els = ctx !== context && ctx.nodeType !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
        function (r) {
            while (ctx = ctx.nextSibling) {

                ctx.nodeType === 1 && (intr[1] ? intr[1] === ctx[tagName].toLowerCase() : 1) && (r[r.length] = ctx);
            }
            return r;
    }([]) :
        ctx[byTag](intr[1] || '*');

    // filter elements according to the right-most part of the selector

    for (i = 0, l = els.length; i < l; i++) {

        if (item = processRule.apply(els[i], intr)) {

            r[r.length] = item;
        }
    }
    if (!tokens.length) {

        return r;
    }

    // filter further according to the rest of the selector (the left side)
    hAzzle.each(r, function (e) {
        if (ancestorMatch(e, tokens, dividedTokens)) {

            ret[ret.length] = e;
        }
    });
    return ret;
}

// compare element to a selector
function is(el, selector, context) {

    if (hAzzle.isNode(selector)) {

        return el === selector;
    }

    if (hAzzle.arrayLike(selector)) {

        return !!~flatten(selector).indexOf(el); // if selector is an array, is el a member?
    }

    var selectors = selector.split(','),

        tokens, dividedTokens;
    while (selector = selectors.pop()) {

        tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr));
        dividedTokens = selector.match(dividers);
        tokens = tokens.slice(0); // copy array

        if (processRule.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, context))) {
            return true;
        }
    }
    return false;
}

// given elements matching the right-most part of a selector, filter out any that don't match the rest
function ancestorMatch(el, tokens, dividedTokens, context) {
    var cand;
    // recursively work backwards through the tokens and up the dom, covering all options

    function crawl(e, i, p) {
        while (p = walker[dividedTokens[i]](p, e)) {
            if (hAzzle.isNode(p) && (processRule.apply(p, q(tokens[i])))) {
                if (i) {
                    if (cand = crawl(p, i - 1, p)) {

                        return cand;
                    }

                } else {

                    return p;
                }
            }
        }
    }
    return (cand = crawl(el, tokens.length - 1, el)) && (!context || hAzzle.contains(cand, context));
}

function byId(context, id, el) {
    return context.nodeType === 9 ? context.getElementById(id) :
        context.ownerDocument &&
        (((el = context.ownerDocument.getElementById(id)) && hAzzle.contains(el, context) && el) ||
            (!hAzzle.contains(context, context.ownerDocument) && hAzzle.select('[id="' + id + '"]', context)[0]));
}


// where the context is not document and a relationship selector is first we have to
// do some awkward adjustments to get it to work, even with qSA

function collectSelector(context, collector) {
    return function (s) {

        var oid, nid;

        if (splittable.test(s)) {

            if (context.nodeType !== 9) {
                // make sure the el has an id, rewrite the query, set context to doc and run it

                if (!(nid = oid = context.getAttribute('id'))) {

                    context.setAttribute('id', nid = '__mehran');
                }

                s = '[id="' + nid + '"]' + s; // avoid byId and allow us to match context element

                collector(context.parentNode || context, s, true);

                oid || context.removeAttribute('id');
            }
            return;
        }
        s.length && collector(context, s, false);
    };
}


hAzzle.extend({

    /**
     * Pseudos.
     *
     * Support CSS2 and CSS3 pseudos.
     * CSS4 pseudos should't be a problem to
     * integrate
     */

    pseudos: {

        "contains": function (el, text) {
            return (el.textContent || el.innerText || hAzzle.getText(el)).indexOf(text) > -1;
        },

        "root": function (elem) {
            return elem === html;
        },

        "not": function (el, val) {

            return !is(el, val);
        },

        "focus": function (el) {
            return el === doc.activeElement && (!doc.hasFocus || doc.hasFocus()) && !!(el.type || el.href || ~el.tabIndex);
        },

        'nth-child': function (el, val) {
            var p;
            if (!val || !(p = el.parentNode)) {

                return false;

            }

            return checkNth(el, children(p), val);

        },

        'nth-last-child': function (el, val) {
            var p;
            if (!val || !(p = el.parentNode)) {
                return false;
            }

            return checkNth(el, children(p).reverse(), val);
        },

        'nth-of-type': function (el, val) {
            var p;
            if (!val || !(p = el.parentNode)) {

                return false;

            }

            return checkNth(el, children(p, el.nodeName), val);
        },

        'nth-last-of-type': function (el, val) {
            var p;
            if (!val || !(p = el.parentNode)) {

                return false;
            }

            return checkNth(el, children(p, el.nodeName).reverse(), val);
        },

        'first-child': function (el) {

            return hAzzle.pseudos['nth-child'](el, 1);
        },

        'last-child': function (el) {
            return hAzzle.pseudos['nth-last-child'](el, 1);
        },

        'first-of-type': function (el) {
            return hAzzle.pseudos['nth-of-type'](el, 1);
        },

        'last-of-type': function (el) {
            return hAzzle.pseudos['nth-last-of-type'](el, 1);
        },

        'only-child': function (el) {
            var p, nodes;
            return (p = el.parentNode) && (nodes = children(p)) && (nodes.length === 1) && (el === nodes[0]);

        },

        'only-of-type': function (el) {
            var p, nodes;
            return (p = el.parentNode) && (nodes = children(p, el.nodeName)) && (nodes.length === 1) && (el === nodes[0]);

        },

        "dir": function (el, val) {
            while (el) {
                if (el.dir) {
                    return el.dir === val;
                }
                el = el.parentNode;
            }
            return false;
        },

        "with": function (el, val) {
            return hAzzle(val, [el]).length > 0;
        },
        "without": function (el, val) {
            return hAzzle(val, [el]).length === 0;
        },

        "checked": function (el) {
            // In CSS3, :checked should return both checked and selected elements
            // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
            var nodeName = el.nodeName.toLowerCase();
            return (nodeName === "input" && !!el.checked) || (nodeName === "option" && !!el.selected);
        },

        "selected": function (el) {
            // Accessing this property makes selected-by-default
            // options in Safari work properly
            if (el.parentNode) {
                el.parentNode.selectedIndex;
            }

            return el.selected === true;
        },

        "enabled": function (el) {
            return !el.disabled;
        },

        "disabled": function (el) {
            return el.disabled;
        },

        "empty": function (el) {
            // http://www.w3.org/TR/selectors/#empty-pseudo
            // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
            //   but not by others (comment: 8; processing instruction: 7; etc.)
            // nodeType < 6 works because attributes (2) do not appear as children
            for (el = el.firstChild; el; el = el.nextSibling) {
                if (el.nodeType < 6) {
                    return false;
                }
            }
            return true;
        },

        "parent": function (el) {
            return !hAzzle.pseudos["empty"](el);
        },

        // Element/input types
        "header": function (el) {
            return rheader.test(el.nodeName);
        },

        "input": function (el) {
            return rinputs.test(el.nodeName);
        },
        "button": function (el) {
            var name = el.nodeName.toLowerCase();
            return name === "input" && el.type === "button" || name === "button";
        },

        "text": function (el) {
            var attr;
            return el.nodeName.toLowerCase() === "input" &&
                el.type === "text" &&
                ((attr = el.getAttribute("type")) === null || attr.toLowerCase() === "text");
        },
        // Miscellaneous
        "target": function (el) {
            var hash = win.location && win.location.hash;
            return hash && hash.slice(1) === el.id;
        },
        // W3C  E:visited - an E element being the source anchor of a hyperlink of which the target is not yet visited (:link) or already 
        "visited": function (el) {
            return el.nodeName.toLowerCase() === "a" && el.href && el.visited;
        },
        // W3C  E:active - an E element during certain user actions
        "active": function (el) {
            return el === el.activeElement;
        },
        // W3C  E:hover - an E element during certain user actions
        "hover": function (el) {
            return el === el.hoverElement;
        },

    },
    /**
     * A handfull CSS4 selectors
     *
     * TODO!! Add more when we know more about the future
     *
     */

    'indeterminate': function (el) {
        return !hAzzle.pseudos['checked'](el);
    },

    "links-here": function (el) {
        return el + '' === win.location + '';
    },

    "any-link": function (el) {
        return typeof el.href === 'string';
    },

    "default": function (el) {
        return !!el.defaultSelected;
    },
    "valid": function (el) {
        return el.willValidate || (el.validity && el.validity.valid);
    },
    "invalid": function (el) {
        return !hAzzle.pseudos['valid'](el);
    },
    "in-range": function (el) {
        return el.value > el.min && el.value <= el.max;
    },
    "out-of-range": function (el) {
        return !pseudo['in-range'](el);
    },
    "required": function (el) {
        return !!el.required;
    },
    "optional": function (el) {
        return !el.required;
    },
    "read-only": function (el) {
        if (el.readOnly) {
		return true;
		}

        var attr = el.getAttribute('contenteditable'),
            prop = el.contentEditable,
            name = el.nodeName.toLowerCase();

        name = name !== 'input' && name !== 'textarea';

        return (name || el.disabled) && attr === null && prop !== 'true';
    },
    "read-write": function (el) {
        return !hAzzle.pseudos['read-only'](el);
    },

    "local-link": function (el) {

        if (!el.href) {
			return false;
         }
        var href = el.href.replace(/#.*?$/, '');

        if (el.nodeName) {
            return href && el.host === win.location.host;
        }
        var param = +el + 1;
        return function (el) {

            var url = win.location + '',
                href = el + '';

            return truncateUrl(url, param) === truncateUrl(href, param);
        };
    },


    matches: function (selector, context) {

        return selector === '*' || matchesSelector.call(context, selector);
    },

    /**
     * Find elements by selectors.
     *
     * Some of the supported selectors:
     * - #foo
     * - .foo
     * - div (tagname)
     * - p, a (comma separated selectors)
     * - a[href]
     * - a[href=name]
     * - a[href^=he]
     * - a[lang|=en]
     * - a[href~=te]
     * - a[href$=.com]
     * - a[href*=hAzzle]
     * - #foo a
     * - ul#list > li (direct children)
     * - :nth-child (pseudo)
     * - :nth-last-child
     * - :nth-of-type
     * - :nth-last-of-type
     * - :first-child
     * - :last-child
     * - :first-of-type
     * - :last-of-type
     * - :only-child
     * - :last-of-type
     * - :only-of-type
     * - :odd
     * - :even
     * - :first
     * - :last
     * - span ~ strong
     * - div > p
     * - div < p
     * - p + p
     * - p ~ p
     * - #foo.bar.baz
     * - div#foo.test a[-data-info*="hello world"] span + strong
     * - #foo[title$='jhonsen']
     * - focus
     * - selected
     * - enabled
     * - disabled
     * - checked
     * - root
     * - target
     * - button
     * - parent
     * - header
     * - visited
     * - active
     * - hover
     * - not
     * - empty
     * - contain(text)
     * - local-link
     * - local-link(0)
     * - links-here
     * - any-link
     * - lang()
     * - default
     * - has
     * - valid
     * - without
     * - in-range
     * - out-of-range
     * - required
     * - optional
     * - read-only
     * - indeterminate
     *
     * @param {String} sel
     * @param {Object} ctx
     * @param {Object} noCache

     * @param {Object} loop
     * @param {Object} nthrun
     *
	 */

    select: function (selector, context, results, seed) {

        var bool, // Boolean for filter function
            elem, m, nodeType,
            i = 0,
            items,
            l,
            r,
            ss;

        results = results || [];
        context = context || doc;

        // Early return if context is not an element or document

        if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
            return [];
        }

        if (!seed) {

            // Shortcuts

            if ((match = /^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/.exec(selector))) {

                // #id
                if ((m = match[1])) {

                    elem = context.getElementById(m);

                    if (elem && elem.parentNode) {

                        if (elem.id === m) {
                            results.push(elem);
                            return results;
                        }
                    } else {
                        return results;
                    }

                    // .class	

                } else if ((m = match[2])) {

                    push.apply(results, context.getElementsByClassName(m));
                    return results;

                    // tag

                } else if ((m = match[3])) {

                    push.apply(results, context.getElementsByTagName(selector));
                    return results;
                }
            }
        }

        // Seed		

        if (seed) {

            while ((elem = seed[i++])) {

                bool = matchesSelector.call(elem, selector);

                if (bool) {
                    results.push(elem);
                }
            }
            return slice.call(results);
        }

        /**
         *  Everything else happend down here. This is for attributes,
         * pseudos, special selectors and comma splitted selectors
         */

        // Normalize the selector

        selector = selector.replace(normalizr, '$1');

        // Tag and / or class

        if (m = selector.match(tagAndOrClass)) {

            r = classRegex(m[2]);

            items = context[byTag](m[1] || '*');

            for (i = 0, l = items.length; i < l; i++) {

                if (r.test(items[i].className)) {

                    results[results.length] = items[i];
                }
            }
            return results;
        }

        // Split by comma
        // Note!! Never split inside an loop - bad performance

        ss = selector.split(',');

        hAzzle.each(ss, collectSelector(context, function (ctx, s, rewrite) {

            r = helper(s, ctx);

            for (i = 0, l = r.length; i < l; i++) {

                if (ctx.nodeType === 9 || rewrite || hAzzle.contains(r[i], context)) {

                    results[results.length] = r[i];
                }
            }
        }));

        // Make unique array if more then 1 element inthe array

        if (ss.length > 1 && results.length > 1) {

            return hAzzle.unique(results);

        } else {

            return results;
        }
    }

}, hAzzle);;/*!
 * DOM traversing
 */
var Ap = [],
    slice = Ap.slice,
    reverse = Ap.reverse,
    push = Ap.push;

/**
 * DOM traversing helper. Used with prevUntil, nextUntil,
 * prevAll, nextAll, and parentUntil
 */

function dir(elem, direction, until) {
    var matched = [],
        truncate = typeof until !== "undefined";
    while ((elem = elem[direction]) && elem.nodeType !== 9) {
        if (elem.nodeType === 1) {
            if (truncate && hAzzle(elem).is(until)) {
                break;
            }
            matched.push(elem);
        }
    }
    return matched;
}

/*
 * Collect elements
 */

function collect(el, fn) {
    var ret = [],
        res, i = 0,
        j, l = el.length,
        l2;
    while (i < l) {
        j = 0;
        l2 = (res = fn(el[i], i++)).length;
        while (j < l2) {
            ret.push(res[j++]);
        }
    }
    return ret;
}

/**
 * Traverse multiple DOM elements
 */

function findIndex(selector, index) {
    return index = typeof selector === "undefined" && typeof index !== "number" ? 0 :
        typeof selector === "number" ? selector :
        typeof index === "number" ? index :
        null;
}

function traverse(el, property, selector, index, expression) {

    index = findIndex(selector, index);

    return collect(el, function (el, elind) {

        var i = index || 0,
            isString = typeof selector === "string" ? selector : '*',
            ret = [];

        if (!expression) {

            el = el[property];
        }

        while (el && (index === null || i >= 0)) {

            if (el.nodeType === 1 && (!expression || expression === true || filterFn(el, elind)) && hAzzle.matches(isString, el) && (index === null || i-- === 0)) {

                if (index === null && property !== 'nextSibling' && property !== 'parentNode') {

                    ret.unshift(el);

                } else {

                    ret.push(el);
                }
            }

            el = el[property];
        }

        return ret;
    });
}

/**
 * Given an index & length, return a 'fixed' index, fixes non-numbers & neative indexes
 */

function eqIndex(length, index, def) {

     if (index < 0)
          index = length + index
        if (index < 0 || index >= length)
          return null
        return !index && index !== 0 ? def : index
}

/**
 * Filter function, for use by filter(), is() & not()
 */

function filterFn(callback) {
    var to;
    return callback.nodeType === 1 ? function (el) {
        return el === callback;
    } : (to = typeof callback) === 'function' ? function (el, i) {
        return callback.call(el, i);
    } : to === 'string' && callback.length ? function (el) {
        return hAzzle.matches(callback, el);
    } : function () {
        return false;
    };
}


// Extend hAzzle

hAzzle.extend({

    /**
     * Find the first matched element by css selector
     *
     * @param {String|Object} selector
     * @return {Object}
     *
     */

    find: function (selector) {
        var i,
            len = this.length,
            ret = [],
            self = this;

        // String

        if (typeof selector === "string") {

            for (i = 0; i < len; i++) {
                hAzzle.select(selector, self[i], ret);
            }

            return hAzzle(ret);

        } else { // Object
            return hAzzle(selector).filter(function () {
                for (i = 0; i < len; i++) {
                    if (hAzzle.contains(self[i], this)) {
                        return true;
                    }
                }
            });
        }
    },


    /** Determine the position of an element within the matched set of elements
     *
     * @param {string} elem
     * @param {return} Object
     */

    index: function (element) {

        if (element) {

            return this.indexOf(hAzzle(element)[0]);

        } else {

            return this.parent().children().indexOf(this[0]) || -1;

        }
    },

    adjacent: function (selector) {
        var expressions = slice.call(arguments, 1).join(', '),
            siblings = this.siblings(selector),
            results = [],
            i = 0,
            sibling;

        for (; sibling = siblings[i]; i++) {
            if (hAzzle.select(sibling, null, null, expressions)) {
                results.push(sibling);
            }
        }

        return hAzzle(results);
    },


    /**
     * Returns element's first descendant (or the Nth descendant, if index is specified)
     * that matches expression.
     */

    down: function (selector, index) {

        index = findIndex(selector, index);

        return hAzzle(collect(this, function (el) {
            var f = hAzzle.select(typeof selector === "string" ? selector : '*', el);

            if (index === null) {

                return f;

            } else {

                return [f[index]] || [];

            }
        }));
    },

    /**
     * Returns element's first ancestor (or the Nth ancestor, if index is specified)
     * that matches expression
     */

    up: function (selector, index) {
        return hAzzle(traverse(this, 'parentNode', selector, index));
    },

    /**
     * Get immediate parents of each element in the collection.
     * If CSS selector is given, filter results to include only ones matching the selector.
     *
     * @param {String} selector
     * @return {hAzzle}
     */

    parent: function (selector) {

        var matched = hAzzle.map(this, function (elem) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null;
        });

        if (selector && typeof selector === "string") {
            matched = hAzzle.select(selector, null, null, matched);
        }
        return hAzzle(matched);
    },

    parents: function () {
        return this.up.apply(this, arguments.length ? arguments : ['*']);
    },

    parentsUntil: function (until, selector) {

        var matched = hAzzle.map(this, function (elem, i, until) {
            return dir(elem, "parentNode", until);
        }, until);


        if (selector && typeof selector === "string") {
            matched = hAzzle.select(selector, null, null, matched);
        }

        return hAzzle(matched);
    },

    /**
     * Get the element that matches the selector, beginning at the current element and progressing up through the DOM tree.
     * OR the closest Nth elements if index is specified
     *
     * @param {String} selector
     * @param {Number} index
     * @return {hAzzle}
     */

    closest: function (selector, index) {
        if (typeof selector === "number") {
            index = selector;
            selector = '*';
        } else if (typeof index !== "number") {
            index = 0;
        }
        return hAzzle(traverse(this, 'parentNode', selector, index, true));
    },

    /**
     * Get the immediately preceding sibling of each element
     * OR Nth preceding siblings of each element, if index is specified
     *
     * @param {String} selector
     * @param {Number} index
     * @return {hAzzle}
     */

    prev: function (selector, index) {
        return hAzzle(traverse(this, 'previousSibling', selector, index));

    },

    prevAll: function () {
        return hAzzle(hAzzle.map(this, function (elem) {
            return dir(elem, "nextSibling");
        }));
    },

    prevUntil: function (until, selector) {

        var matched = hAzzle.map(this, function (elem, i, until) {
            return dir(elem, "previousSibling", until);
        }, until);


        if (selector && typeof selector === "string") {
            matched = hAzzle.select(selector, null, null, matched);
        }

        return hAzzle(matched);

    },

    /**
     * Get the immediately following sibling of each element
     * OR Nth following siblings of each element, if index is specified
     *
     * @param {String} selector
     * @param {Number} index
     * @return {hAzzle}
     */

    next: function (selector, index) {
        return hAzzle(traverse(this, 'nextSibling', selector, index));

    },

    nextAll: function () {
        return hAzzle(hAzzle.map(this, function (elem) {
            return dir(elem, "nextSibling");
        }));
    },

    nextUntil: function (until, selector) {
        var matched = hAzzle.map(this, function (elem, i, until) {
            return dir(elem, "nextSibling", until);
        }, until);

        if (selector && typeof selector === "string") {
            matched = hAzzle.select(selector, null, null, matched);
        }

        return hAzzle(matched);
    },

    /**
     * Returns everything but the first entry of the array
     */

    tail: function (index) {
        return this.slice(index === null ? 1 : index);
    },

    /**
     * Return an sequense of elements from the 'elems stack', plucked
     * by the given numbers
     *
     * Example:
     *
     * hAzzle('p').collection([1,6, 9])
     *
     * Outputs elem 1,6, 9 from the stack
     *
     * @param {array} count
     * @return {object}
     *
     */

    collection: function (count) {

        if (!hAzzle.isArray(count)) {
            return [];
        }

        var holder = [],
            i = count.length;
        while (i--) {
            holder.push(this[count[i]]);
        }

        return hAzzle(holder) || this;
    },
    /**
     * Collects all of element's siblings and returns them as an Array of elements
     * OR collect Nth siblings, if index is specified
     *
     * @param {String} selector
     * @param {Number} index
     * @return {hAzzle}
     */

    siblings: function (selector, index) {
        var self = this,
            arr = slice.call(this, 0),
            i = 0,
            l = arr.length;

        for (; i < l; i++) {
            arr[i] = arr[i].parentNode.firstChild;
            while (arr[i].nodeType !== 1) {
                arr[i] = arr[i].nextSibling;
            }
        }

        return hAzzle(traverse(arr, 'nextSibling', selector || '*', index, function (el, i) {
            return el !== self[i];
        }));
    },

    /**
     * Get the children of each element in the set of matched elements, optionally filtered by a selector.
     * OR Nth children of each element, if index is specified
     *
     * @param {String} selector
     * @param {Number} index
     * @return {hAzzle}
     */

    children: function (selector, index) {
        return hAzzle(traverse(this.down.call(this), 'nextSibling', selector || '*', index, true));
    },

    /**
     * Reduce the set of matched elements to the first in the set,
     * OR to the first Nth elements, if index is specified
     *
     * @param {Number} index
     * @return {hAzzle}
     */

    first: function (index) {
        return index ? this.slice(0, index) : this.eq.call(this, 0);
    },

    /**
     * Reduce the set of matched elements to the final one in the set,
     * OR to the last Nth elements, if index is specified
     *
     * @param {Number} index
     * @return {hAzzle}
     */

    last: function (index) {
        return index ? this.slice(this.length - index) : this.eq.call(this, -1);
    },

    /**
     * Reduce the set of matched elements to the one at the specified index.
     * @param {number} index
     * @return {hAzzle}
     */

    eq: function (index) {
        return hAzzle(this.get(index));

    },

    /**
     * @param {number} index
     * @return {Element|Node}
     */

    get: function (index) {
        return index ? hAzzle(this[eqIndex(this.length, index, 0)]) : this;
    },

    // a crazy man wrote this, don't try to understand it, see the tests

    slice: function (start, end) {
        var e = end,
            l = this.length,
            arr = [];
        start = eqIndex(l, Math.max(-this.length, start), 0);
        e = eqIndex(end < 0 ? l : l + 1, end, l);
        end = e === null || e > l ? end < 0 ? 0 : l : e;

        while (start !== null && start < end) {

            arr.push(this[start++]);
        }

        return hAzzle(arr);
    },

    filter: function (callback) {
        return hAzzle(hAzzle.filter(this, filterFn(callback)));
    },

    /**
     * Remove elements from the set of matched elements.
     *
     * @param {String} selector
     * @return {hAzzle}
     *
     */

    not: function (selector) {
        return hAzzle(hAzzle.filter(this, function () {
            return !filterFn(selector).apply(this, arguments);
        }));
    },

    /**
     * Reduce the set of matched elements to those that have a descendant that matches the selector or DOM element.
     */

    has: function (selector) {
        return hAzzle(hAzzle.filter(
            this, selector.nodeType === 1 ? function (el) {
                return hAzzle.contains(selector, el);
            } : typeof selector === 'string' && selector.length ? function (el) {
                return hAzzle.matches(selector, el).length;
            } : function () {
                return false;
            }
        ));
    },

    /**
     * Check if the first element in the element collection matches the selector
     * Some people asked about this, so note that this function only return
     * a boolean so quick-return after first successful find.
     * And are different from jQuery / Zepto is().
     *
     * @param {String} selector
     * @return {Boolean}
     */

    is: function (selector) {

        var i = 0,
            l = this.length,
            fn = filterFn(selector);

        for (; i < l; i++) {
            if (fn(this[i], i)) {
                return true;
            }
        }
        return false;
    },

    /**
     * Adds one element to the set of matched elements.
     *
     * @param {String} selector
     * @param {String} context
     * @return {hAzzle}
     */

    add: function (selector, context) {
        this.push(hAzzle(selector, context)[0]);
        return this;
    },

    toArray: function () {
        return Ap.slice.call(this);
    },

    size: function () {
        return this.length;
    },

    // Internal usage only

    push: Ap.push,
    sort: Ap.sort,
    splice: Ap.splice,
    reverse: Ap.reverse,
    concat: Ap.concat,
    indexOf: Ap.indexOf
});;/*!
 * CSS
 */
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source,
    rrelNum = new RegExp("^([+-])=(" + pnum + ")", "i"),

    win = window,
    doc = win.document,
    docbody = document.body,
    html = doc.documentElement,
    px = 'px',
    elemdisplay = {},

    props = ["backgroundColor",
        "borderBottomColor",
        "borderLeftColor",
        "borderRightColor",
        "borderTopColor",
        "borderColor",
        "boxShadowColor",
        "color",
        "textShadowColor",
        "columnRuleColor",
        "outlineColor",
        "textDecorationColor",
        "textEmphasisColor"
    ],

    unitless = {
        lineHeight: 1,
        zoom: 1,
        zIndex: 1,
        opacity: 1,
        boxFlex: 1,
        WebkitBoxFlex: 1,
        MozBoxFlex: 1,
        columns: 1,
        fontWeight: 1,
    },

    // Placeholder for color functions

    colorHook = {};

function getStyle(el, property) {
    var value = null,
        computed = doc.defaultView.getComputedStyle(el, null);

    if (computed) {

        value = computed.getPropertyValue(property) || computed[property];

        if (value === "" && !hAzzle.contains(el.ownerDocument, el)) {
            value = el.style[property];
        }
    }
    return el.style[value] || value;
}


function actualDisplay(name, doc) {

    var style,
        display,
        elem = doc.createElement(name);
    // Vanila solution is the best choice here

    docbody.appendChild(elem);

    display = win.getDefaultComputedStyle && (style = win.getDefaultComputedStyle(elem[0])) ? style.display : getStyle(elem[0], "display");
    docbody.removeChild(elem);
    return display;
}


// Try to determine the default display value of an element
function defaultDisplay(nodeName) {

    var display = elemdisplay[nodeName];

    if (!display) {
        display = actualDisplay(nodeName, doc);

        // If the simple way fails, read from inside an iframe
        if (display === "none" || !display) {

            // Use the already-created iframe if possible

            var iframe = iframe || doc.documentElement.appendChild("<iframe frameborder='0' width='0' height='0'/>");

            // Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
            doc = iframe[0].contentDocument;

            // Support: IE
            doc.write();
            doc.close();

            display = actualDisplay(nodeName, doc);

            doc.documentElement.removeChild(iframe);
        }

        // Store the correct default display
        elemdisplay[nodeName] = display;
    }

    return display;
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
 *
 *
 * FIXME!! Need a lot of tests and fixes to work correctly everywhere
 *
 */

function show(elem) {

    var style = elem.style;

    if (style.display === "none") {

        style.display = "";
    }

    if ((style.display === "" && getStyle(elem, "display") === "none") || !hAzzle.contains(elem.ownerDocument.documentElement, elem)) {
        hAzzle.data(elem, 'display', defaultDisplay(elem.nodeName));
    }
}

/**
 * Hide an element
 *
 * @param {Object} elem
 * @return Object}
 */

function hide(elem) {
    if (!isHidden(elem)) {
        var display = getStyle(elem, 'display');
        if (display !== 'none') {
            hAzzle.data(elem, 'display', display);
        }

        // Hide the element

        elem.style.display = "none";
    }
}

/**
 * @param {string} p
 * @return {string}
 */

function styleProperty(p) {
    (p === 'transform' && (p = hAzzle.features.transform)) ||
        (/^transform-?[Oo]rigin$/.test(p) && (p = hAzzle.features.transform + 'Origin'));
    return p ? hAzzle.camelize(p) : null;
}




hAzzle.extend({

    /**
     * Set / get CSS style
     *
     * @param {Object|string} property
     * @param {string} value
     * @return {hAzzle|string}
     */

    css: function (property, value) {
        var p, iter = property,
            color,
            type,
            k,
            ret;

        // is this a request for just getting a style?
        if (value === undefined && typeof property === 'string') {

            value = this[0];

            if (!value) {

                return null;
            }

            // Short-cuts for document and window size

            if (value === doc || value === win) {

                p = (value === doc) ? docu() : viewport();

                return property === 'width' ? p.width : property === 'height' ? p.height : '';
            }
            return (property = styleProperty(property)) ? getStyle(value, property) : null;
        }

        if (typeof property === 'string') {
            iter = {};
            iter[property] = value;
        }

        function fn(el, p, v) {

            for (k in iter) {

                if (iter.hasOwnProperty(k)) {

                    v = iter[k];
                    type = typeof v;
                    // convert relative number strings

                    if (typeof value === "string" && (ret = rrelNum.exec(value))) {
                        v = (ret[1] + 1) * ret[2] + parseFloat(getStyle(el, k));
                        type = "number";
                    }

                    // Make sure that null and NaN values aren't set.

                    if (v === null || v !== v) {

                        return;
                    }

                    if (!hAzzle.features.clearCloneStyle && value === "" && name.indexOf("background") === 0) {

                        el.style[hAzzle.camelize(k)] = "inherit";
                    }

                    // If a number was passed in, add 'px' to the (except for certain CSS properties)

                    if (type === "number" && !unitless[p]) {

                        v += "px";
                    }

                    // Camelize the name

                    p = styleProperty(k);

                    // Translate all colors to RGB...

                    if (typeof (color = colorHook[k]) === 'function') {

                        return color(el, v);
                    }

                    el.style[p] = hAzzle.setter(el, v);
                }
            }
        }

        return this.each(fn);
    },

    /**
     * @param {number=} x
     * @param {number=} y
     * @return {hAzzle|number}
     */

    offset: function (x, y) {
        if (x && typeof x === 'object' && (typeof x.top === 'number' || typeof x.left === 'number')) {
            return this.each(function (el) {
                xy(el, x.left, x.top);
            });
        } else if (typeof x === 'number' || typeof y === 'number') {
            return this.each(function (el) {
                xy(el, x, y);
            });
        }
        if (!this[0]) {

            return {
                top: 0,
                left: 0,
                height: 0,
                width: 0
            };
        }
        var el = this[0],
            clientTop = html.clientTop,
            clientLeft = html.clientLeft,
            _win = hAzzle.isWindow(doc) ? doc : doc.nodeType === 9 && doc.defaultView,
            scrollTop = _win.pageYOffset || html.scrollTop,
            scrollLeft = _win.pageXOffset || html.scrollLeft,
            bcr = {
                top: 0,
                left: 0
            };

        if (typeof el.getBoundingClientRect !== typeof undefined) {

            bcr = el.getBoundingClientRect();
        }

        return {
            top: bcr.top + scrollTop - clientTop,
            left: bcr.left + scrollLeft - clientLeft,
            right: bcr.right + scrollLeft - clientLeft,
            bottom: bcr.bottom + scrollTop - clientTop,
            height: bcr.bottom - bcr.top,
            width: bcr.right - bcr.left
        };
    },

    width: function (value) {

        var orig, ret, elem = this[0];

        if (hAzzle.isWindow(elem)) {
            return elem.document.documentElement["clientWidth"];
        }

        // Get document width or height
        if (elem.nodeType === 9) {
            return Math.max(
                elem.documentElement.clientWidth,
                elem.body.scrollWidth, elem.documentElement.scrollWidth,
                elem.body.clientWidth, elem.documentElement.clientWidth);
        }

        // Get width or height on the element
        if (value === undefined) {
            orig = getStyle(elem, 'width');
            ret = parseFloat(orig);
            return hAzzle.IsNaN(ret) ? ret : orig;
        }

        // Set the width or height on the element

        hAzzle(elem).css('width', value);

    },

    height: function (value) {

        var orig, ret, elem = this[0];

        if (hAzzle.isWindow(elem)) {
            return elem.document.documentElement["clientHeight"];
        }

        // Get document width or height
        if (elem.nodeType === 9) {
            return Math.max(
                elem.documentElement.clientHeight,
                elem.body.scrollHeight, elem.documentElement.scrollHeight,
                elem.body.clientHeight, elem.documentElement.clientHeight);
        }

        // Get width or height on the element
        if (value === undefined) {
            orig = getStyle(elem, 'height');
            ret = parseFloat(orig);
            return hAzzle.IsNaN(ret) ? ret : orig;
        }

        // Set the width or height on the element

        hAzzle(elem).css('height', value);
    },

    /**
     * @param {number} y
     */

    scrollTop: function (val) {

        var elem = this[0],
            win = hAzzle.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;

        if (typeof val === 'undefined') {

            return val ? val.pageYOffset : elem.scrollTop;
        }
        if (win) {
            win.scrollTo(window.scrollTop);
        } else {
            elem.scrollTop = val;
        }
    },

    /**
     * @param {number} val
     */

    scrollLeft: function (val) {
        var elem = this[0],
            win = hAzzle.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;

        if (typeof val === 'undefined') {

            return val ? val.pageXOffset : elem.scrollLeft;
        }

        if (win) {

            win.scrollTo(window.scrollLeft);

        } else {

            elem.scrollLeft = val;
        }
    },

    offsetParent: function () {
        return hAzzle(this.map(function (el) {
            var op = el.offsetParent || doc.documentElement;
            while (op && (!hAzzle.nodeName(op, "html") && getStyle(op, "position") === "static")) {
                op = op.offsetParent || doc.documentElement;
            }
            return op;
        }));
    },

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

        var elem;

        if (typeof state === "boolean") {
            return state ? this.show() : this.hide();
        }

        return this.each(function () {
            elem = this;

            if (isHidden(elem)) {
                show(elem);
            } else {
                hide(elem);

            }
        });
    }
});


// Let us extend the hAzzle Object a litle ...

hAzzle.extend({


    /**
     * hAzzle color names
     *
     * NOTE!! Only the most used RGB colors are listed, if you need more, you have to
     * create a plug-in for it.
     *
     */

    colornames: {
        aliceblue: {
            r: 240,
            g: 248,
            b: 255
        },
        antiquewhite: {
            r: 250,
            g: 235,
            b: 215
        },
        aqua: {
            r: 0,
            g: 255,
            b: 255
        },
        aquamarine: {
            r: 127,
            g: 255,
            b: 212
        },
        azure: {
            r: 240,
            g: 255,
            b: 255
        },
        beige: {
            r: 245,
            g: 245,
            b: 220
        },
        bisque: {
            r: 255,
            g: 228,
            b: 196
        },
        black: {
            r: 0,
            g: 0,
            b: 0
        },
        blue: {
            r: 0,
            g: 0,
            b: 255
        },
        blueviolet: {
            r: 138,
            g: 43,
            b: 226
        },
        brown: {
            r: 165,
            g: 42,
            b: 42
        },
        burlywood: {
            r: 222,
            g: 184,
            b: 135
        },
        cadetblue: {
            r: 95,
            g: 158,
            b: 160
        },
        coral: {
            r: 255,
            g: 127,
            b: 80
        },
        crimson: {
            r: 220,
            g: 20,
            b: 60
        },
        cyan: {
            r: 0,
            g: 255,
            b: 255
        },
        darkblue: {
            r: 0,
            g: 0,
            b: 139
        },
        darkcyan: {
            r: 0,
            g: 139,
            b: 139
        },
        darkgray: {
            r: 169,
            g: 169,
            b: 169
        },
        darkgreen: {
            r: 0,
            g: 100,
            b: 0
        },
        darkgrey: {
            r: 169,
            g: 169,
            b: 169
        },
        darkmagenta: {
            r: 139,
            g: 0,
            b: 139
        },
        darkolivegreen: {
            r: 85,
            g: 107,
            b: 47
        },
        darkred: {
            r: 139,
            g: 0,
            b: 0
        },
        darksalmon: {
            r: 233,
            g: 150,
            b: 122
        },
        darkseagreen: {
            r: 143,
            g: 188,
            b: 143
        },
        darkviolet: {
            r: 148,
            g: 0,
            b: 211
        },

        gold: {
            r: 255,
            g: 215,
            b: 0
        },
        goldenrod: {
            r: 218,
            g: 165,
            b: 32
        },
        green: {
            r: 0,
            g: 128,
            b: 0
        },
        greenyellow: {
            r: 173,
            g: 255,
            b: 47
        },
        grey: {
            r: 128,
            g: 128,
            b: 128
        },
        indianred: {
            r: 205,
            g: 92,
            b: 92
        },
        indigo: {
            r: 75,
            g: 0,
            b: 130
        },
        ivory: {
            r: 255,
            g: 255,
            b: 240
        },
        lavender: {
            r: 230,
            g: 230,
            b: 250
        },
        lightblue: {
            r: 173,
            g: 216,
            b: 230
        },
        lightcoral: {
            r: 240,
            g: 128,
            b: 128
        },
        lightcyan: {
            r: 224,
            g: 255,
            b: 255
        },
        lightgray: {
            r: 211,
            g: 211,
            b: 211
        },
        lightgreen: {
            r: 144,
            g: 238,
            b: 144
        },
        lightgrey: {
            r: 211,
            g: 211,
            b: 211
        },
        lightpink: {
            r: 255,
            g: 182,
            b: 193
        },
        lightyellow: {
            r: 255,
            g: 255,
            b: 224
        },
        lime: {
            r: 0,
            g: 255,
            b: 0
        },
        limegreen: {
            r: 50,
            g: 205,
            b: 50
        },
        linen: {
            r: 250,
            g: 240,
            b: 230
        },
        magenta: {
            r: 255,
            g: 0,
            b: 255
        },
        maroon: {
            r: 128,
            g: 0,
            b: 0
        },
        midnightblue: {
            r: 25,
            g: 25,
            b: 112
        },
        moccasin: {
            r: 255,
            g: 228,
            b: 181
        },
        olive: {
            r: 128,
            g: 128,
            b: 0
        },
        olivedrab: {
            r: 107,
            g: 142,
            b: 35
        },
        orange: {
            r: 255,
            g: 165,
            b: 0
        },
        orangered: {
            r: 255,
            g: 69,
            b: 0
        },
        orchid: {
            r: 218,
            g: 112,
            b: 214
        },
        peru: {
            r: 205,
            g: 133,
            b: 63
        },
        pink: {
            r: 255,
            g: 192,
            b: 203
        },
        plum: {
            r: 221,
            g: 160,
            b: 221
        },
        purple: {
            r: 128,
            g: 0,
            b: 128
        },
        red: {
            r: 255,
            g: 0,
            b: 0
        },
        salmon: {
            r: 250,
            g: 128,
            b: 114
        },
        sandybrown: {
            r: 244,
            g: 164,
            b: 96
        },
        sienna: {
            r: 160,
            g: 82,
            b: 45
        },
        silver: {
            r: 192,
            g: 192,
            b: 192
        },
        skyblue: {
            r: 135,
            g: 206,
            b: 235
        },
        snow: {
            r: 255,
            g: 250,
            b: 250
        },
        tomato: {
            r: 255,
            g: 99,
            b: 71
        },
        turquoise: {
            r: 64,
            g: 224,
            b: 208
        },
        violet: {
            r: 238,
            g: 130,
            b: 238
        },
        wheat: {
            r: 245,
            g: 222,
            b: 179
        },
        white: {
            r: 255,
            g: 255,
            b: 255
        },
        whitesmoke: {
            r: 245,
            g: 245,
            b: 245
        },
        yellow: {
            r: 255,
            g: 255,
            b: 0
        },
        yellowgreen: {
            r: 154,
            g: 205,
            b: 50
        },
        transparent: {
            r: -1,
            g: -1,
            b: -1
        }
    },

    color: {
        normalize: function (input) {

            /**
             * 'alpha' are used. See line  904, 914 and some other lines.
             * Not sure what jsHint are thinking with
             */

            var color, alpha,
                result, name, i, l,
                rhex = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
                rhexshort = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,
                rrgb = /rgb(?:a)?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(0*\.?\d+)\s*)?\)/,
                rrgbpercent = /rgb(?:a)?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(0*\.?\d+)\s*)?\)/,
                rhsl = /hsl(?:a)?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(0*\.?\d+)\s*)?\)/;

            // Handle color: #rrggbb
            if (result = rhex.exec(input)) {
                color = {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16),
                    source: result[0]
                };
            }
            // Handle color: #rgb
            else if (result = rhexshort.exec(input)) {
                color = {
                    r: parseInt(result[1] + result[1], 16),
                    g: parseInt(result[2] + result[2], 16),
                    b: parseInt(result[3] + result[3], 16),
                    source: result[0]
                };
            }
            // Handle color: rgb[a](r, g, b [, a])
            else if (result = rrgb.exec(input)) {
                color = {
                    r: parseInt(result[1], 10),
                    g: parseInt(result[2], 10),
                    b: parseInt(result[3], 10),
                    alpha: parseFloat(result[4], 10),
                    source: result[0]
                };
            }
            // Handle color: rgb[a](r%, g%, b% [, a])
            else if (result = rrgbpercent.exec(input)) {
                color = {
                    r: parseInt(result[1] * 2.55, 10),
                    g: parseInt(result[2] * 2.55, 10),
                    b: parseInt(result[3] * 2.55, 10),
                    alpha: parseFloat(result[4], 10),
                    source: result[0]
                };
            }
            // Handle color: hsl[a](h%, s%, l% [, a])
            else if (result = rhsl.exec(input)) {
                color = hAzzle.color.hsl_to_rgb(
                    parseFloat(result[1], 10) / 100,
                    parseFloat(result[2], 10) / 100,
                    parseFloat(result[3], 10) / 100
                );
                color.alpha = parseFloat(result[4], 10);
                color.source = result[0];
            }
            // Handle color: name
            else {
                result = input.split(' ');

                i = 0,
                l = result.length;

                for (; i < l; i++) {

                    name = result[i];

                    if (hAzzle.colornames[name]) {
                        break;
                    }
                }

                if (!hAzzle.colornames[name]) {
                    name = 'transparent';
                }

                color = hAzzle.colornames[name];
                color.source = name;
            }

            if (!color.alpha && color.alpha !== 0) {
                delete color.alpha;
            }

            return color;
        },

        hsl_to_rgb: function (h, s, l, a) {
            var r, g, b, m1, m2;

            if (s === 0) {
                r = g = b = l;
            } else {
                if (l <= 0.5) {
                    m2 = l * (s + 1);
                } else {
                    m2 = (l + s) - (l * s);
                }

                m1 = (l * 2) - m2;
                r = parseInt(255 * hAzzle.color.hue2rgb(m1, m2, h + (1 / 3)), 10);
                g = parseInt(255 * hAzzle.color.hue2rgb(m1, m2, h), 10);
                b = parseInt(255 * hAzzle.color.hue2rgb(m1, m2, h - (1 / 3)), 10);
            }

            return {
                r: r,
                g: g,
                b: b,
                alpha: a
            };
        },

        // hsla conversions adapted from:
        // https://code.google.com/p/maashaack/source/browse/packages/graphics/trunk/src/graphics/colors/HUE2RGB.as?r=5021			

        hue2rgb: function (p, q, h) {

            if (h < 0) {

                h++;
            }

            if (h > 1) {

                h--;
            }

            if ((h * 6) < 1) {
                return p + ((q - p) * h * 6);
            } else if ((h * 2) < 1) {
                return q;
            } else if ((h * 3) < 2) {
                return p + ((q - p) * ((2 / 3) - h) * 6);
            } else {
                return p;
            }
        }
    }

}, hAzzle);


/**
 * sets an element to an explicit x/y position on the page
 * @param {Element} el
 * @param {?number} x
 * @param {?number} y
 */
function xy(el, x, y) {
    var elem = hAzzle(el),
        style = elem.css('position'),
        offset = elem.offset(),
        rel = 'relative',
        isRel = style === rel,
        delta = [parseInt(elem.css('left'), 10), parseInt(elem.css('top'), 10)];

    if (style === 'static') {
        elem.css('position', rel);
        style = rel;
    }

    if (isNaN(delta[0])) {

        delta[0] = isRel ? 0 : el.offsetLeft;

    }

    if (isNaN(delta[1])) {

        delta[1] = isRel ? 0 : el.offsetTop;
    }

    if (x !== null) {

        el.style.left = x - offset.left + delta[0] + px;
    }

    if (y !== null) {

        el.style.top = y - offset.top + delta[1] + px;
    }
}

hAzzle.each(props, function (hook) {

    colorHook[hook] = function (elem, value) {

        value = hAzzle.color.normalize(value);

        if (!value.alpha) {
            value.alpha = 1;
        }

        elem.style[hook] = 'rgba(' + value.r + ',' + value.g + ',' + value.b + ',' + value.alpha + ')';
    };
});




function docu() {
    var vp = viewport();
    return {
        width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width),
        height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
    };
}

function viewport() {
    var self = this;
    return {
        width: self.innerWidth,
        height: self.innerHeight
    };
};// Classes

var csp = hAzzle.features.classList,
    sMa = hAzzle.features.sMa, // Multiple argumens
    indexOf = Array.prototype.indexOf,
    rclass = /[\t\r\n\f]/g,
    whitespaceRegex = /\S+/g;
	
hAzzle.extend({
 
    /**
     * Add class(es) to element collection
     *
     * @param {String} value
	 * @return {hAzzle}
     */

    addClass: function (value) {
        var cur,
			j,
			clazz,
			finalValue,
            classes;

  if(typeof value === "function"){

    return this.each(function (el, index) {
            hAzzle(el).addClass(value.call(el, index, el.className));
        });
	}	
	classes = (value || '').match(whitespaceRegex) || [];
	
		return this.each(function (el) {
            if (el.nodeType === 1) {
                if (csp) {
                    if (sMa) {
                        el.classList.add.apply(el.classList, classes);
                    } else {
						try {
                        value.replace(whitespaceRegex, function (name) {
                            el.classList.add(name);
                        });
						} catch(e){}
                    }
                } else {
                cur = el.nodeType === 1 && ( el.className ? ( " " + el.className + " " ).replace( rclass, " " ) : " ");

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = hAzzle.trim( cur );
					if ( el.className !== finalValue ) {
						el.className = finalValue;
					}
				}
                }
                return el;
            }
        });
    },

    /**
     * Remove class(es) from element
     *
     * @param {String} value
     */

    removeClass: function (value) {

        var cls,
            element,
            classes = (value || '').match(whitespaceRegex) || [];

        // Function

        return typeof value === "function" ?
            this.each(function (j) {
                hAzzle(this).removeClass(value.call(this, j, this.className));
            }) : this.each(function () {
                element = this;
                if (element.nodeType === 1 && element.className) {

                    if (!value) {
                        element.className = '';
						return;
                    }

                    if (value === '*') {
                        element.className = '';
                    } else {
                        if (hAzzle.isRegExp(value)) {
                            value = [value];
                        } else if (csp && hAzzle.inArray(value, '*') === -1) {
                            if (sMa) {
                                element.classList.remove.apply(element.classList, classes);
                            } else {
                                var i = 0;
                                while ((cls = classes[i++])) {
                                    element.classList.remove(cls);
                                }
                            }
                            return;
                        } else {
                            value = value.trim().split(/\s+/);


                            var name;

                            classes = ' ' + element.className + ' ';

                            while (name = value.shift()) {
                                if (name.indexOf('*') !== -1) {
                                    name = new RegExp('\\s*\\b' + name.replace('*', '\\S*') + '\\b\\s*', 'g');
                                }
                                if (name instanceof RegExp) {
                                    classes = classes.replace(name, ' ');
                                } else {
                                    while (classes.indexOf(' ' + name + ' ') !== -1) {
                                        classes = classes.replace(' ' + name + ' ', ' ');
                                    }
                                }
                            }
                            element.className = classes.trim();
                        }
                        return element;
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

    hasClass: function (value) {

       var i = 0, className = " " + value + " ",
                l = this.length;
            for (; i < l; i++) {
				if(csp) {
                if (this[i].nodeType === 1) {
                    if (this[i].classList.contains(value)) {
                        return true;
                    }
                }
				} else{
				if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}
      }
            return false;
    },


    /**
     * Replace a class in a element collection
     *
     * @param {String} clA
     * @param {String} clB
	 * @return {hAzzle}
     */

    replaceClass: function (clA, clB) {
        var current, found, i;
        return this.each(function () {
            current = this.className.split(' ');
            found = false;

            for (i = current.length; i--;) {
                if (current[i] === clA) {
                    found = true;
                    current[i] === clB;
                }
            }
            if (!found) {
                return hAzzle(this).addClass(clB, this);
            }
            this.className = current.join(' ');
        });
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

        var classNames = value.match(whitespaceRegex) || [],
            cls,
            i = 0,
            self;

        return this.each(function (elem) {

            if (type === "string") {

                // ClassList

                self = hAzzle(elem);

                while ((cls = classNames[i++])) {

                    if (csp) {

                        if (typeof state === "boolean") {

                            // IE10+ doesn't support the toggle boolean flag.

                            if (state) {

                                return elem.classList.add(cls);

                            } else {

                                return elem.classList.remove(cls);
                            }
                        }

                        return elem.classList.toggle(cls);
                    }

                    // check each className given, space separated list

                    if (self.hasClass(cls)) {

                        self.removeClass(cls);

                    } else {

                        self.addClass(cls);
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

});;/*!
 * Manipulation
 */
var
    win = window,
    doc = win.document,
    parentNode = 'parentNode',
    setAttribute = 'setAttribute',
    getAttribute = 'getAttribute',
    singleTag = /^\s*<([^\s>]+)/,
    specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i,
    uniqueTags = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    simpleScriptTagRe = /\s*<script +src=['"]([^'"]+)['"]>/,
    wp = /\S+/g,

    // Inspiration from jQuery

    table = ['<table>', '</table>', 1],
    td = ['<table><tbody><tr>', '</tr></tbody></table>', 3],
    option = ['<select>', '</select>', 1],
    noscope = ['_', '', 0, 1],
    tagMap = { // tags that we have trouble *inserting*
        thead: table,
        tbody: table,
        tfoot: table,
        colgroup: table,
        caption: table,
        tr: ['<table><tbody>', '</tbody></table>', 2],
        th: td,
        td: td,
        col: ['<table><colgroup>', '</colgroup></table>', 2],
        fieldset: ['<form>', '</form>', 1],
        legend: ['<form><fieldset>', '</fieldset></form>', 2],
        option: option,
        optgroup: option,
        script: noscope,
        style: noscope,
        link: noscope,
        param: noscope,
        base: noscope
    },

    special = {
        "for": "htmlFor",
        "class": "className"
    },

    hooks = {

        'SELECT': function (elem) {

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
                    (hAzzle.features.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) &&
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
        },

        'OPTION': function (elem) {

            var val = elem[getAttribute](name, 2);

            return val !== null ? val : hAzzle.trim(hAzzle.getText(elem));
        }
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

    iAh = function (el, direction, html) {
        if (el && el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
            el.insertAdjacentHTML(direction, hAzzle.trim(html));
        }
    };

function getBooleanAttrName(element, name) {
    // check dom last since we will most likely fail on name
    var booleanAttr = boolean_attr[name.toLowerCase()];
    // booleanAttr is here twice to minimize DOM access
    return booleanAttr && boolean_elements[element.nodeName] && booleanAttr;
}

function cSFH(html) {
    var scriptEl = doc.createElement('script'),
        matches = html.match(simpleScriptTagRe);
    scriptEl.src = matches[1];
    return scriptEl;
}

hAzzle.extend({

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

        var elem = this[0],
            nType = elem && elem.nodeType;

        if (!elem) {

            return;
        }

        // don't get/set attributes on text, comment and attribute nodes
        if (!elem || nType === 3 || nType === 8 || nType === 2) {
            return;
        }

        if (typeof elem[getAttribute] === typeof undefined) {

            return this.prop(name, value);
        }

        if (typeof value === "undefined") {

            // Checks if a "hook" exist for this...:

            if (hooks[elem.nodeName]) {

                return hooks[elem.nodeName](elem);
            }

            elem = elem[getAttribute](name, 2);

            return elem === null ? undefined : elem;
        }

        if (value === null) {

            this.removeAttr(name);
        }

        // Value is set - no need for hooks on this one...

        if (elem.nodeName === 'SELECT') {

            var optionSet, option,
                options = elem.options,
                values = hAzzle.makeArray(value),
                i = options.length;

            while (i--) {
                option = options[i];
                if ((option.selected = hAzzle.inArray(option.value, values) >= 0)) {
                    optionSet = true;
                }
            }

            if (!optionSet) {
                elem.selectedIndex = -1;
            }
            return values;

        } else {

            elem[setAttribute](name, value + "");
            return value;
        }
    },

    /**
     * Remove a given attribute from an element
     *
     * @param {String} value
     * @return {hAzzle}
     */

    removeAttr: function (value) {

        var name, propName, i = 0,
            attrNames = value && value.match(wp);

        return this.each(function (el) {

            if (attrNames && el.nodeType === 1) {

                while ((name = attrNames[i++])) {

                    propName = special[name] || name;

                    if (getBooleanAttrName(el, name)) {

                        el[propName] = false;

                    } else {

                        el.removeAttribute(name);
                    }
                }
            }
        });
    },

    /**
     * Check if an element have an attribute
     *
     * @param{String} name
     * @return {Boolean}
     */

    hasAttr: function (name) {
        return name && typeof this.attr(name) !== 'undefined';
    },

    /**
     * Sets an HTML5 data attribute
     *
     * @param{String} dataAttribute
     * @param{String} dataValue
     *
     * @return {hAzzle}
     */

    dataAttr: function (dataAttribute, dataValue) {

        if (!dataAttribute || typeof dataAttribute !== 'string') {
            return false;
        }
        var key;

        //if dataAttribute is an object, we will use it to set a data attribute for every key
        if (typeof (dataAttribute) === "object") {
            for (key in dataAttribute) {
                this.attr('data-' + key, dataAttribute[key]);
            }

            return this;
        }

        //if a value was passed, we'll set that value for the specified dataAttribute
        else if (dataValue) {
            return this.attr('data-' + dataAttribute, dataValue);
        }

        // lastly, try to just return the requested dataAttribute's value from the element
        else {
            var value = this.attr('data-' + dataAttribute);

            // specifically checking for undefined in case "value" ends up evaluating to false

            if (typeof value === "undefined") {
                return;
            }

            return value;
        }
    },

    toggleAttr: function (attr, toggle) {

        var args = arguments.length

        // Do nothing if no params provided: (ie fail safely)
        if (args === 0) {

            return self

            // When toggle arg not provided, add attribute where not present, remove it where prosent:
        } else if (args === 1) {

            return self.each(function () {

                hAzzle(this)[hAzzle(this).attr(attr) ? 'removeAttr' : 'attr'](attr, attr)

            })

            // Otherwise when both attr & toggle arguments have been provided:
        } else {

            // When toggle is a function, apply it to each element:
            if (typeof toggle === "function") {

                return this.each(function () {

                    hAzzle(this)[toggle.call(this) ? 'attr' : 'removeAttr'](attr, attr)

                })

                // Or add attr if toggle is truthy, remove attr if toggle is falsey:
            } else {

                return this[toggle ? 'attr' : 'removeAttr'](attr, attr)

            }

        }
    },

    /**
     * Read or set properties of DOM elements
     *
     * @param {String/Object} name
     * @param {String/Null} value
     * @return {hAzzle}
     */

    prop: function (name, value) {
        var el = this[0],
            a;
        return typeof name === "object" ? this.each(function (el) {
            for (a in name) {
                property(el, a, name[a]);
            }
        }) : typeof value === "undefined" ? el && el[special[name] || name] : property(this[0], name, value);
    },

    /**
     * Toggle properties
     */

    toggleProp: function (property) {
        return this.each(function () {
            return this.prop(property, !this.prop(property));
        });

    },

    /*
     * Remove properties from DOM elements
     *
     * @param {String} name
     * @return {hAzzle}
     */

    removeProp: function (name) {
        return this.each(function () {
            delete this[special[name] || name];
        });
    },

    /**
     * Get value for input/select elements
     * Set value for input/select elements
     *
     * @param {String} value
     * @return {Object|String}
     */

    val: function (value) {

        if (arguments.length) {

            return this.each(function (elem, index) {

                var val;

                if (elem.nodeType !== 1) {
                    return;
                }

                if (typeof value === "function") {
                    val = value.call(elem, index, hAzzle(elem).val());

                } else {

                    val = value;
                }

                if (val === null) {

                    val = "";

                } else if (typeof val === "number") {

                    val += "";

                } else if (hAzzle.isArray(val)) {

                    val = hAzzle.map(val, function (value) {

                        return value === null ? "" : value + "";
                    });
                }

                if (elem.type === 'radio' || elem.type === 'checkbox') {

                    return (elem.checked = hAzzle.inArray(hAzzle(elem).val(), value) >= 0);
                }

                if (elem.type === "select") {

                    var optionSet, option,
                        options = elem.options,
                        values = hAzzle.makeArray(value),
                        i = options.length;

                    while (i--) {
                        option = options[i];
                        if ((option.selected = hAzzle.inArray(option.value, values) >= 0)) {
                            optionSet = true;
                        }
                    }

                    // force browsers to behave consistently when non-matching value is set

                    if (!optionSet) {

                        elem.selectedIndex = -1;
                    }

                    return values;
                }

                elem.value = val;
            });

        } else {

            var el = this[0],
                ret;

            if (!hAzzle.features.checkOn) {

                return el.getAttribute("value") === null ? "on" : el.value;
            }

            ret = hooks[el.tagName] ? hooks[el.tagName](el) : el.value;

            return typeof ret === "string" ? ret.replace(/\r\n/g, "") : ret === null ? "" : ret;

        }
    },

    /**
     * Get html from element.
     * Set html to element.
     *
     * @param {String} html
     * @return {hAzzle|string}
     */

    html: function (html) {
        var append = function (el, i) {
                hAzzle.each(hAzzle.normalize(html, i), function (node) {
                    el.appendChild(node);
                });
            },
            updateElement = function (el, i) {
                try {
                    if (typeof html === 'string' && !specialTags.test(el.tagName)) {
                        el.innerHTML = html.replace(uniqueTags, "<$1></$2>");
                        return;
                    }
                } catch (e) {}
                append(el, i);
            };
        return typeof html !== 'undefined' ? this.empty().each(updateElement) : this[0] ? this[0].innerHTML : '';
    },

    /**
     * Get text for the first element in the collection
     * Set text for every element in the collection

     *
     * hAzzle('div').text() => div text
     *
     * @param {String} value
     * @return {hAzzle|String}
     */

    text: function (value) {

        if (typeof value === "function") {
            return this.each(function (i) {
                var self = hAzzle(this);
                self.text(value.call(this, i, self.text()));
            });
        }

        if (typeof value !== "object" && typeof value !== "undefined") {

            return this.empty().each(function (elem) {

                if (elem.nodeType === 1 || elem.nodeType === 9 || elem.nodeType === 11) {

                    // Firefox does not support insertAdjacentText 

                    if (typeof value === "string" && typeof HTMLElement !== 'undefined' && HTMLElement.prototype.insertAdjacentText) {

                        elem.insertAdjacentText('beforeEnd', value);

                    } else {

                        elem.textContent = value;
                    }
                }
            });
        }
        return hAzzle.getText(this);
    },

    /**
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    append: function (node) {
        return typeof node === "string" && !hAzzle.isXML(this[0]) ?
            this.each(function () {
                iAh(this, "beforeend", node);
            }) : this.each(function (el, i) {
                if (el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
                    hAzzle.each(hAzzle.normalize(node, i), function (i) {
                        // We don't allow text nodes
                        if (node.nodeType !== 3) {
                            el.appendChild(i);
                        }
                    });
                }
            });
    },

    /**
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    prepend: function (node) {
        return typeof node === "string" && !hAzzle.isXML(this[0]) ?
            this.each(function () {
                iAh(this, "afterbegin", node);
            }) : this.each(function (el, i) {
                if (el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
                    var first = el.firstChild;
                    hAzzle.each(hAzzle.normalize(node, i), function (i) {
                        if (node.nodeType !== 3) {
                            el.insertBefore(i, first);
                        }
                    });
                }
            });
    },

    /**
     * Append the current element to another
     *
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    appendTo: function (node) {
        insert.call(this, node, this, function (t, el) {
            t.appendChild(el);
        }, 1);
        return this;
    },

    /**
     * Prepend the current element to another.
     *
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    prependTo: function (node) {
        return insert.call(this, node, this, function (t, el) {
            t.insertBefore(el, t.firstChild);
        }, 1);
    },

    /**
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    before: function (node) {
        return typeof node === "string" && !hAzzle.isXML(this[0]) ?
            this.each(function () {
                iAh(this, "beforebegin", node);
            }) : this.each(function (el, i) {
                hAzzle.each(hAzzle.normalize(node, i), function (i) {
                    el[parentNode].insertBefore(i, el);
                });
            });
    },


    /**
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    after: function (node) {
        return typeof node === "string" && !hAzzle.isXML(this[0]) ?
            this.each(function () {
                iAh(this, "afterend", node);
            }) : this.each(function (el, i) {
                hAzzle.each(hAzzle.normalize(node, i), function (i) {
                    el[parentNode].insertBefore(i, el.nextSibling);
                }, null, 1);
            });
    },


    /**
     * @param {hAzzle|string|Element|Array} target
     * @param {Object} scope
     * @return {hAzzle}
     */

    insertBefore: function (node) {
        insert.call(this, node, this, function (t, el) {
            t[parentNode].insertBefore(el, t);
        });
        return this;
    },


    /**
     * @param {hAzzle|string|Element|Array} node
     * @param {Object} scope
     * @return {hAzzle}
     */

    insertAfter: function (node) {
        insert.call(this, node, this, function (t, el) {
            var sibling = t.nextSibling;
            sibling ?
                t[parentNode].insertBefore(el, sibling) :
                t[parentNode].appendChild(el);
        }, 1);
        return this;
    },

    /**
     * @param {hAzzle|string|Element|Array} node
     * @return {hAzzle}
     */

    replaceWith: function (node) {
        hAzzle(hAzzle.normalize(node)).insertAfter(this);
        return this.remove();
    }

});

// Create HTML

hAzzle.create = function (node) {

    if (node !== '' && typeof node === 'string') {

        // Script tag

        if (simpleScriptTagRe.test(node)) {

            return [cSFH(node)];

        }
        var tag = node.match(singleTag),
            el = doc.createElement('div'),
            els = [],
            p = tag ? tagMap[tag[1].toLowerCase()] : null,
            dep = p ? p[2] + 1 : 1,
            ns = p && p[3],
            pn = parentNode;

        el.innerHTML = p ? (p[0] + node + p[1]) : node;

        while (dep--) {

            if (el.firstChild) {

                el = el.firstChild;
            }
        }

        if (ns && el && el.nodeType !== 1) {

            el = el.nextSibling;
        }

        do {

            if (!tag || el.nodeType == 1) {

                els.push(el);
            }

        } while (el = el.nextSibling);

        hAzzle.each(els, function (el) {

            el[pn] && el[pn].removeChild(el);

        });

        return els;

    } else {

        return hAzzle.isNode(node) ? [node.cloneNode(true)] : [];
    }

};


// this insert method is intense
function insert(target, node, fn, rev) {
    var i = 0,
        r = [],
        nodes = typeof target === 'string' && target.charAt(0) !== '<' ? hAzzle(target) : target;

    // normalize each node in case it's still a string and we need to create nodes on the fly

    hAzzle.each(hAzzle.normalize(nodes), function (t, j) {
        hAzzle.each(node, function (el) {

            fn(t, r[i++] = j > 0 ? hAzzle.cloneNode(self, el) : el);

        }, null, rev);

    }, this, rev);

    node.length = i;

    hAzzle.each(r, function (e) {

        node[--i] = e;

    }, null, !rev);

    return self;
}

function property(elem, name, value) {

    var ret, hooks, notxml,
        nType = elem.nodeType,
        phooks = {
            tabIndex: {
                get: function (elem) {
                    return elem.hasAttribute("tabindex") || /^(?:input|select|textarea|button)$/i.test(elem.nodeName) || elem.href ? elem.tabIndex : -1;
                }
            }
        };

    // Support: IE9+

    if (!hAzzle.features.optSelected) {
        phooks.selected = {
            get: function (elem) {
                var parent = elem.parentNode;
                if (parent && parent.parentNode) {
                    parent.parentNode.selectedIndex;
                }
                return null;
            }
        };
    }

    // don't get/set properties on text, comment and attribute nodes
    if (!elem || nType === 3 || nType === 8 || nType === 2) {
        return;
    }

    notxml = nType !== 1 || (elem.ownerDocument || elem).documentElement.nodeName === "HTML";

    if (notxml) {
        hooks = phooks[special[name] || name];
    }

    if (typeof value !== "undefined") {

        return hooks && "set" in hooks && typeof (ret = hooks.set(elem, value, name)) !== 'undefined' ? ret : (elem[name] = value);

    } else {

        return hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null ? ret : elem[name];
    }
};/*!
 * Removeable
 */

/**
 * removes the data associated with an element
 * @param {Element} el
 */

function clearData(el) {
    hAzzle.removeData(el);
    hAzzle.Events.off(el);
}

hAzzle.extend({

    /**
     * @return {hAzzle}
     */

    detach: function () {
        return this.each(function (el) {
            el.parentNode && el.parentNode.removeChild(el);
        });
    },

    /**
     * @return {hAzzle}
     */

    
    remove: function () {
        if (this[0] && this[0].nodeType === 1) {
            this.deepEach(clearData);
            return this.detach();
        }
    },


    /**
     * @return {hAzzle}
     */
    
    empty: function () {
        return this.each(function (el) {
            hAzzle.deepEach(el.childNodes, clearData);

            while (el.firstChild) {
                el.removeChild(el.firstChild);
            }
        });
    }
});;/*!
 * Event handler
 */
var win = window,
    doc = document || {},
    root = doc.documentElement || {},

    hAzzle = win['hAzzle'],
	
    // Cached handlers
    container = {},
    specialsplit = /\s*,\s*|\s+/,
    rkeyEvent = /^key/,
    // key
    rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
    // mouse
    ns = /[^\.]*(?=\..*)\.|.*/,
    // Namespace regEx
    names = /\..*/,
    // Event and handlers we have fixed
    treated = {},
    // Some prototype references we need
    //substr = String.prototype.substr,
    slice = Array.prototype.slice,
    //concat = Array.prototype.concat,
    //toString = Object.prototype.toString,
    threatment = {
        disabeled: function (el, type) {
            if (el.disabeled && type === 'click') {
                return true;
            }
            return false;
        },
        nodeType: function (el) {
            if (el.nodeType === 3 || el.nodeType === 8) {
                return true;
            }
        }
    },
    special = {
        pointerenter: {
            fix: 'pointerover',
            condition: checkPointer
        },
        pointerleave: {
            fix: 'pointerout',
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
    commonProps = 'altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which'.split(' ');
// Check mouse
function checkMouse(evt) {
    evt = evt.relatedTarget;
    if (evt) {
        var ac;
        if ((ac = evt) !== this) {
            if ((ac = 'xul') !== evt.prefix) {
                if ((ac = !/document/.test(this.toString()))) {
                    a: {
                        for (;
                            (evt = evt.parentNode);) {
                            if (evt === this) {
                                evt = 1;
                                break a;
                            }
                        }
                        evt = 0;
                    }
                    ac = !evt;
                }
            }
        }
        evt = ac;
    } else {
        evt = null === evt;
    }
    return evt;
}
/**
 * FIX ME!!  I don't have a pointer device so can't fix this. Maybe in the future.
 * But need to run a check about this condition here.
 */
function checkPointer(evt) {
    return evt;
}
hAzzle.extend({
    eventHooks: {
        keys: function (evt, original) {
            original.keyCode = evt.keyCode || evt.which;
            return commonProps.concat([
                'char',
                'charCode',
                'key',
                'keyCode'
            ]);
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
            return commonProps.concat('button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement'.split(' '));
        }
    },
    Kernel: function (element, type, handler, original, namespaces, args) {
        var _special = special[type],
            evt = this;
        // Only load the event once upon unload
        if (type === 'unload') {
            handler = hAzzle.Events.once(hAzzle.Events.removeListener, element, type, handler, original);
        }
        if (_special) {
            if (_special.condition) {
                handler = hAzzle.Events.wrappedHandler(element, handler, _special.condition, args);
            }
            type = _special.fix || type;
        }
        evt.element = element;
        evt.type = type;
        evt.original = original;
        evt.namespaces = namespaces;
        evt.eventType = type;
        evt.target = element;
        evt.handler = hAzzle.Events.wrappedHandler(element, handler, null, args);
    }
}, hAzzle);
hAzzle.Kernel.prototype = {
    inNamespaces: function (checkNamespaces) {
        var i, j, c = 0;
        if (!checkNamespaces) {
            return true;
        }
        if (!this.namespaces) {
            return false;
        }
        i = checkNamespaces.length;
        while (i--) {
            for (j = this.namespaces.length; j--;) {
                if (checkNamespaces[i] === this.namespaces[j]) {
                    c++;
                }
            }
        }
        return checkNamespaces.length === c;
    },
    matches: function (checkElement, checkOriginal, checkHandler) {
        return this.element === checkElement && (!checkOriginal || this.original === checkOriginal) && (!checkHandler || this.handler === checkHandler);
    }
};
hAzzle.extend({
    on: function (events, selector, fn, one) {
        return this.each(function () {
            hAzzle.Events.add(this, events, selector, fn, one);
        });
    },
    one: function (types, selector, fn) {
        return this.on(types, selector, fn, 1);
    },
    off: function (events, fn) {
        return this.each(function () {
            hAzzle.Events.off(this, events, fn);
        });
    },
    trigger: function (type, args) {
        var el = this[0];
        var types = type.split(specialsplit),
            i = types.length,
            j, l, call, evt, names, handlers;
        if (threatment.disabeled(el, type) || threatment.nodeType(el)) {
            return false;
        }
        while (i--) {
            type = types[i].replace(names, '');
            if ((names = types[i].replace(ns, ''))) {
                names = names.split('.');
            }
            if (!names && !args) {
                var HTMLEvt = doc.createEvent('HTMLEvents');
                HTMLEvt.initEvent(type, true, true, win, 1);
                el.dispatchEvent(HTMLEvt);
            } else {
                handlers = hAzzle.Events.getHandler(el, type, null, false);
                evt = new Event(null, el);
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
    },
    click: function (data, fn) {
        return this.on('click', data, fn);
    },
    mousedown: function (data, fn) {
        return this.on('mousedown', data, fn);
    },
    mouseup: function (data, fn) {
        return this.on('mouseup', data, fn);
    },
    mouseover: function (data, fn) {
        return this.on('mouseover', data, fn);
    },
    mouseout: function (data, fn) {
        return this.on('mouseout', data, fn);
    },
    mouseenter: function (data, fn) {
        return this.on('mouseenter', data, fn);
    },
    mouseleave: function (data, fn) {
        return this.on('mouseleave', data, fn);
    },
    change: function (data, fn) {
        return this.on('change', data, fn);
    },
    select: function (data, fn) {
        return this.on('select', data, fn);
    },
    keypress: function (data, fn) {
        return this.on('keypress', data, fn);
    },
    keyup: function (data, fn) {
        return this.on('keyup', data, fn);
    },
    focus: function (data, fn) {
        return this.on('focus', data, fn);
    },
    focusout: function (data, fn) {
        return this.on('focusout', data, fn);
    },
    hover: function (data, fn) {
        return this.on('hover', data, fn);
    },
    resize: function (data, fn) {
        return this.on('resize', data, fn);
    },
    dblclick: function (data, fn) {
        return this.on('dblclick', data, fn);
    },
    scroll: function (data, fn) {
        return this.on('scroll', data, fn);
    },
    cloneEvents: function (from, type) {
        return this.each(function () {
            hAzzle.cloneEvents(this, from, type);
        });
    }
});
hAzzle.cloneEvents = function (element, from, type) {
    var handlers = hAzzle.Events.getHandler(from, type, null, false),
        l = handlers.length,
        i = 0,
        args, hDlr;
    for (; i < l; i++) {
        if (handlers[i].original) {
            args = [
                element,
                handlers[i].type
            ];
            if ((hDlr = handlers[i].handler.__handler)) {
                args.push(hDlr.selector);
            }
            args.push(handlers[i].original);
            hAzzle.Events.add.apply(null, args);
        }
    }
    return element;
};
// hAzzle.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
function Event(evt, element) {
    if (!arguments.length) {
        return;
    }
    evt = evt || ((element.ownerDocument || element.document || element).parentWindow || win).evt;
    this.originalEvent = evt;
    if (!evt) {
        return;
    }
    var type = evt.type,
        target = evt.target,
        i, p, props, fixHook;
    this.target = target && target.nodeType === 3 ? target.parentNode : target;
    fixHook = treated[type];
    if (!fixHook) {
        treated[type] = fixHook = rmouseEvent.test(type) ? hAzzle.eventHooks.mouse : rkeyEvent.test(type) ? hAzzle.eventHooks.keys : function () {
            return commonProps;
        };
    }
    props = fixHook(evt, this, type);
    for (i = props.length; i--;) {
        if (!((p = props[i]) in this) && p in evt) {
            this[p] = evt[p];
        }
    }
}
Event.prototype = {
    preventDefault: function () {
        var e = this.originalEvent;
        if (e && e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    },
    stopPropagation: function () {
        var e = this.originalEvent;
        if (e && e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
    },
    stop: function () {
        var e = this;
        e.preventDefault();
        e.stopPropagation();
        e.stopped = true;
    },
    stopImmediatePropagation: function () {
        var e = this.originalEvent;
        this.isImmediatePropagationStopped = function () {
            return true;
        };
        if (e && e.stopImmediatePropagation) {
            e.stopImmediatePropagation();
        }
    },
    isImmediatePropagationStopped: function () {
        return this.originalEvent.isImmediatePropagationStopped && this.originalEvent.isImmediatePropagationStopped();
    },
    clone: function (currentTarget) {
        var ne = new Event(this, this.element);
        ne.currentTarget = currentTarget;
        return ne;
    }
};
hAzzle.Events = {
    add: function (el, events, selector, fn, one) {
        var originalFn, type, types, i, args, entry, first;
        // Dont' allow click on disabeled elements, or events on text and comment nodes
        if (threatment.disabeled(el, events) || threatment.nodeType(el)) {
            return false;
        }
        // Types can be a map of types/handlers
        // TODO!! This is not working on delegated events, have to fix this ASAP !!
        if (hAzzle.isUndefined(selector) && hAzzle.isObject(events))
            for (type in events) {
                if (events.hasOwnProperty(type)) {
                    hAzzle.Events.add.call(this, el, type, events[type]);
                }
            } else {
            // Delegated event
            if (typeof selector !== 'function') {
                originalFn = fn;
                args = slice.call(arguments, 4);
                fn = hAzzle.Events.delegate(selector, originalFn);
            } else {
                args = slice.call(arguments, 3);
                fn = originalFn = selector;
            }
            // One
            if (one === 1) {
                // Make a unique handlet that get removed after first time it's triggered
                fn = hAzzle.Events.once(hAzzle.Events.off, el, events, fn, originalFn);
            }
            // Handle multiple events separated by a space
            types = events.split(specialsplit);
            i = types.length;
            while (i--) {
                first = hAzzle.Events.putHandler(entry = new hAzzle.Kernel(el, types[i].replace(names, ''), fn, originalFn, types[i].replace(ns, '').split('.'), args, false));
                // Add root listener only if we're the first
                if (first) {
                    el.addEventListener(entry.eventType, hAzzle.Events.rootListener, false);
                }
            }
            return el;
        }
    },
    off: function (el, typeSpec, fn) {
        var isTypeStr = typeof typeSpec === 'string',
            type, namespaces, i;
        if (isTypeStr && hAzzle.indexOf(typeSpec, ' ') > 0) {
            typeSpec = typeSpec.split(typeSpec);
            for (i = typeSpec.length; i--;) {
                hAzzle.Events.off(el, typeSpec[i], fn);
            }
            return el;
        }
        type = isTypeStr && typeSpec.replace(names, '');
        if (type && special[type]) {
            type = special[type].fix;
        }
        if (!typeSpec || isTypeStr) {
            // Namespace
            if ((namespaces = isTypeStr) && typeSpec.replace(ns, '')) {
                namespaces = namespaces.split('.');
            }
            // Remove the listener
            hAzzle.Events.removeListener(el, type, fn, namespaces);
        } else if (typeof typeSpec !== 'function') {
            hAzzle.Events.removeListener(el, null, typeSpec);
        } else {
            if (typeSpec) {
                for (var k in typeSpec) {
                    if (typeSpec.hasOwnProperty(k)) {
                        hAzzle.Events.off(el, k, typeSpec[k]);
                    }
                }
            }
        }
        return el;
    },
    delegate: function (selector, fn) {
        function findTarget(target, root) {
            var i, matches = hAzzle(selector, root);
            for (; target !== root; target = target.parentNode || root) {
                if (matches !== null) {
                    for (i = matches.length; i--;) {
                        if (matches[i] === target) {
                            return target;
                        }
                    }
                }
            }
        }

        function handler(e) {
            // Don't process clicks on disabled elements
            if (e.target.disabled !== true) {
                var m = findTarget(e.target, this);
                if (m) {
                    fn.apply(m, arguments);
                }
            }
        }
        handler.__handlers = {
            ft: findTarget,
            selector: selector
        };
        return handler;
    },
    removeListener: function (element, type, handler, ns) {
        type = type && type.replace(names, '');
        type = hAzzle.Events.getHandler(element, type, null, false);
        var removed = {};
        // No point to continue if no event attached on the element
        if (type) {
            var i = 0,
                l = type.length;
            for (; i < l; i++) {

                if ((!handler || type[i].original === handler) && type[i].inNamespaces(ns)) {
                    hAzzle.Events.delHandler(type[i]);
                    if (!removed[type[i].eventType]) {
                        removed[type[i].eventType] = {
                            t: type[i].eventType,
                            c: type[i].type
                        };
                    }
                }
            }
            for (i in removed) {
                if (!hAzzle.Events.hasHandler(element, removed[i].t, null, false)) {
                    element.removeEventListener(removed[i].t, hAzzle.Events.rootListener, false);
                }
            }
        }
    },
    once: function (rm, element, type, handler, callback) {
        return function () {
            handler.apply(this, arguments);
            rm(element, type, callback);
        };
    },
    rootListener: function (evt, type) {
        var listeners = hAzzle.Events.getHandler(this, type || evt.type, null, false),
            l = listeners.length,
            i = 0;
        evt = new Event(evt, this, true);
        for (; i < l && !evt.isImmediatePropagationStopped(); i++) {
            if (!listeners[i].removed) {
                listeners[i].handler.call(this, evt);
            }
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
            var target = findTarget(evt, this);
            // delegated event
            if (condition.apply(target, arguments)) {
                if (evt) {
                    evt.currentTarget = target;
                }
                return call(evt, arguments);
            }
        } : function (evt) {
            if (fn.__handlers) {
                evt = evt.clone(findTarget(evt));
            }
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
                l, list = container[root ? 'r' : '#' + type];
            if (!list) {
                return;
            }
            for (l = list.length; i < l; i++) {
                if ((element === '*' || list[i].matches(element, original, handler)) && !fn(list[i], list, i, type)) {
                    return;
                }
            }
        }
    },
    hasHandler: function (element, type, original, root) {
        if ((root = container[(root ? 'r' : '#') + type])) {
            for (type = root.length; type--;) {
                if (!root[type].root && root[type].matches(element, original, null)) {
                    return true;
                }
            }
        }
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
    delHandler: function (entry) {
        hAzzle.Events.findIt(entry.element, entry.type, null, entry.handler, entry.root, function (entry, list, i) {
            list.splice(i, 1);
            entry.removed = true;
            if (list.length === 0) {
                delete container[(entry.root ? 'r' : '#') + entry.type];
            }
            return false;
        });
    }
};;/** 
 * Data
 */
var html5Json = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/,
    hAzzle = window['hAzzle'];

// Extend the hAzzle object

hAzzle.extend({

    _data: {},


    /**
     * Check if an element contains data
     *
     * @param{String/Object} elem
     * @param{String} key
     * @return {Object}
     */

    hasData: function (elem) {

        if (elem.nodeType) {
            if (hAzzle._data[hAzzle.getUID(elem)]) {

                return true;

            } else {

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

        if (elem.nodeType === 1 || elem.nodeType === 9 || !(+elem.nodeType)) {

            if (!elem instanceof hAzzle) {
                elem = hAzzle(elem);
            }

            var id = hAzzle.getUID(elem);

            // Nothing to do if there are no data stored on the elem itself

            if (hAzzle._data[id]) {

                if (typeof key === 'undefined' && elem.nodeType === 1) {

                    hAzzle._data[id] = {};

                } else {

                    if (hAzzle._data[id]) {
                        delete hAzzle._data[id][key];
                    } else {
                        hAzzle._data[id] = null;
                    }
                }

            }
        }
    },

    data: function (elem, key, value) {

        if (elem.nodeType === 1 || elem.nodeType === 9 || !(+elem.nodeType)) {

            var id = hAzzle._data[hAzzle.getUID(elem)];

            // Create and unique ID for this elem

            if (!id && elem.nodeType) {
                var pid = hAzzle.getUID(elem);
                id = hAzzle._data[pid] = {};
            }

            // Return all data on saved on the element

            if (typeof key === "undefined") {

                return id;
            }

            if (typeof value === 'undefined') {

                return id[key];
            }

            if (typeof value !== 'undefined') {

                // Set and return the value

                id[key] = value;

                return id[key];
            }
        }
    }
}, hAzzle);

hAzzle.extend({

    /**
     * Remove attributes from element collection
     *
     * @param {String} key
     *
     * @return {Object}
     */

    removeData: function (key) {
        return this.each(function () {
            hAzzle.removeData(this, key);
        });
    },

    /**
     * Getter/setter of a data entry value on the hAzzle Object. Tries to read the appropriate
     * HTML5 data-* attribute if it exists
     * @param  {String|Object|Array}  key(s)
     * @param  {Object}               value
     * @return {Object|String }
     */

    data: function (key, value) {
        var len = arguments.length;

        // If no arguments, try to get the data from the HTML5 data- attribute

        if (!len) {

            var data = hAzzle.data(this[0]),
                elem = this[0];

            if (elem.nodeType === 1 && !hAzzle.data(elem, "parsedAttrs")) {

                var attr = elem.attributes,
                    name,
                    i = 0,
                    l = attr.length;

                for (; i < l; i++) {

                    name = attr[i].name;

                    if (name.indexOf("data-") === 0) {

                        name = hAzzle.camelize(name.substr(5));

                        data = data[name];

                        // Try to fetch data from the HTML5 data- attribute

                        if (typeof data === 'undefined' && elem.nodeType === 1) {

                            name = "data-" + key.replace(/([A-Z])/g, "-$1").toLowerCase();

                            data = elem.getAttribute(name);

                            if (typeof data === "string") {
                                try {
                                    data = data === "true" ? true :
                                        data === "false" ? false :
                                        data === "null" ? null : +data + "" === data ? +data :
                                        html5Json.test(data) ? JSON.parse(data + "") : data;
                                } catch (e) {}

                                // Make sure we set the data so it isn't changed later

                                hAzzle.data(elem, key, data);

                            } else {
                                data = undefined;
                            }
                        }
                        return data;
                    }
                }

                hAzzle.data(elem, "parsedAttrs", true);
            }

            // 'key' defined, but no 'data'.

        } else if (len === 1) {

            if (this.length === 1) {

                return hAzzle.data(this[0], key);

            } else {

                // Sets multiple values

                return this.map(function (el) {

                    return hAzzle.data(el, key);

                });
            }

        } else {

            return hAzzle.data(this[0], key, value);
        }
    }

});;/*!
 * Clone
 */
var rcheckableType = /^(?:checkbox|radio)$/i;

function fixInput(src, dest) {
    var nodeName = dest.nodeName.toLowerCase();
    if ("input" === nodeName && rcheckableType.test(src.type)) {
		dest.checked = src.checked;
	}
    else if ("input" === nodeName || "textarea" === nodeName) {
		dest.defaultValue = src.defaultValue;
	}	
}

hAzzle.extend({

    cloneNode: function (el, deep) {

        var c = el.cloneNode(deep || true),
            cloneElems, elElems;

        hAzzle(c).cloneEvents(el);

        // clone events from every child node
        cloneElems = hAzzle.select("*", c);
        elElems = hAzzle.select("*", el);

        var i = 0,
            len = elElems.length;

        // Copy Events

        for (; i < len; i++) {
            hAzzle(cloneElems[i]).cloneEvents(elElems[i]);
        }

        if (!hAzzle.features.noCloneChecked && el.nodeType === 1 || el.nodeType === 11 && hAzzle.isXML(el)) {
            for (; i < len; i++) {
                fixInput(elElems[i], cloneElems[i]);
            }
        } else {

            // Okey, Mehran. We have cloned. Let us copy over the textarea data

            var cloneTextareas = hAzzle.select("textarea", c),
                elTextareas = hAzzle.select("textarea", el);

            // Copy over the textarea data	 

            for (var a = 0, b = elTextareas.length; a < b; ++a) {
                hAzzle(cloneTextareas[b]).val(hAzzle(elTextareas[b]).val());
            }
        }

        // Return the cloned set

        return c;
    }
}, hAzzle);


hAzzle.extend({
    clone: function (deep) {
        return this[0] ? this.twist(function (el) {
            return hAzzle.cloneNode(el, deep);
        }) : this;
    }
});;// Parsing

 hAzzle.extend({

    /**
     * Cross-browser JSON parsing
     *
     * @param {String} data
     */

    parseJSON: function (data) {
		 return typeof data === "string" ? JSON.parse(data + "") : data;
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

}, hAzzle);

;// MutationObserver for hAzzle

  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
      lifecycles = function(node) {

    var nodes = hAzzle(node).find('[observer]').toArray();
    hAzzle(node).is('[observer]') && nodes.push(node);
    return nodes;
  };

  var observeAttribute = function(node, callback) {
    var attributeObserver = new MutationObserver(function(mutations) {
      hAzzle.each(mutations, function(index, mutation) {
        callback(mutation.attributeName);
      });
    });

    attributeObserver.observe(node, { subtree: false, attributes: true });

    return attributeObserver;
  };

  var observer = new MutationObserver(function(mutations) {

    hAzzle.each(mutations, function(index, mutation) {
      if (mutation.type === 'childList') {
        hAzzle.each(mutation.addedNodes, function(index, node) {
          hAzzle.each(lifecycles(node), function(index, node) {
            hAzzle.each(node.whenInsert || [], function(index, callback) {
              callback();
            });
          });
        });

        hAzzle.each(mutation.removedNodes, function(index, node) {
          hAzzle.each(lifecycles(node), function(index, node) {
            hAzzle.each(node.whenRemove || [], function(index, callback) {
              callback();
            });
          });
        });
      }
    });
  });

  hAzzle(function() {    
    observer.observe(document.body, { childList: true, subtree: true });
  });
  
  hAzzle.extend({

   Observe: function(options) {
    var element = hAzzle(this).get(0);

    element.whenInsert = element.whenInsert || [];
    element.whenRemove = element.whenRemove || [];
    element.whenChange = element.whenChange || [];

    options = options || {};
    options.insert && element.whenInsert.push(options.insert);
    options.remove && element.whenRemove.push(options.remove);
    options.change && element.whenChange.push(observeAttribute(element, options.change));

    hAzzle(this).attr('observer', '');
  },

  unObserve: function() {

    var element = hAzzle(this).get(0);

    hAzzle.each(element.whenChange, function(index, attributeObserver) {
      attributeObserver.disconnect();
    });

    delete element.whenInsert;
    delete element.whenRemove;
    delete element.whenChange;
    
    hAzzle(this).removeAttr('observer');
  }
})
;
    var isObject = hAzzle.isObject,
        isString = hAzzle.isString,
        win = window,
        doc = document,

        // Common 5MB localStorage

        defaultSize = 5242880;

    // Inital check to see if localStorage is supported in the browser

    (function () {
        var supported = false;

        // Derived from Modernizer (http://github.com/Modernizr/Modernizr)

        try {
            localStorage.setItem('hAzzle', 'hAzzle');
            localStorage.removeItem('hAzzle');
            supported = true;
        } catch (e) {
            supported = false;
        }

        /**
         *  Implements localStorage if not supported
         *
         * NOTE !! We are going to remove this 'shim' in the future. Just now Opera Mini and IE Mobile 9 and older are not supporting this one.
         *
         * From https://developer.mozilla.org/en-US/docs/Web/Guide/DOM/Storage?redirectlocale=en-US&redirectslug=DOM%2FStorage
         */

        if (!supported) {
            win.localStorage = {
                getItem: function (sKey) {
                    if (!sKey || !this.hasOwnProperty(sKey)) {
                        return null;
                    }
                    return unescape(doc.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") +
                        "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
                },

                key: function (nKeyId) {
                    return unescape(doc.cookie.replace(/\s*\=(?:.(?!;))*$/, "").split(/\s*\=(?:[^;](?!;))*[^;]?;\s*/)[nKeyId]);
                },

                setItem: function (sKey, sValue) {
                    if (!sKey) {
                        return;
                    }
                    doc.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
                    this.length = doc.cookie.match(/\=/g).length;
                },

                length: 0,

                removeItem: function (sKey) {
                    if (!sKey || !this.hasOwnProperty(sKey)) {
                        return;
                    }
                    doc.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
                    this.length--;
                },

                // Really bad name, but not my idea :)

                hasOwnProperty: function (sKey) {
                    return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(doc.cookie);
                }
            };

            win.localStorage.length = (doc.cookie.match(/\=/g) || win.localStorage).length;
        }
    })();

    hAzzle.extend({

        /**
         * Convert bytes to human readable KB / MB / GB
         */

        bytesToSize: function (bytes) {
            var k = 1000,
                sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

            if (bytes === 0) {

                return '0 Bytes';
            }
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
            return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
        },

        /**
         * Removes all key / value pairs from localStorage
         */

        clearStorage: function () {
            localStorage.clear();
        },

        /**
         * Returns an array of keys currently stored in localStorage.
         */

        storageContains: function (key) {

            if (key && isString(key)) {
                return hAzzle.indexOf(this.getStorageKeys(), key) !== -1;
            }
        },

        /**
         * Returns an array of keys currently stored in localStorage.
         */

        getStorageKeys: function () {

            var result = [],
                i = 0;

            for (i = localStorage.length; i--;) {
                result.push(localStorage.key(i));
            }

            return result;
        },

        /**
         * Returns an approximation of how much space is left in localStorage
         */

        getRemainingStorageSpace: function () {
            return this.bytesToSize(defaultSize - this.getStorageSize(true));
        },

        /**
         * Returns the size of the total contents in localStorage.
         *
         */

        getStorageSize: function ( /*INTERNAL*/ pure) {

            if (pure) {

                return JSON.stringify(localStorage).length;

            } else { // Human readable

                return this.bytesToSize(JSON.stringify(localStorage).length);
            }
        },

        /**
         *  Returns true if localStorage has no key/value pairs
         */

        isStorageEmpty: function () {
            return this.getStorageKeys().length === 0;
        },

        /**
         * Removes the specified key/value pair
         */

        removeStorage: function (key) {

            if (!key) {

                return;
            }

            if (isString(key)) {

                localStorage.removeItem(key);

            } else if (hAzzle.isArray(key)) {

                var i = key.length;

                while (i--) {

                    if (isString(key[i])) {

                        localStorage.removeItem(key[i]);
                    }
                }
            }
        },

        /**
         * Returns the proper-type value of a specified key
         */
        getStorage: function (key, defaultValue) {

            if (key && isString(key)) {

                var value = localStorage.getItem(key).toLowerCase(), // retrieve value
                    number = parseFloat(value); // to allow for number checking

                if (value === null) {

                    // Returns default value if key is not set, otherwise returns null
                    return arguments.length === 2 ? defaultValue : null;
                }

                if (!hAzzle.IsNaN(number)) {

                    return number; // value was of type number
                }

                if (value === 'true' || value === 'false') {
                    return value === 'true'; //value was of type boolean
                }

                try {
                    value = JSON.parse(value + "");
                    return value;

                } catch (e) {

                    return value;
                }
            }

        },

        /**
         * Stores a given object in localStorage, allowing access to individual object properties
         **/

        setStorage: function (key, value) {

            if (arguments.length === 1) {

                this.store(key);

            } else if (key && isString(key)) {

                if (isObject(value)) {

                    value = JSON.stringify(value);
                }

                localStorage.setItem(key, value);
            }
        },

        /**
         * Saves a given object in localStorage, allowing access to individual object properties
         **/

        saveStorage: function (value) {
            var property;

            if (value && isObject(value) && !(value instanceof Array)) {
                for (property in value) {
                    localStorage.setItem(property, value[property]);
                }
            }
        },

        /**
         * Returns an object representation of the current state of localStorage
         *
         */

        StorageToObject: function () {

            var o = {},
                keys = this.getStorageKeys(),
                i = keys.length;

            while (i--) {
                o[keys[i]] = this.getStorage(keys[i]);
            }

            return o;
        }

    }, hAzzle);

;/*!
 * Browser
 */
    var nav = navigator,
        ua = nav.userAgent,
        t = true,
        iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase(),
        likeAndroid = /like android/i.test(ua),
        android = !likeAndroid && /android/i.test(ua),
        versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i),
        tablet = /tablet/i.test(ua),
        mobile = !tablet && /[^-]mobi/i.test(ua),
        result,

        hAzzle = window['hAzzle'],
		
     // Browser regEx	

        pShort = /phantom/i,
        blackbShort = /blackberry|\bbb\d+/i,
        operaShort = /opera|opr/i,
        chromeShort = /chrome|crios|crmo/i,
        ieShort = /msie|trident/i,
        sailfishShort = /sailfish/i,
        ffShort = /firefox|iceweasel/i,
        webOsShort = /(web|hpw)os/i,
        silkShort = /silk/i,
        safariShort = /safari/i,
        seamokeyShort = /seamonkey\//i,
        badaShort = /bada/i,
        tizenShort = /tizen/i,
        geckoShort = /gecko\//i,
        ffMobTab = /\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i,
        opera = /(?:opera|opr)[\s\/](\d+(\.\d+)?)/i,
        chrome = /(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i,
        Firefox = /(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i,
        msie = /(?:msie |rv:)(\d+(\.\d+)?)/i,
        iemobile = /iemobile\/(\d+(\.\d+)?)/i,
        winPhone = /windows phone/i,
        sailfish = /sailfish\s?browser\/(\d+(\.\d+)?)/i,
        seamonkey = /seamonkey\/(\d+(\.\d+)?)/i,
        phantom = /phantomjs\/(\d+(\.\d+)?)/i,
        BlackBerry = /blackberry[\d]+\/(\d+(\.\d+)?)/i,
        osBrowser = /w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i,
        bada = /dolfin\/(\d+(\.\d+)?)/i,
        tizen = /(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i,
        appleWebkit = /(apple)?webkit/i,
        gecko = /gecko\/(\d+(\.\d+)?)/i,
        touchPad = /touchpad\//i,
        silk = /silk\/(\d+(\.\d+)?)/i;

    function getFirstMatch(regex) {
        var match = ua.match(regex);
        return (match && match.length > 1 && match[1]) || '';
    }


hAzzle.extend ({
    browser: function () {
        operaShort.test(ua) ? result = {
            name: "Opera",
            opera: t,
            version: versionIdentifier || getFirstMatch(opera)
        } : winPhone.test(ua) ? result = {
            name: "Windows Phone",
            windowsphone: t,
            msie: t,
            version: getFirstMatch(iemobile)
        } : ieShort.test(ua) ? result = {
            name: "Internet Explorer",
            msie: t,
            version: getFirstMatch(msie)
        } : chromeShort.test(ua) ? result = {
            name: "Chrome",
            chrome: t,
            version: getFirstMatch(chrome)
        } : iosdevice ? (result = {
            name: "iphone" === iosdevice ? "iPhone" : "ipad" === iosdevice ? "iPad" : "iPod"
        }, versionIdentifier && (result.version = versionIdentifier)) : sailfishShort.test(ua) ? result = {
            name: "Sailfish",
            sailfish: t,
            version: getFirstMatch(sailfish)
        } : seamokeyShort.test(ua) ? result = {
            name: "SeaMonkey",
            seamonkey: t,
            version: getFirstMatch(seamonkey)
        } : ffShort.test(ua) ? (result = {
            name: "Firefox",
            firefox: t,
            version: getFirstMatch(Firefox)
        }, ffMobTab.test(ua) && (result.firefoxos = t)) : silkShort.test(ua) ? result = {
            name: "Amazon Silk",
            silk: t,
            version: getFirstMatch(silk)
        } : android ? result = {
            name: "Android",
            version: versionIdentifier
        } : pShort.test(ua) ? result = {
            name: "PhantomJS",
            phantom: t,
            version: getFirstMatch(phantom)
        } : blackbShort.test(ua) || /rim\stablet/i.test(ua) ? result = {
            name: "BlackBerry",
            blackberry: t,
            version: versionIdentifier || getFirstMatch(BlackBerry)
        } : webOsShort.test(ua) ? (result = {
                name: "WebOS",
                webos: t,
                version: versionIdentifier || getFirstMatch(osBrowser)
            }, touchPad.test(ua) &&
            (result.touchpad = t)) : result = badaShort.test(ua) ? {
            name: "Bada",
            bada: t,
            version: getFirstMatch(bada)
        } : tizenShort.test(ua) ? {
            name: "Tizen",
            tizen: t,
            version: getFirstMatch(tizen) || versionIdentifier
        } : safariShort.test(ua) ? {
            name: "Safari",
            safari: t,
            version: versionIdentifier
        } : {};

        // set webkit or gecko flag for browsers based on these engines
        if (appleWebkit.test(ua)) {
            result.name = result.name || "Webkit";
            result.webkit = t;
            if (!result.version && versionIdentifier) {
                result.version = versionIdentifier;
            }
        } else if (!result.opera && geckoShort.test(ua)) {
            result.name = result.name || "Gecko";
            result.gecko = t;
            result.version = result.version || getFirstMatch(gecko);
        }

        // set OS flags for platforms that have multiple browsers
        if (android || result.silk) {
            result.android = t;
        } else if (iosdevice) {
            result[iosdevice] = t;
            result.ios = t;
        }

        // OS version extraction
        var osVersion = '';
        if (iosdevice) {
            osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
            osVersion = osVersion.replace(/[_\s]/g, '.');
        } else if (android) {
            osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
        } else if (result.windowsphone) {
            osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
        } else if (result.webos) {
            osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
        } else if (result.blackberry) {
            osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
        } else if (result.bada) {
            osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
        } else if (result.tizen) {
            osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
        }
        if (osVersion) {
            result.osversion = osVersion;
        }

        // device type extraction
        var osMajorVersion = osVersion.split('.')[0];
        if (tablet || iosdevice === 'ipad' || (android && (osMajorVersion === 3 || (osMajorVersion === 4 && !mobile))) || result.silk) {
            result.tablet = t;
        } else if (mobile || iosdevice === 'iphone' || iosdevice === 'ipod' || android || result.blackberry || result.webos || result.bada) {
            result.mobile = t;
        }

        // Graded Browser Support
        // http://developer.yahoo.com/yui/articles/gbs
        if ((result.msie && result.version >= 9) ||
            (result.chrome && result.version >= 20) ||
            (result.firefox && result.version >= 10.0) ||
            (result.safari && result.version >= 5) ||
            (result.opera && result.version >= 10.0) ||
            (result.ios && result.osversion && result.osversion.split(".")[0] >= 6)
        ) {
            result.a = t;
        } else if ((result.msie && result.version < 9) ||
            (result.chrome && result.version < 20) ||
            (result.firefox && result.version < 10.0) ||
            (result.safari && result.version < 5) ||
            (result.opera && result.version < 10.0) ||
            (result.ios && result.osversion && result.osversion.split(".")[0] < 6)
        ) {
            result.c = t;
        
		} else {
			
		result.x = t;
		
		}

        return result;
    }	
}, hAzzle);
