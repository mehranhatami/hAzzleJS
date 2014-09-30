// traversing.js
var tMethods = /^(?:parents|prev(?:Until|All))/,
    indexOf = Array.prototype.indexOf,
    preservesUniquenessAndOrder = {
        children: 1,
        contents: 1,
        next: 1,
        prev: 1
    },

    traverse = function(elem, dir, until) {
        var matched = [],
            cur = elem[dir];
        while (cur && cur !== document) {
            if (typeof until !== 'undefined' && hAzzle(cur).is(until)) {
                break;
            }
            matched.push(cur);
            cur = cur[dir];
        }
        return matched;
    },

    sibling = function(elem, skip) {

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
    },

    isnot = function(els, selector, not) {
        var type = typeof selector;
        if (type === 'string') {
            selector = hAzzle.matches(selector, els);
            return hAzzle.grep(els, function(elem) {
                return (indexOf.call(selector, elem) >= 0) !== not;
            });
        }
        return type === 'function' ?
            hAzzle.grep(els, function(elem, i) {
                return !!selector.call(elem, i, elem) !== not;
            }) : selector.nodeType ?
            hAzzle.grep(els, function(elem) {
                return (elem === selector) !== not;
            }) : hAzzle.grep(els, function(elem) {
                return (indexOf.call(selector, elem) >= 0) !== not;
            });

    };

