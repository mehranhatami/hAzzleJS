/*!
 * Traversing.js
 */
;
(function ($) {

    var cached = [],
        slice = Array.prototype.slice;

    $.extend($.fn, {

        /**
         * Fetch property from elements
         *
         * @param {String} prop
         * @return {Array}
         */

        pluckNode: function (prop) {
            return this.map(function (element) {
                return $.getClosestNode(element, prop);
            });
        },

        /**
         * Get the  element that matches the selector, beginning at the current element and progressing up through the DOM tree.
         *
         * @param {String} sel
         * @return {Object}
         */

        closest: function (sel, ctx) {
            return this.map(function (elem) {
                if ($.nodeType(1, elem) && elem !== ctx && !$.isDocument(elem) && $.matches(elem, typeof sel == 'object' ? $(sel) : sel)) {
                    return elem;
                }
                return $.getClosestNode(elem, 'parentNode', sel, /* NodeType 11 */ 11);
            });
        },

        /** Determine the position of an element within the matched set of elements
         *
         * @param {string} elem
         * @param {return} Object
         */

        index: function (elem) {
            return elem ? this.indexOf($(elem)[0]) : this.parent().children().indexOf(this[0]) || -1;
        },

        /**
         *  Pick elements by tagNames from the "elems stack"
         *
         * @param {string} tag
         * @return {Object}
         */
        tags: function (tag) {
            return this.map(function (els) {
                if (els.tagName.toLowerCase() === tag && $.nodeType(1, els)) {
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
            return this.concat($(sel, ctx).elems);
        },

        /**
         * Reduce the set of matched elements to those that have a descendant that matches the selector or DOM element.
         */
        has: function (target) {

            var targets = $(target, this),
                i = 0,
                l = targets.length;

            return this.filter(function () {
                for (; i < l; i++) {
                    if ($.contains(this, targets[i])) {
                        return true;
                    }
                }
            });
        },

        /**
         * Get elements in list but not with this selector
         *
         * @param {String} sel
         * @return {Object}
         *
         */

        not: function (sel) {
            return this.filter(sel, true)
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
                this.filter(sel).length > 0);
        },

        /**
         * Get immediate parents of each element in the collection.
         * If CSS selector is given, filter results to include only ones matching the selector.
         *
         * @param {String} sel
         * @return {Object}
         */

        parent: function (sel) {
            return $.create(this.pluck('parentNode', /* NodeType 11 */ 11), sel);
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
                    if ((element = element.parentNode) && element !== document && ancestors.indexOf(element) < 0) {
                        if ($.nodeType(1, element)) {
                            ancestors.push(element);
                            return element;
                        }
                    }

                };

            while (elements.length > 0 && elements[0] !== undefined) {
                elements = elements.map(fn);
            }

            return $.create(ancestors, sel);
        },

        /**
         * Get all decending elements of a given element
         * If selector is given, filter the results to only include ones matching the CSS selector.
         *
         * @param {String} sel
         * @return {Object}
         */

        children: function (sel) {
            return $(this.reduce(function (els, elem) {
                if ($.nodeType(1, elem)) {
                    return els.concat(slice.call(elem.children));
                }
            }, []), sel);
        },

        /**
         *  Return the element's next sibling
         *
         * @return {Object}
         */

        next: function (selector) {
            return selector ? $(this.pluckNode('nextSibling').filter(selector || [])) : $(this.pluckNode('nextSibling'));
        },

        nextUntil: function (until) {

            var matches = [];

            this.nextAll().each(function () {
                if ($(this).is(until)) return false;
                matches.push(this);
            });

            return $(matches);
        },

        /**
         *  Return the element's previous sibling
         *
         * @return {Object}
         */

        prev: function (selector) {
            return selector ? $(this.pluckNode('previousSibling').filter(selector)) : $(this.pluckNode('previousSibling'));
        },

        prevUntil: function (until) {

            var matches = [];

            this.prevAll().each(function () {
                if ($(this).is(until)) return false;
                matches.push(this);
            });

            return $(matches);
        },

        /**
         * Return an sequense of elements from the 'elems stack', plucked
         * by the given numbers
         *
         * Example:
         *
         * $('p').collection([1,6, 9])
         *
         * Outputs elem 1,6, 9 from the stack
         *
         * @param {array} count
         * @return {object}
         *
         */

        collection: function (count) {

            if (!$.isArray(count)) {
                return [];
            }

            var holder = [],
                i = count.length;
            while (i--) {
                holder.push(this.elems[count[i]])
            }

            return $(holder) || [];
        },

        /**
         * Reduce the set of matched elements to the first x in the set.
         */

        first: function (count) {

            if ((count == null)) {

                return $(this.elems[0]);
            }

            if (count < 0) {

                return [];
            }

            return $(slice.call(this.elems, 0, count));
        },

        /**
         * Reduce the set of matched elements to the last one in the set.
         */

        last: function (count) {
            var elems = this.elems;

            if ((count == null)) {

                return $(elems[elems.length - 1]);
            }

            return $(slice.call(elems, Math.max(elems.length - count, 0)));
        },

        // Returns everything but the first entry of the array

        tail: function (count) {
            return $(slice.call(this.elems, (count == null) ? 1 : count));
        },

        contents: function () {
            return this.map(function (elem) {
                return elem.contentDocument || slice.call(elem.childNodes);
            });
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
                    $.each(slice.call((elem.parentNode || {}).childNodes), function (_, child) {
                        if ($.isElement(child) && $.nodeType(1, child) && child !== elem) {
                            siblings.push(child);
                        }
                    });
                });
                cached[sel] = siblings;
            }

            return $.create(cached[sel], sel);
        }

    });

    $.extend($, {

        /**
         * Walks the DOM tree using `method`, returns when an element node is found
         *
         * @param{Object} element
         * @param{String} method
         * @param{String} sel
         * @param{Number/Null } nt
         */

        getClosestNode: function (element, method, sel, nt) {
            do {
                element = element[method];
            } while (element && ((sel && !$.matches(sel, element)) || !$.isElement(element)));
            if ($.isDefined(nt) && (element !== null && !$.nodeType(nt, element))) {
                return element;
            }
            return element;
        }
    });

    /**
     * Process nextAll and prevAll
     */

    $.each({
        'nextAll': 'next',
        'prevAll': 'prev'
    }, function (name, subn) {

        $.fn[name] = function (sel) {
            var els = $(),
                el = this[subn](); // next() or prev()
            while (el.length) {
                if (typeof sel === 'undefined' || el.is(sel)) {
                    els = els.add(el);
                }
                el = el[subn](); // next() or prev()
            }
            return els;
        };
    });

})(hAzzle);