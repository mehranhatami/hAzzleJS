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

        closest: function (sel, context) {
            return this.map(function (elem) {
                if ($.nodeType(1, elem) && elem !== context && !$.isDocument(elem) && $.matches(elem, typeof sel == 'object' ? $(sel) : sel)) {
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

        /** Get elements from a spesific position inside the "elems stack"
         *
         * @param {arr} arr
         * @param {return} Object
         */

        selectedIndex: function (arr) {

            if (!$.isArray(arr)) {

                return;
            }

            var result = [],
                i = 0;

            for (i = arr.length; i--;) {
                result.push(this.get(arr[i]));
            }
            return $(result);
        },

        /**
         *  Pick elements by tagNames from the "elems stack"
         *
         * @param {string} tag
         * @return {Object}
         */
        tags: function (tag) {
            return this.map(function (elem) {
                if (elem.tagName.toLowerCase() === tag && $.nodeType(1, elem)) {
                    return elem;
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

            var elements = sel;

            if (typeof sel === 'string') {
                elements = hAzzle(sel, ctx).elems;
            }
            return this.concat(elements);
        },

        /**
         * Reduce the set of matched elements to those that have a descendant that matches the selector or DOM element.
         */
        has: function (target) {
            var targets = $(target, this),
                l = targets.length;

            return this.filter(function () {
                for (var i = 0; i < l; i++) {
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
            return this.filter(sel || [], true);
        },

        /**
         * Check if the first element in the element collection matches the selector
         *
         * @param {String|Object} sel
         * @return {Boolean}
         */

        is: function (sel) {
            return this.length > 0 && this.filter(sel || []).length > 0;
        },

        /**
         * Get immediate parents of each element in the collection.
         * If CSS selector is given, filter results to include only ones matching the selector.
         *
         * @param {String} sel
         * @return {Object}
         */

        parent: function (sel) {
            return $(this.pluck('parentNode', /* NodeType 11 */ 11), sel);
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
            return $(this.reduce(function (elements, elem) {
                if ($.nodeType(1, elem)) {
                    return elements.concat(slice.call(elem.children));
                }
            }, []), sel);
        },

        /**
         *  Return the element's next sibling
         *
         * @return {Object}
         */

        next: function (selector) {
            return selector ? $(this.pluckNode('nextSibling').filter(selector)) : $(this.pluckNode('nextSibling'));
        },

        /**
         * Find the next class after given element.
         *
         * @param {String} className
         * @return {Object}
         *
         **/

        nextOfClass: function (className) {
            var nextEl,
                el = this;

            // Leading period will confuse hAzzle. 

            if (className[0] === '.') className = className.slice(1);

            while (el.next()) {

                // If target element is found, stop
                if (el.hasClass(className)) return el;

                nextEl = el.next();
                if (nextEl.length === 0) {
                    // No more siblings. Go up in DOM and restart loop to check parent
                    el = el.parent();
                    continue;
                }

                el = nextEl;

                // End of doc. Give up. 
                if (el.parent().length === 0) return false;
            }

        },

        nextUntil: function (until) {

            var matches = [];

            this.nextAll().each(function () {
                if ($(this).is(until)) return false;
                matches.push(this);
            });

            return $(matches)
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

            return $(matches)
        },

        /**
         * Reduce the set of matched elements to the first in the set.
         */

        first: function () {
            return $(this.get(0));
        },

        /**
         * Reduce the set of matched elements to the last one in the set.
         */

        last: function () {
            return $(this.get(-1));
        },

        /**
         * FIX ME!! Seems to have problems finding elems inside an iFrame
         *
         * NOTE!! The iFrame problem happend because we don't have a selector engine.
         */
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