hAzzle.extend({

    /**
     * Adds one element to the set of matched elements.
     *
     * @param {String} selector
     * @param {String} context
     * @return {hAzzle}
     */

    join: function(selector, context) {
        return hAzzle(
            // Make unique
            hAzzle.unique(
                hAzzle.merge(this.get(), hAzzle(selector, context))
            )
        );
    },

    /**
     * Reduce the set of matched elements to the first in the set,
     * OR to the first Nth elements, if index is specified
     *
     * @param {Number} index
     * @return {hAzzle}
     *
     * @param {Number} index
     * @return {hAzzle}
     *
     * The index starts to count from left to right.
     *
     * Example:
     *
     *  hAzzle('li').first() - will return the first li elem
     *
     *  hAzzle('li').first(2) - will return the first 2 li elems
     *
     */

    first: function(index) {
        return index ? this.slice(0, index) : this.eq(0);
    },

    /**
     * Reduce the set of matched elements to the finale one in the set,
     * OR to the last Nth elements, if index is specified
     *
     * @param {Number} index
     * @return {hAzzle}
     *
     * The index starts to count from right to left.
     *
     * Example:
     *
     *  hAzzle('li').last() - will return the last li elem
     *
     *  hAzzle('li').last(2) - will return the last 2 li elems
     *
     */

    last: function(index) {
        return index ? this.slice(this.length - index) : this.eq(-1);
    },

    /**
     * Reduce the set of matched elements to a subset specified by a range of indices.
     *
     * @param {Integer} start
     * @param {Integer} end
     */

    slice: function() {
        return hAzzle(slice.apply(this, arguments));
    },

    /**
     * Reduce the set of matched elements to the one at the specified index.
     * @param {number} index
     * @return {hAzzle}
     */

    eq: function(i) {
        var _this = this;
        i = +i;

        // Use the first identity optimization if possible

        if (i === 0 && _this.length <= i) {
            return _this;
        }

        if (i < 0) {
            i = _this.length + i;
        }

        return hAzzle(_this[i] ? _this[i] : []);
    },

    toArray: function() {
        return slice.call(this);
    },

    /**
     * Retrieve the DOM elements matched by the hAzzle object as an array.
     *
     * @param {Integer} index
     * @return {hAzzle|Array}
     *
     */

    get: function(index) {
        var result, _this = this;
        if (index === undefined) {
            result = slice.call(_this, 0);
        } else if (index < 0) {
            result = _this[_this.length + index];
        } else {
            result = _this[index];
        }

        return result;
    },

    /**
     * Reduce the set of matched elements to those that match the selector or pass
     * the function's test, optionally returned in reverse order
     *
     * @param {String} selector
     * @param {Boolean} rev
     * @return {hAzzle}
     */

    filter: function(selector, rev) {
        var res = isnot(this, selector || [], false);
        return hAzzle(rev ? res.reverse() : res);
    },

    /**
     * Remove elements from the set of matched elements.
     *
     * @param {String} selector
     * @return {hAzzle}
     *
     */

    exclude: function(selector) {
        return hAzzle(isnot(this, selector || [], true));
    },

    /**
     * Check if the first element in the element collection matches the selector
     *
     * @param {String} selector
     * @return {Boolean}
     */

    is: function(selector) {
        return !!isnot(
            this,
            typeof selector === 'string' && eoeglnfl.test(selector) ?
            hAzzle(selector) :
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

    has: function(target) {
        var targets = hAzzle(target, this),
            l = targets.length,
            i;
        return this.filter(function() {
            i = 0;
            for (; i < l; i++) {
                if (hAzzle.contains(this, targets[i])) {
                    return true;
                }
            }
        });
    },

    // Alias for 'has()'	

    hasDescendant: function() {
        return this.has.apply(this, arguments);
    },

    /** Determine the position of an element within the matched set of elements
     *
     * @param {string} selector
     * @return {hAzzle}
     */

    index: function(selector) {

        var haystack, needle;

        if (!selector) {

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

        return indexOf.call(this,
            selector.hAzzle ? selector[0] : selector
        );
    },

    /**
     * Get the element that matches the selector, beginning at the current
     * element and progressing up through the DOM tree.
     *
     * @param {String} selectors
     * @param {String} context
     * @return {hAzzle}
     */

    closest: function(selector, context) {
        var cur,
            i = 0,
            l = this.length,
            ret = [],
            pos = eoeglnfl.test(selector) || typeof selector !== "string" ?
            hAzzle(selector, context) :
            0;

        for (; i < l; i++) {

            for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
                // Always skip document fragments
                if (cur.nodeType < 11 && (pos ?
                    pos.index(cur) > -1 :

                    cur.nodeType === 1 &&
                    hAzzle.matchesSelector(cur, selector))) {

                    ret.push(cur);
                    break;
                }
            }
        }

        return hAzzle(ret.length > 1 ? hAzzle.unique(ret) : ret);
    },

    /**
     * Find the first element(s) that matches the selector by traversing down
     * through its descendants in the DOM tree level by level.
     *
     * @param {String|Object} selector
     * @return {hAzzle}
     *
     */

    closestChild: function(selector) {

        if ((typeof selector === 'string' ||
            typeof selector === 'object') && selector !== '') {

            var queue = [],
                node, children, i = 0,
                child;

            queue.push(this);

            while (queue.length > 0) {

                node = queue.shift();

                children = node.children();

                for (; i < children.length; ++i) {

                    child = hAzzle(children[i]);

                    // We find the child, stop processing

                    if (child.is(selector)) {

                        return child;
                    }

                    queue.push(child); //go deeper
                }
            }
        }
        // If no selector, return all nodes
        return this;
    },

    find: function(selector) {
        var i,
            len = this.length,
            ret = [],

            self = this;

        // String

        if (typeof selector === 'string') {

            // Loop through all elements, and check for match

            for (i = 0; i < len; i++) {
                push.apply(ret, hAzzle.find(selector, self[i]));
            }

            // If more then one element, make sure they are unique

            return hAzzle(len > 1 ? hAzzle.unique(ret) : ret);

        } else { // Object

            return hAzzle(selector).filter(function() {
                for (i = 0; i < len; i++) {
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

    parentElement: function() {
        return this.parent().children();
    },
    firstElementChild: function() {
        return this.children().first();
    },

    lastElementChild: function() {
        return this.children().last();
    },

    previousElementSibling: function() {
        return this.prev().last();
    },

    nextElementSibling: function() {
        return this.next().first();
    },

    childElementCount: function() {
        return this.children().length;
    }
});

hAzzle.each({

    /**
     * Get the parent of each element in the current set of matched
     * elements, optionally filtered by a selector.
     */

    parent: function(elem) {
        var parent = elem.parentElement;
        return parent && parent.nodeType !== 11 ? parent : null;
    },

    /**
     * Get the ancestors of each element in the current set of matched
     *elements, optionally filtered by a selector.
     */

    parents: function(elem) {
        return traverse(elem, 'parentElement');
    },

    /**
     * Get the ancestors of each element in the current set of matched elements, up to
     * but not including the element matched by the selector, DOM node, or hAzzle object.
     */

    parentsUntil: function(elem, i, until) {
        return traverse(elem, 'parentElement', until);
    },

    /**
     * Get the immediately following sibling of each element
     *
     * @param {Object} elem
     * @return {hAzzle}
     */

    next: function(elem) {
        return elem && elem.nextElementSibling;
    },

    /**
     * Get the immediately preceding sibling of each element
     * in the set of matched  elements, optionally filtered by a
     * selector.
     *
     * @param {Object} elem
     * @return {hAzzle}
     */

    prev: function(elem) {
        return elem && elem.previousElementSibling;
    },

    /**
     * Get the siblings of each element in the set of matched elements, optionally
     * filtered by a selector.
     */

    siblings: function(elem) {
        return sibling(elem.parentElement, elem);
    },

    /**
     * Get the children of each element in the set of matched elements, optionally
     * filtered by a selector.
     */

    children: function(elem) {
        return elem && sibling(elem, true);
    },

    /**
     * Get the children of each element in the set of matched elements,
     * including text and comment nodes.
     */

    childrenAll: function(elem) {
        return elem.contentDocument ||
            hAzzle.merge([], elem.childNodes);
    },

    /**
     * Get all following siblings of each element in the set of matched
     * elements, optionally filtered by a selector.
     */

    nextAll: function(elem) {
        return traverse(elem, 'nextElementSibling');
    },

    /**
     * Get all preceding siblings of each element in the set of matched elements
     * optionally filtered by a selector.
     */

    prevAll: function(elem) {
        return traverse(elem, 'previousElementSibling');
    },

    /**
     * Get all following siblings of each element up to but not including the
     * element matched by the selector, DOM node, or jQuery object passed.
     */

    nextUntil: function(elem, i, until) {
        return traverse(elem, 'nextElementSibling', until);
    },

    /**
     * Get all preceding siblings of each element up to but not including the
     * element matched by the selector, DOM node, or hAzzle object.
     */

    prevUntil: function(elem, i, until) {
        return traverse(elem, 'previousElementSibling', until);
    }

}, function(fn, name) {

    hAzzle.Core[name] = function(until, selector) {
        var matched = hAzzle.map(this, function(elem) {
            var type = elem.nodeType;
            if (type === 1 ||
                type === 11 ||
                type === 9) {
                return fn.apply(this, arguments);
            }
        }, until);

        if (name.slice(-5) !== 'Until') {
            selector = until;
        }

        if (selector && typeof selector === 'string') {
            matched = hAzzle.matches(selector, matched);
        }

        if (this.length > 1) {
            // Remove duplicates
            if (!preservesUniquenessAndOrder[name]) {
                hAzzle.unique(matched);
            }

            if (tMethods.test(name)) {

                matched.reverse();
            }
        }

        return hAzzle(matched);
    };
});

// Aliases

hAzzle.each({
    'reject': 'exclude',
    'not': 'exclude',
    'discard': 'exclude',
    'add': 'join',
    'concat': 'join',
    'search': 'find',
    'hasDescendant': 'has'

}, function(original, prop) {
    hAzzle.Core[prop] = function() {
        return this[original].apply(this, arguments);
    };
});