/*!
 * DOM traversing
 */
var arr = [],
    slice = arr.slice,
    push = arr.push,
    indexOf = arr.indexOf,

    isString = hAzzle.isString,

    // support W3C ElementTraversal interface

    firstNode = 'firstChild',
    nextNode = 'nextSibling',
    prevNode = 'previousSibling',
    parentNode = 'parentNode',

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
     * @param {string} selector
     * @param {number} index
     * @return {hAzzle}
     */

    down: function (selector, index) {

        // Try to figure out where in DOM we are

        index = getIndex(selector, index);

        var node = isString(selector) ? selector : '*',
            obj;

        return collect(this, function (el) {

            obj = hAzzle.select(node, el);

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
     */

    up: function (selector, index) {
        return selector === null ? parent() : getNth(this, parentNode, selector, index);
    },

    /**
     * Parents
     */

    parents: function () {
        return this.up.apply(this, arguments.length ? arguments : ['*']);
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
        typeof selector === 'number' ? (index = selector, selector = "*") : index = index || 0;
        return getNth(this, parentNode, a, b, !0)
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
        return getNth(this, prevNode, selector, index);

    },

    // Some people are most used to 'previous' then 'prev, so
    // we are going to make them happy

    previous: function () {
        return this.prev(this.arguments);
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
        return getNth(this, nextNode, selector, index);
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
            arr[i] = arr[i][parentNode][firstNode];
            while (arr[i].nodeType !== 1) {
                arr[i] = arr[i][nextNode];
            }
        }

        return getNth(arr, nextNode, selector || '*', index, function (el, i) {
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
        return getNth(this.down.call(this), nextNode, selector || '*', index, true);
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

    slice: function () {
        return hAzzle(slice.apply(this, arguments));
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
 * Traverse multiple DOM elements
 */

function getNth(el, property, selector, index, fn) {

    // Find our position in the DOM tree

    index = getIndex(selector, index);

    var i,
        isString,
        ret = [];

    return collect(el, function (el, elind) {

        i = index || 0;
        isString = typeof selector === 'string' ? selector : '*';


        if (!fn) {

            el = el[property];
        }

        // Don't run this loop if this is an document fragment

        while (el && (index === null || i >= 0) && el.nodeType !== 11) {

            if (el.nodeType === 1) {

                if ((!fn || fn === true || fn(el, elind)) && hAzzle.matches(isString, el) && (index === null || i-- === 0)) {

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

hAzzle.dir = function (elem, dir, until) {
    var matched = [],
        truncate = until !== undefined;

    while ((elem = elem[dir]) && elem.nodeType !== 9) {
        if (elem.nodeType === 1) {
            if (truncate && hAzzle(elem).is(until)) {
                break;
            }
            matched.push(elem);
        }
    }
    return matched;
};


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
            matched = hAzzle.select(selector, null, null, matched);
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
