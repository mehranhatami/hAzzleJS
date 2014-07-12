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

    /**
     * Reduce the set of matched elements to the final one in the set,
     * OR to the last Nth elements, if index is specified
     *
     * @param {Number} index
     * @return {hAzzle}
     */

    last: function (index) {
        return index ? this.slice(this.length - index) : this[this.length - 1];
    },

    /**
     * Reduce the set of matched elements to the first in the set,
     * OR to the first Nth elements, if index is specified
     *
     * @param {Number} index
     * @return {hAzzle}
     */


    first: function (index) {
        return hAzzle(index ? this.slice(0, index) : this[0]);
    },

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

        if (num === null) {
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

        // No argument, return index in parent

        if (!selector) {

            return (this[0] && this[0].parentElement) ? this.first().prevAll().length : -1;
        }

        // index in selector

        if (typeof selector === "string") {

            return indexOf.call(hAzzle(selector), this[0]);
        }

        // Locate the position of the desired element

        return indexOf.call(this, selector);
    },

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
    // New DOM Traversal API functions for hAzzle
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

    parent: function (elem) {
        var parent = elem.parentElement;
        return parent && parent.nodeType !== 11 ? parent : null;
    },
    parents: function (elem) {
        return hAzzle.dir(elem, "parentNode");
    },
    parentsUntil: function (elem, i, until) {
        return hAzzle.dir(elem, "parentNode", until);
    },
    siblings: function (elem) {
        return hAzzle.sibling(elem.parentElement, elem);
    },
    children: function (elem) {
        return hAzzle.sibling(elem, true);
    },
    next: function (elem) {
        return elem.nextElementSibling;
    },
    prev: function (elem) {
        return elem.previousElementSibling;
    },
    nextAll: function (elem) {
        return hAzzle.dir(elem, "nextElementSibling");
    },
    prevAll: function (elem) {
        return hAzzle.dir(elem, "previousElementSibling");
    },
    nextUntil: function (elem, i, until) {

        return hAzzle.dir(elem, "nextElementSibling", until);
    },
    prevUntil: function (elem, i, until) {

        return hAzzle.dir(elem, "previousElementSibling", until);
    },
    contents: function (elem) {
        return elem.contentDocument || hAzzle.merge([], elem.childNodes);
    }
}, function (fn, name) {

    hAzzle.Core[name] = function (until, selector) {

        var matched = map(this, fn, until);
        //        var matched = hAzzle.map(this, fn, until);

        if (name.slice(-5) !== 'Until') {
            selector = until;
        }

        if (selector && typeof selector === 'string') {
            matched = hAzzle.matches(selector, matched);
        }

        if (this.length > 1) {
            // Remove duplicates
            if (!guaranteedUnique[name]) {
                console.log("BILAT!!");
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