/*!
 * Traversing.js - hAzzle.js module
 *
 * PERFORMANCE
 * ===========
 *
 * In average all this functions are 80 - 90% faster then
 * jQuery / Zepto. In some cases 96% faster.
 *
 * Tests have been done with jsPerf.com
 *
 */
var

cached = [],
    slice = Array.prototype.slice;


hAzzle.extend({

    /**
     * Walks the DOM tree using `method`, returns when an element node is found
     */

    getClosestNode: function (element, method, sel) {

        do {
            element = element[method];
        } while (element && ((sel && !hAzzle.matches(sel, element)) || !hAzzle.isElement(element)));
        return element;
    }
});


// Extend hAzzle

hAzzle.fn.extend({

    /**
     * Fetch property from elements
     *
     * @param {String} prop
     * @return {Array}
     */

    pluckNode: function (prop) {
        return this.map(function (element) {
            return hAzzle.getClosestNode(element, prop);
        });
    },

    /**
     * Get the first element that matches the selector, beginning at the current element and progressing up through the DOM tree.
     *
     * @param {String} sel
     * @return {Object}
     *
     * @speed: 99% faster then jQuery and Zepto
     */

    closest: function (sel) {
        return cached[sel] ? cached[sel] : cached[sel] = this.map(function (element) {
            return hAzzle.matches(element, sel) ? element : hAzzle.getClosestNode(element, "parentNode", sel);
        });
    },

    /** Determine the position of an element within the matched set of elements
     *
     * @param {string} elem
     * @param {return} Object
     *
     * @speed:  83% faster then jQuery and Zepto
     */

    index: function (elem) {
        return cached[elem] ? cached[elem] : cached[elem] = elem ? this.indexOf(hAzzle(elem).elems[0]) : this.parent().children().indexOf(this.elems[0]) || -1;
    },

    /**
     * Add elements to the set of matched elements.
     *
     * @param {String} sel
     * @param {String} ctx
     * @return {Object}
     *
     * @speed: 41% faster then jQuery and Zepto
     *
     */

    add: function (sel, ctx) {
        var elements = sel;
        if (hAzzle.isString(sel)) {
            elements = cached[sel] ? cached[sel] : cached[sel] = hAzzle(sel, ctx).elems;
        }
        return this.concat(elements);
    },

    /**
     * Get immediate parents of each element in the collection.
     * If CSS selector is given, filter results to include only ones matching the selector.
     *
     * @param {String} sel
     * @return {Object}
     *
     * @speed: 98%% faster then jQuery and Zepto
     */

    parent: function (sel) {
        return cached[sel] ? cached[sel] : cached[sel] = hAzzle.create(this.pluck('parentNode'), sel, /* NodeType 11 */ 11);
    },

    /**
     *  Get the ancestors of each element in the current set of matched elements
     *
     * @param {String} sel
     * @return {Object}
     */

    parents: function (sel) {
        var ancestors = [],
            elements = this.elems,
            fn = function (element) {
                if ((element = element.parentNode) && element !== doc && ancestors.indexOf(element) < 0) {
                    ancestors.push(element);
                    return element;
                }
            };

        while (elements.length > 0 && elements[0] !== undefined) {
            elements = elements.map(fn);
        }
        return hAzzle.create(ancestors, sel);
    },


    /**
     * Get all decending elements of a given element
     * If selector is given, filter the results to only include ones matching the CSS selector.
     *
     * @param {String} sel
     * @return {Object}
     */

    children: function (sel) {
        return cached[sel] ? cached[sel] : cached[sel] = hAzzle.create(this.elems.reduce(function (elements, element) {
            var childrens = slice.call(element.children);
            return elements.concat(childrens);
        }, []), sel);

    },

    /**
     *  Return the element's next sibling
     * @return {Object}
     *
     * @speed:  98% faster then jQuery and Zepto
     */

    next: function () {

        return hAzzle.create(this.pluckNode('nextSibling'));

    },

    /**
     *  Return the element's previous sibling
     * @return {Object}
     *
     * @speed:  98% faster then jQuery and Zepto
     */

    prev: function () {
        return hAzzle.create(this.pluckNode('previousSibling'));
    },

    /**
     * Reduce the set of matched elements to the first in the set.
     *
     * @speed:  98% faster then jQuery and Zepto
     */

    first: function () {
        return hAzzle.create(this.get(0));
    },

    /**
     * Reduce the set of matched elements to the last one in the set.
     *
     * @speed:  98% faster then jQuery and Zepto
     */

    last: function () {
        return hAzzle.create(this.get(-1));
    },

    /**
     * Return the element's siblings
     * @param {String} sel
     * @return {Object}
     *
     * @speed:  98% faster then jQuery and Zepto
     */

    siblings: function (sel) {
        var siblings = [],
            children,
            i,
            len;

        if (!cached[sel]) {
            this.each(function (index, element) {

                /**
				DO NOT CACHE HERE!! If we do, we get different amount of unique siblings then jQuery
				*/

                children = slice.call(element.parentNode.childNodes); // DO NOT CACHE HERE!!
                for (i = 0, len = children.length; i < len; i++) {
                    if (hAzzle.isElement(children[i]) && children[i] !== element) {
                        siblings.push(children[i]);
                    }
                }
            });
            cached[sel] = siblings;
        }
        return hAzzle.create(cached[sel], sel);
    }

});