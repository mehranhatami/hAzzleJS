/*!
 * DOM walker & getters
 */
var arrayProto = Array.prototype,
    indexOf = arrayProto.indexOf,
    slice = arrayProto.slice,
    concat = arrayProto.concat,

    rparentsprev = /^(?:parents|prev(?:Until|All))/,

    // Methods guaranteed to produce a unique set when starting from a unique set

    guaranteedUnique = {
        children: true,
        contents: true,
        next: true,
        prev: true
    },

    /**
     * Optimized map method for selector filtering
     *
     * @param {Array} arr
     * @param {Function} fn
     * @param {String} scope
     * @param {hAzzle}
     *
     */
    map = function (arr, fn, scope) {
        var value,
            i = arr.length,
            ret = [];
        while (i--) {

            value = fn(arr[i], i, scope);

            if (value !== null) {
                ret.push(value);
            }
        }
        // Flatten any nested arrays
        return concat.apply([], ret);
    };

// Extend the core

hAzzle.extend({

    contains: function (target) {
        return this.has(target).length > 0;
    },

    /**
     * Adds one element to the set of matched elements.
     *
     * @param {String} selector
     * @param {String} context
     * @return {hAzzle}
     */

    add: function (other, context) {
        var selection = hAzzle(other, context),
            contents = hAzzle.unique(selection.get().concat(this.get())),
            i = 0,
            l = contents.length;

        for (; i < l; ++i) {
            selection[i] = contents[i];
        }
        selection.length = contents.length;

        return selection;
    },

    /**
     * Reduce the set of matched elements to the final one in the set,
     * OR to the last Nth elements, if index is specified
     *
     * @param {Number} index
     * @return {hAzzle}
     */

    last: function (index) {

        return index ? this.slice(this.length - index) : this.eq(2);
    },

    /**
     * Reduce the set of matched elements to the first in the set,
     * OR to the first Nth elements, if index is specified
     *
     * @param {Number} index
     * @return {hAzzle}
     */

    first: function (index) {

        return index ? this.slice(0, index) : this.eq(0);
    },

    /**
     * Reduce the set of matched elements to a subset specified by a range of indices.
     */

    slice: function () {

        return hAzzle(slice.apply(this, arguments));
    },

    /**
     * Reduce the set of matched elements to the one at the specified index.
     * @param {number} index
     * @return {hAzzle}
     */

    eq: function (index) {

        index = +index;

        // Use the first identity optimization if possible

        if (index === 0 && this.length <= index) return this;

        if (index < 0) index = this.length + index;

        return this[index] ? hAzzle(this[index]) : hAzzle([]);

    },

    toArray: function () {
        return slice.call(this);
    },

    // Get the Nth element in the matched element set OR
    // Get the whole matched element set as a clean array

    get: function (num) {
        if (!num) {
            return slice.call(this);
        } else {
            return this[num < 0 ? (this.length + num) : num];
        }
    },


    filter: function (selector) {
        return hAzzle(isnot(this, selector || [], false));
    },

    /**
     * Remove elements from the set of matched elements.
     *
     * @param {String} selector
     * @return {hAzzle}
     *
     */

    not: function (selector) {
        return hAzzle(isnot(this, selector || [], true));
    },

    /**
     * Check if the first element in the element collection matches the selector
     *
     * @param {String} selector
     * @return {Boolean}
     */

    is: function (selector) {
        return !!isnot(
            this,
            selector || [],
            false
        ).length;
    },

    /**
     * Reduce the set of matched elements to those that have a descendant that matches the selector or DOM element.
     *
     * @param {String} selector
     * @return {hAzzle}
     *
     */

    has: function (target) {
        var targets = hAzzle(target, this),
            l = targets.length;
        return this.filter(function () {
            var i = 0;
            for (; i < l; i++) {
                if (hAzzle.contains(this, targets[i])) {
                    return true;
                }
            }
        });
    },

    /** Determine the position of an element within the matched set of elements
     *
     * @param {string} elem
     * @param {return} Object
     */

    index: function (selector) {
        var haystack, needle;

        // No argument, return index in parent

        if (arguments.length === 0) {

            haystack = this.parentElement();
            needle = this[0];

            // index in selector

        } else if (typeof selector === 'string') {

            haystack = hAzzle(selector);
            needle = this[0];
        } else {

            haystack = this;

            needle = selector.length ? selector[0] : selector;
        }

        // Locate the position of the desired element
        return haystack.get().indexOf(needle);
    },

    /**
     * Get the element that matches the selector, beginning at the current
     * element and progressing up through the DOM tree.
     *
     * @param {String} selectors
     * @param {String} context
     * @return {hAzzle}
     */

    closest: function (selectors, context) {
        var cur,
            i = 0,
            l = this.length,
            matched = [],
            pos = typeof selectors !== "string" ?
            hAzzle(selectors, context || this.context) :
            0;

        for (; i < l; i++) {

            cur = this[i];

            while (cur && cur !== context && cur.nodeType !== 11) {
                if (pos ? pos.index(cur) > -1 : cur.nodeType === 1 && hAzzle.matches(cur, selectors)) {
                    matched.push(cur);
                    break;
                }
                cur = cur.parentElement;
            }
        }

        return hAzzle(matched.length > 1 ? hAzzle.unique(matched) : matched);
    },

    find: function (selector) {
        var i = 0,
            len = this.length,
            ret = [],
            self = this;

        // String

        if (typeof selector === 'string') {

            /**
             * For better performance, are we using
             * hAzzle.findOne() if we only need to find
             * one single element, with fallback to .
             * hAzzle.find() for multiple elements
             */

            if (len > 1) {

                // Loop through all elements, and check for match

                for (; i < len; i++) {

                    hAzzle.find(selector, self[i], ret);
                }

                // If more then one element, make sure they are unique

                ret = hAzzle.unique(ret);

            } else {

                ret = hAzzle.findOne(selector, self[0]);
            }

            // return the result

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

    /**
     * NOTE!! In the upcoming DOM level 4, the nextElementSibling and
     * previousElementSibling have been removed from the
     * 'documentType' for compatibility reasons.
     *
     * Therefor hAzzle choose to support this features with it's internal
     * API
     */

    parentElement: function () {
        return this.parent().children();
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
    }
});

hAzzle.extend({
    dir: function (elem, dir, until) {
        var matched = [],
            cur = elem[dir],
            truncate = until !== undefined;

        while (cur && cur !== document) {
            if (truncate && hAzzle(cur).is(until)) {
                break;
            }
            matched.push(cur);
            cur = cur[dir];
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

    /**
     * Get the parent of each element in the current set of matched
     * elements, optionally filtered by a selector.
     */

    parent: function (elem) {
        var parent = elem.parentElement;
        return parent && parent.nodeType !== 11 ? parent : null;
    },

    /**
     * Get the ancestors of each element in the current set of matched
     *elements, optionally filtered by a selector.
     */

    parents: function (elem) {
        return hAzzle.dir(elem, "parentElement");
    },

    /**
     * Get the ancestors of each element in the current set of matched elements, up to
     * but not including the element matched by the selector, DOM node, or hAzzle object.
     */

    parentsUntil: function (elem, i, until) {
        return hAzzle.dir(elem, "parentElement", until);
    },

    /**
     * Get the siblings of each element in the set of matched elements, optionally
     * filtered by a selector.
     */

    siblings: function (elem) {
        return hAzzle.sibling(elem.parentElement, elem);
    },

    /**
     * Get the children of each element in the set of matched elements, optionally
     * filtered by a selector.
     */

    children: function (elem) {
        return hAzzle.sibling(elem, true);
    },

    /**
     * Get the immediately following sibling of each element
     *
     * @param {Object} elem
     * @return {hAzzle}
     */

    next: function (elem) {
        return elem.nextElementSibling;
    },

    /**
     * Get the immediately preceding sibling of each element
     * in the set of matched  elements, optionally filtered by a
     * selector.
     *
     * @param {Object} elem
     * @return {hAzzle}
     */

    prev: function (elem) {
        return elem.previousElementSibling;
    },

    /**
     * Get all following siblings of each element in the set of matched
     * elements, optionally filtered by a selector.
     */

    nextAll: function (elem) {
        return hAzzle.dir(elem, "nextElementSibling");
    },

    /**
     * Get all preceding siblings of each element in the set of matched elements
     * optionally filtered by a selector.
     */

    prevAll: function (elem) {
        return hAzzle.dir(elem, "previousElementSibling");
    },

    /**
     * Get all following siblings of each element up to but not including the
     * element matched by the selector, DOM node, or jQuery object passed.
     */

    nextUntil: function (elem, i, until) {

        return hAzzle.dir(elem, "nextElementSibling", until);
    },

    /**
     * Get all preceding siblings of each element up to but not including the
     * element matched by the selector, DOM node, or hAzzle object.
     */

    prevUntil: function (elem, i, until) {

        return hAzzle.dir(elem, "previousElementSibling", until);
    },

    /**
     * Get the children of each element in the set of matched elements,
     * including text and comment nodes.
     */

    contents: function (elem) {
        return elem.contentDocument || hAzzle.merge([], elem.childNodes);
    }
}, function (fn, name) {

    hAzzle.Core[name] = function (until, selector) {

        var matched = map(this, fn, until);

        if (name.slice(-5) !== 'Until') {
            selector = until;
        }

        if (selector && typeof selector === 'string') {
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


function isnot(elements, selector, not) {

    var type = typeof selector;

    if (type === "string") {
        selector = hAzzle.matches(selector, elements);
        return hAzzle.grep(elements, function (elem) {
            return (indexOf.call(selector, elem) >= 0) !== not;
        });
    }
    return type === 'function' ?
        hAzzle.grep(elements, function (elem, i) {
            return !!selector.call(elem, i, elem) !== not;
        }) : selector.nodeType ?
        hAzzle.grep(elements, function (elem) {
            return (elem === selector) !== not;
        }) : [];
}