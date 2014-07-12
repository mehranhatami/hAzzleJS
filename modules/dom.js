/*!
 * DOM walker & getters
 */
var win = this,
    doc = win.document,
    html = hAzzle.docElem,
    hasDuplicate = false,
    expando = "traversal" + -hAzzle.now(),

    indexOf = Array.prototype.indexOf,
    slice = Array.prototype.slice,

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

    map = function (arr, fn, scope) {
        var result = [],
            i = arr.length;
        while (i--) {
            result.push(fn.call(scope, arr[i], i));
        }
        return result;
    },

    sortOrder = function (a, b) {
        if (a === b) {
            hasDuplicate = true;
        }
        return 0;
    },

    domCore = {

        has: {
            'api-stableSort': expando.split("").sort(sortOrder).join("") === expando

        }


    };

// Extend the core

hAzzle.extend({

    last: function (index) {
        return index ? this.slice(this.length - index) : this[this.length - 1];
    },

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
        return hAzzle(filterFn(this, selector || [], false));
    },

    not: function (selector) {
        return hAzzle(filterFn(this, selector || [], true));
    },

    is: function (selector) {
        return !!filterFn(
            this,
            selector || [],
            false
        ).length;


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




hAzzle.uniqueSort = function (results) {
    var elem,
        duplicates = [],
        j = 0,
        i = 0,

        // Unless we *know* we can detect duplicates, assume their presence

        sortInput = !domCore.has['api-stableSort'] && results.slice(0);
    results.sort(sortOrder);

    if (hasDuplicate) {
        while ((elem = results[i++])) {
            if (elem === results[i]) {
                j = duplicates.push(i);
            }
        }
        while (j--) {
            results.splice(duplicates[j], 1);
        }
    }

    // Clear input after sorting to release objects
    // See https://github.com/jquery/sizzle/pull/225
    sortInput = null;

    return results;
};

function filterFn(elements, selector, not) {

    var type = typeof selector;

    if (type === "string") {
        selector = hAzzle.matches(selector, elements);
        return hAzzle.grep(elements, function (elem) {
            return (indexOf.call(selector, elem) >= 0) !== not;
        });
    }
    return type === 'function' ?
        hAzzle.grep(elements, function (elem, i) {
            return selector.call(elem, i, elem) !== not;
        }) : selector.nodeType ?
        hAzzle.grep(elements, function (elem) {
            return (elem === selector) !== not;

        }) : [];
}