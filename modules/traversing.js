/*!
 * DOM traversing
 */
var arr = [],
    slice = arr.slice,
    push = arr.push,
    indexOf = arr.indexOf,
    isString = hAzzle.isString,

    // hAzzle are using the new Element Traversal API

    firstNode = 'firstElementChild',
    nextNode = 'nextElementSibling',
    prevNode = 'previousElementSibling',
    parentNode = 'parentElement',

    rparentsprev = /^(?:parents|prev(?:Until|All))/,

    // Methods guaranteed to produce a unique set when starting from a unique set

    guaranteedUnique = {
        children: true,
        contents: true,
        next: true,
        prev: true
    };

// Extend the Core

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

        if (isString(selector)) {

            // Loop through all elements, and check for match

            for (; i < len; i++) {

                hAzzle.select(selector, self[i], ret);
            }

            // If more then one element, make sure they are unique

            if (len > 1) {

                ret = hAzzle.unique(ret);
            }
            return hAzzle(ret);

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

            return (this[0] && this[0][parentNode]) ? this.parent().children().indexOf(this[0]) : -1;
        }

        // index in selector

        if (typeof selector === "string") {
            return indexOf.call(hAzzle(selector), this[0]);
        }

        return this.indexOf(selector[0]);
    },

    /**
     * Returns element's first descendant (or the Nth descendant, if
     * index is specified) that matches expression.
     *
     * @param {Number/String/Object} selector
     * @param {Number/Undefined} index
     * @return {hAzzle}
     */


    down: function (selector, index) {

        index = getIndex(selector, index);

        var obj;

        return collect(this, function (el) {

            obj = hAzzle.select(isString(selector) ? selector : '*', el);

            if (index === null) {

                return obj;

            } else {

                return [obj[index]] || [];

            }
        });
    },

    /**
     * Returns element's first ancestor (or the Nth ancestor, if index is specified)
     * that matches expression
     *
     * @param {Number/String/Object} selector
     * @param {Number/Undefined} index
     * @return {hAzzle}
     */

    up: function (selector, index) {
        return selector === null ? parent() : walkElements(this, parentNode, selector, index);
    },

    /**
     * Parents
     */

    parents: function () {
        return this.up.apply(this, arguments.length ? arguments : ['*']);
    },

    /**
     * Get the element that matches the selector, beginning at the current
     * element and progressing up through the DOM tree. OR the closest
     * Nth elements if index is specified
     *
     * @param {String} selector
     * @param {Number} index
     * @return {hAzzle}
     */

    closest: function (selector, index) {
        typeof selector === 'number' ? (index = selector, selector = "*") : index = index || 0;
        return walkElements(this, parentNode, selector, index, true);
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
        return walkElements(this, prevNode, selector, index);

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
        return walkElements(this, nextNode, selector, index);
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
            arr = slice.call(self, 0),
            i = arr.length;
        while (i--) {
            arr[i] = arr[i][parentNode][firstNode];
        }
        return walkElements(arr, nextNode, selector || '*', index, function (el, i) {
            return el !== self[i];
        });
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
        return walkElements(this.down.call(this), nextNode, selector || '*', index, true);
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

    // Need to wrap it inside hAzzle() so we get the
    // Prototype attached to it

    slice: function () {
        return hAzzle(slice.apply(this, arguments));
    },

    filter: function (callback) {
        return hAzzle.filter(this, filtered(callback));
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
    firstElementChild: function () {
        return this.children().first();
    },

    lastElementChild: function () {
        return this.children().last();
    },

    previousElementSibling: function () {
        return this.prev().last();
    },

    nextElementSibling: function () {
        return this.next().first();
    },

    childElementCount: function () {
        return this.children().length;
    },


    // Internal usage only

    push: arr.push,
    sort: arr.sort,
    splice: arr.splice,
    reverse: arr.reverse,
    concat: arr.concat,
    indexOf: arr.indexOf
});


/* =========================== PRIVATE FUNCTIONS ========================== */

/*
 * Collect elements
 */

function collect(el, fn) {

    var ret = [],
        res,
        b = 0,
        e,
        len = el.length,
        f;

    for (; b < len;) {
        res = fn(el[b], b++);
        e = 0;
        f = res.length;
        for (; e < f;) {
            ret.push(res[e++]);
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
 * Element traversing support
 */

function walkElements(el, property, selector, pos, fn) {

    var index = getIndex(selector, pos),
        i, ret = [];

    return collect(el, function (el, elind) {

        i = index || 0;

        if (!fn) el = el[property];

        // Don't run this loop if this is an document fragment

        while (el && (index === null || i >= 0) && el.nodeType !== 11) {

            if (el.nodeType === 1) {

                if ((!fn || fn === true || fn(el, elind)) && hAzzle.matches(isString(selector) ? selector : '*', el) && (index === null || i-- === 0)) {

                    if (index === null && property !== nextNode && property !== parentNode) {

                        ret.unshift(el);

                    } else {

                        ret.push(el);
                    }
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

hAzzle.extend({

    dir: function (elem, dir, until) {
        var matched = [],
            truncate = until !== undefined;
        while ((elem = elem[dir]) && elem !== document) {
            if (truncate && hAzzle(elem).is(until)) {
                break;
            }
            matched.push(elem);
        }
        return matched;
    },

    sibling: function (elem, skip) {
        var ret = [],
            tmp = elem.children,
            i = 0,
            l = tmp.length;
        if (skip) {
            for (; i < l; i++) {
                if (tmp[i] !== skip) {
                    ret.push(tmp[i]);
                }
            }
        }

        return ret;
    }
}, hAzzle);

hAzzle.forOwn({
    parent: function (elem) {
        var parent = elem[parentNode];
        return parent && parent.nodeType !== 11 ? parent : null;
    },
    parentsUntil: function (elem, i, until) {
        return hAzzle.dir(elem, parentNode, until);
    },
    nextAll: function (elem) {
        return hAzzle.dir(elem, nextNode);
    },
    prevAll: function (elem) {
        return hAzzle.dir(elem, prevNode);
    },
    nextUntil: function (elem, i, until) {
        return hAzzle.dir(elem, nextNode, until);
    },
    contents: function (elem) {
        return elem.contentDocument || hAzzle.merge([], elem.childNodes);
    },
    prevUntil: function (elem, i, until) {
        return hAzzle.dir(elem, prevNode, until);
    },
}, function (fn, name) {

    hAzzle.Core[name] = function (until, selector) {

        var matched = hAzzle.map(this, fn, until);

        if (name.slice(-5) !== 'Until') {
            selector = until;
        }

        if (selector && isString(selector)) {
            matched = hAzzle.matches(selector, matched);
        }

        if (this.length > 1) {
            // Remove duplicates
            if (!guaranteedUnique[name]) {

                hAzzle.unique(matched);
            }

            // Reverse order for parents* and prev-derivatives
            if (rparentsprev.test(name)) {

                matched.reverse();
            }
        }

        return hAzzle(matched);
    };
});