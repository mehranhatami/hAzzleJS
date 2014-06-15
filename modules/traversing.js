/*!
 * DOM traversing
 */
var emptyArray = [],
    slice = emptyArray.slice,
    push = emptyArray.push;

/**
 * Traversing method helper for prevNext, prevAll, nextAll, nextUntil etc
 *
 * @param {Array} arr
 * @param {String} dir
 * @param {string} until
 * @param {String} selector
 *
 * @return {Object}
 *
 */
function doomed(arr, dir, until, selector) {

    var matched = hAzzle.map(arr, function (elem, i, until) {
        return hAzzle.nodes(elem, dir, until);
    }, until);


    if (selector && typeof selector === "string") {
        matched = hAzzle.select(selector, null, null, matched);
    }

    if (this.length > 1) {
        hAzzle.unique(matched);
        matched.reverse();
    }

    return hAzzle(matched);
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
    return hAzzle(ret);
}

function getIndex(selector, index) {

    var type = typeof index;

    if (selector === undefined && type !== "number") {

        return 0;

    } else if (typeof selector === "number") {

        return selector;

    } else if (type === "number") {

        return index;

    } else {

        return null;
    }
}

/**
 * Traverse multiple DOM elements
 */

function traversing(el, property, selector, index, expression) {

    // Find our position in the DOM tree

    index = getIndex(selector, index);

    var i,
        isString,
        ret = [];

    return collect(el, function (el, elind) {

        i = index || 0;
        isString = typeof selector === "string" ? selector : '*';


        if (!expression) {

            el = el[property];
        }

        // Always skip document fragments

        while (el && (index === null || i >= 0) && el.nodeType < 11) {

            if (el.nodeType === 1 && (!expression || expression === true || expression(el, elind)) && hAzzle.matches(isString, el) && (index === null || i-- === 0)) {

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

    if (index < 0) {
        index = length + index;
    }

    if (index < 0 || index >= length) {
        return null;
    }
    return !index && index !== 0 ? def : index;
}

/**
 * Filter function, for use by filter(), is() & not()
 */

function filtered(callback) {
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
     * Create an array of selected selectors
     */

    toArray: function () {
        return slice.call(this);
    },


    /**
     * Find the first matched element by css selector
     *
     * @param {String|Object} selector
     * @return {Object}
     *
     */

    find: function (selector) {
        var i = 0,
            len = this.length,
            ret = [],
            self = this;

        // String

        if (typeof selector === "string") {

            for (; i < len; i++) {
                hAzzle.select(selector, self[i], ret);
            }

            // Make sure that the results are unique

            return hAzzle(len > 1 ? hAzzle.unique(ret) : ret);

        } else { // Object

            return hAzzle(selector).filter(function () {
                for (; i < len; i++) {
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

    index: function (selector) {

        // No argument, return index in parent
        if (!selector) {
            return (this[0] && this[0].parentNode) ? this.parent().children().indexOf(this[0]) : -1;
        }

        // index in selector

        if (typeof selector === "string") {
            return Array.prototype.indexOf.call(hAzzle(selector), this[0]);
        }

        return this.indexOf(hAzzle(selector)[0]);
    },


    /**
     * Returns element's first descendant (or the Nth descendant, if index is specified)
     * that matches expression.
     */

    down: function (selector, index) {

        // Locate where we are in the DOM tree

        index = getIndex(selector, index);

        return collect(this, function (el) {

            var f = hAzzle.select(typeof selector === 'string' ? selector : '*', el);

            if (index === null) {

                return f;

            } else {

                return [f[index]] || [];

            }
        });
    },
    /**
     * Returns element's first ancestor (or the Nth ancestor, if index is specified)
     * that matches expression
     */

    up: function (selector, index) {
        return traversing(this, 'parentNode', selector, index);
    },

    /**
     * Get immediate parents of each element in the collection.
     * If CSS selector is given, filter results to include only ones matching the selector.
     *
     * @param {String} selector
     * @return {hAzzle}
     */

    parent: function (selector) {
        var parent,
            matched = hAzzle.map(this, function (elem) {
                if ((parent = elem.parentNode)) {
                    if (parent.nodeType !== 11) {
                        return parent;
                    }
                    return null;
                }
            });

        if (selector && typeof selector === "string") {
            matched = hAzzle.select(selector, null, null, matched);
        }
        if (this.length > 1) {

            hAzzle.unique(matched);
        }
        return hAzzle(matched);
    },

    parents: function () {
        return this.up.apply(this, arguments.length ? arguments : ['*']);
    },

    parentsUntil: function (until, selector) {
        return doomed(this, "parentNode", until, selector);
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
        if (typeof selector === 'number') {
            index = selector;
            selector = '*';
        } else {
            index = 0;
        }
        return traversing(this, 'parentNode', selector, index, true);
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
        return traversing(this, 'previousSibling', selector, index);

    },

    prevAll: function () {
        return doomed(this, "previousSibling");
    },


    prevUntil: function (until, selector) {
        return doomed(this, "previousSibling", until, selector);
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
        return traversing(this, 'nextSibling', selector, index);
    },

    nextAll: function () {
        return doomed(this, "nextSibling");
    },

    nextUntil: function (until, selector) {
        return doomed(this, "nextSibling", until, selector);
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

        return traversing(arr, 'nextSibling', selector || '*', index, function (el, i) {
            return el !== self[i];
        });
    },

    /**
     * Get all siblings - previousSibling and nextSibling
     */

    siblingsAll: function () {

        var p, r = [],
            i = 0,
            l = this.length;

        for (; i < l; i++) {

            p = this[i];

            while ((p = p.previousSibling)) {

                if (p.nodeType == 1) {

                    r.push(p);
                }
            }
            p = this[i];

            while ((p = p.nextSibling)) {

                if (p.nodeType == 1) {

                    r.push(p);
                }
            }
        }
        return hAzzle(r);
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
        var self = this;
        return traversing(self.down.call(self), 'nextSibling', selector || '*', index, true);


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
        return this[eqIndex(this.length, index, 0)];
    },


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
        return hAzzle(hAzzle.filter(this, filtered(callback)));
    },

    /**
     * Remove elements from the set of matched elements.
     *
     * @param {String} selector
     * @return {hAzzle}
     *
     */

    not: function (selector) {
        return hAzzle.filter(this, function (elem) {
		// Call our matchesselector.js module directly
            return !hAzzle.matches(selector, elem);
        });
    },

    /**
     * Reduce the set of matched elements to those that have a descendant that matches the selector or DOM element.
     *
     * @param {String} selector
     * @return {hAzzle}
     *
     */

    has: function (selector) {
        return hAzzle(hAzzle.filter(
            this, selector.nodeType === 1 ? function (el) {
                return hAzzle.contains(selector, el);
            } : typeof selector === 'string' && selector.length ? function (el) {
                return hAzzle.select(selector, el).length;
            } : function () {
                return false;
            }
        ));
    },

    contains: function (target) {
        return this.has(target).length > 0;
    },

    /**
     * Check if the first element in the element collection matches the selector
     * Some people asked about this, so note that this function only return
     * a boolean so quick-return after first successful find.
     * And are different from hAzzle / Zepto is().
     *
     * @param {String} selector
     * @return {Boolean}
     */

    is: function (selector) {

        var i = 0,
            l = this.length,
            fn = filtered(selector);

        for (; i < l; i++) {
            if (fn(this[i], i)) {
                return true;
            }
        }
        return false;
    },

    and: function (s) {

        var plus = hAzzle(s),
            i = this.length,
            j = 0,
            l = this.length + plus.length;

        for (; i < l; i++, j++) {

            this[i] = plus[j];
        }

        this.length += plus.length;

        return this;
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

    size: function () {
        return this.length;
    },

    contents: function () {

        var matched = hAzzle.map(this, function (elem) {
            return elem.contentDocument || hAzzle.merge([], elem.childNodes);
        });

        if (this.length > 1) {
            hAzzle.unique(matched);
        }
        return hAzzle(matched);
    },

    // Internal usage only

    push: emptyArray.push,
    sort: emptyArray.sort,
    splice: emptyArray.splice,
    reverse: emptyArray.reverse,
    concat: emptyArray.concat,
    indexOf: emptyArray.indexOf
});