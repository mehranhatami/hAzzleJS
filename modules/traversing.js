/*!
 * Traversing.js
 */
var cached = [],

    guaranteedUnique = {
        children: true,
        contents: true,
        next: true,
        prev: true
    },

     slice = Array.prototype.slice,
	push = Array.prototype.push;


hAzzle.extend(hAzzle.fn, {

    /**
     * Get the  element that matches the selector, beginning at the current element and progressing up through the DOM tree.
     *
     * @param {String} sel
     * @return {Object}
     */

    closest: function (sel, ctx) {
        return this.map(function (elem) {
            if (hAzzle.nodeType(1, elem) && elem !== ctx && !hAzzle.isDocument(elem) && hAzzle.find(elem, null, null, typeof sel === 'object' ? hAzzle(sel) : sel)) {
                return elem;
            }
            do {
                elem = elem['parentNode'];
            } while (elem && ((sel && !hAzzle.find(sel, null, null, elem)) || !hAzzle.isElement(elem)));
            return elem;
        });
    },

    /** Determine the position of an element within the matched set of elements
     *
     * @param {string} elem
     * @param {return} Object
     */

    index: function (elem) {
        return elem ? this.indexOf(hAzzle(elem)[0]) : this.parent().children().indexOf(this[0]) || -1;
    },

    /**
     *  Pick elements by tagNames from the "elems stack"
     *
     * @param {string} tag
     * @return {Object}
     */
    tags: function (tag) {
        return this.map(function (els) {
            if (els.tagName.toLowerCase() === tag && hAzzle.nodeType(1, els)) {
                return els;
            }
        });
    },

    /**
     * Adds one element to the set of matched elements.
     *
     * @param {String} sel
     * @param {String} ctx
     * @return {Object}
     */

    add: function (sel, ctx) {
        return this.concat(hAzzle(sel, ctx).elems);
    },

    /**
     * Reduce the set of matched elements to those that have a descendant that matches the selector or DOM element.
     */
    has: function (target) {

        var targets = hAzzle(target, this),
            i = 0,
            l = targets.length;

        return this.filter(function () {
            for (; i < l; i++) {
                if (hAzzle.contains(this, targets[i])) {
                    return true;
                }
            }
        });
    },

    /**
     * Remove elements from the set of matched elements.
     *
     * @param {String} sel
     * @return {Object}
     *
     */

    not: function (sel) {
        return this.filter(sel, true);
    },

    /**
     * Check if the first element in the element collection matches the selector
     *
     * @param {String|Object} sel
     * @return {Boolean}
     */

    is: function (sel) {
        return !!sel && (
            /^[\x20\t\r\n\f]*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\([\x20\t\r\n\f]*((?:-\d)?\d*)[\x20\t\r\n\f]*\)|)(?=[^-]|$)/i.test(sel) ?
            hAzzle(sel).index(this[0]) >= 0 :
            this.filter($(sel)).length > 0);
    },

    /**
     * Get immediate parents of each element in the collection.
     * If CSS selector is given, filter results to include only ones matching the selector.
     *
     * @param {String} sel
     * @return {Object}
     */

    parent: function (sel) {
        return hAzzle.create(this.pluck('parentNode', /* NodeType 11 */ 11), sel);
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
            holder.push(this.elems[count[i]]);
        }

        return hAzzle(holder) || [];
    },

    /**
     * Reduce the set of matched elements to the first x in the set.
     */

    first: function (count) {

        if (count) {

            return this.slice(0, count);
        }

        if (count < 0) {

            return [];
        }
        return hAzzle(this.elems[0]);
    },

    /**
     * Reduce the set of matched elements to the last one in the set.
     */

    last: function (count) {
        var elems = this.elems;

        if (count) {
            return this.slice(Math.max(elems.length - count, 0));
        }
        return hAzzle(elems[elems.length - 1]);
    },

    // Returns everything but the first entry of the array

    tail: function (count) {
        return this.slice((count === null) ? 1 : count);
    },

    /**
     * Return the element's siblings
     * @param {String} sel
     * @return {Object}
     */

    siblings: function (sel) {

        var siblings = [];

        if (!cached[sel]) {
            this.each(function (_, elem) {
                hAzzle.each(slice.call((elem.parentNode || {}).childNodes), function (_, child) {
                    if (hAzzle.isElement(child) && hAzzle.nodeType(1, child) && child !== elem) {
                        siblings.push(child);
                    }
                });
            });
            cached[sel] = siblings;
        }

        return hAzzle.create(cached[sel], sel);
    }

});

/**
 * Extending the hAzzle object with some jQuery look-a-like functions.
 * It's like this so we can be compatible with the jQuery / Zepto API
 * regarding plugins.
 */
 
hAzzle.extend(hAzzle, {

    dir: function (elem, dir, until) {
        var matched = [],
            truncate = until !== undefined;

        while ((elem = elem[dir]) && !(hAzzle.nodeType(9, elem))) {
            if (hAzzle.nodeType(1, elem)) {
                if (truncate && hAzzle(elem).is(hAzzle(until))) {
                    break;
                }
                matched.push(elem);
            }
        }
        return matched;
    },

    sibling: function (n, elem) {
        var matched = [];

        for (; n; n = n.nextSibling) {
            if (hAzzle.nodeType(1, n) && n !== elem) {
                matched.push(n);
            }
        }

        return matched;
    }
});

function sibling(cur, dir) {
    while ((cur = cur[dir]) && !(hAzzle.nodeType(1, cur)) ) {}
    return cur;
}

hAzzle.each({
    parents: function (elem) {
        return hAzzle.dir(elem, "parentNode");
    },
    parentsUntil: function (elem, i, until) {
        return hAzzle.dir(elem, "parentNode", until);
    },
    next: function (elem) {
        return sibling(elem, "nextSibling");
    },
    nextUntil: function (elem, i, until) {
        return hAzzle.dir(elem, "nextSibling", until);
    },
    nextAll: function (elem) {
        return hAzzle.dir(elem, "nextSibling");
    },
    prev: function (elem) {
        return sibling(elem, "previousSibling");
    },
    prevAll: function (elem) {
        return hAzzle.dir(elem, "previousSibling");
    },
    prevUntil: function (elem, i, until) {
        return hAzzle.dir(elem, "previousSibling", until);
    },
	
    children: function (elem) {
        return hAzzle.sibling(elem.firstChild);
    },
	contents: function( elem ) {
		return elem.contentDocument || hAzzle.merge( [], elem.childNodes );
	}
}, function (name, fn) {
    hAzzle.fn[name] = function (until, selector) {

        var matched = hAzzle.map(this, fn, until);

        if (name.slice(-5) !== "Until") {
            selector = until;
        }

        if (selector && typeof selector === "string") {
            matched = hAzzle.filter(selector, matched);
        }

        if (this.length > 1) {
            // Remove duplicates
            if (!guaranteedUnique[name]) {
                hAzzle.unique(matched);
            }

            // Reverse order for parents* and prev-derivatives
            if (/^(?:parents|prev(?:Until|All))/.test(name)) {
                matched.reverse();
            }
        }
        return $(matched);
    };
});