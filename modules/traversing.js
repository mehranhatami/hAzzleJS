/*!
 * Traversing.js
 */
var
cached = [],
    slice = Array.prototype.slice;

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
     */

    closest: function (sel) {
        return this.map(function (elem) {
            // Only check for match if nodeType 1
            if (hAzzle.nodeType(1, elem) && hAzzle.matches(elem, sel)) {
                return elem;
            }
            // Exclude document fragments
            return hAzzle.getClosestNode(elem, 'parentNode', sel, /* NodeType 11 */ 11);
        })
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
     * Add elements to the set of matched elements.
     *
     * @param {String} sel
     * @param {String} ctx
     * @return {Object}
     */

    add: function (sel, ctx) {
        var elements = sel;
        if (hAzzle.isString(sel)) {
            elements = hAzzle(sel, ctx).elems;
        }
        return this.concat(elements);
    },

    /**
     * Get immediate parents of each element in the collection.
     * If CSS selector is given, filter results to include only ones matching the selector.
     *
     * @param {String} sel
     * @return {Object}
     */

    parent: function (sel) {
        return hAzzle.create(this.pluck('parentNode'), sel, /* NodeType 11 */ 11)
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
        return hAzzle.create(this.reduce(function (elements, elem) {
            var childrens = slice.call(elem.children);
            return elements.concat(childrens);
        }, []), sel);
    },

    /**
     *  Return the element's next sibling
     * @return {Object}
     */

    next: function () {
        return hAzzle.create(this.pluckNode('nextSibling'));
    },

    /**
     *  Return the element's previous sibling
     * @return {Object}
     */

    prev: function () {
        return hAzzle.create(this.pluckNode('previousSibling'));
    },

    /**
     * Reduce the set of matched elements to the first in the set.
     */

    first: function () {
        return hAzzle.create(this.get(0));
    },

    /**
     * Reduce the set of matched elements to the last one in the set.
     */

    last: function () {
        return hAzzle.create(this.get(-1));
    },

    /**
     * Return the element's siblings
     * @param {String} sel
     * @return {Object}
     */

    siblings: function (sel) {
        var siblings = [],
            children,
            elem,
            i,
            len;

        if (!cached[sel]) {
            this.each(function () {
                elem = this;
                children = slice.call(elem.parentNode.childNodes);

                for (i = 0, len = children.length; i < len; i++) {
                    if (hAzzle.isElement(children[i]) && children[i] !== elem) {
                        siblings.push(children[i]);
                    }
                }
            });
            cached[sel] = siblings;
        }
        return hAzzle.create(cached[sel], sel);
    }

});