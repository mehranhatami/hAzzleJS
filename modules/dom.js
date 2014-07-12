/*!
 * DOM walker & getters
 */
var win = this,
    doc = win.document,
    html = hAzzle.docElem,

    indexOf = Array.prototype.indexOf,
    slice = Array.prototype.slice,
    slice = Array.prototype.slice,
    concat = Array.prototype.concat,

    // Use the Element Traversal API if available.

    nextElement = 'nextElementSibling',
    previousElement = 'previousElementSibling',
    parentElement = 'parentElement';

var rparentsprev = /^(?:parents|prev(?:Until|All))/,

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




    closest: function (selector, index) {
        typeof selector === 'number' ? (index = selector, selector = "*") : index = index || 0;
        return walkElements(this, parentNode, selector, index, true);
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

function walkElements(els, method, selector, index, filterFn) {
    index = getIndex(selector, index);
    selector = getSelector(selector);
    return collect(els, function (el, elind) {
        var i = index || 0,
            ret = [];
        if (!filterFn)
            el = el[method];
        while (el && (index === null || i >= 0)) {
            // ignore non-elements, only consider selector-matching elements
            // handle both the index and no-index (selector-only) cases
            if (hAzzle.isElement(el) && (!filterFn || filterFn === true || filterFn(el, elind)) && hAzzle.matches(selector, el) && (index === null || i-- === 0)) {
                // this concat vs push is to make sure we add elements to the result array
                // in reverse order when doing a previous(selector) and up(selector)
                index === null && method != 'nextElementSibling' && method != 'parentNode' ? ret.unshift(el) : ret.push(el);
            }
            el = el[method];
        }
        return ret;
    });
}

// for each element of 'els' execute 'fn' to get an array of elements to collect
function collect(els, fn) {
    var ret = [],
        res, i = 0,
        j, l = els.length,
        l2;
    while (i < l) {
        j = 0;
        l2 = (res = fn(els[i], i++)).length;
        while (j < l2)
            ret.push(res[j++]);
    }
    return hAzzle(ret);
}


// figure out which argument, if any, is our 'selector'
function getSelector(selector) {
    return isString(selector) ? selector : '*';
}