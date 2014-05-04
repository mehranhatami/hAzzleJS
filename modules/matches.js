var matches = hAzzle.prefix('matchesSelector', document.createElement('div'));

hAzzle.extend(hAzzle.fn, {

    /**
     * Find an element in the collection
     *
     * @param {String|Object} selector
     * @return {Object}
     *
     */

    find: function (selector) {

        var elements;
        if (hAzzle.isString(selector)) {
            if (this.length === 1) {
	                elements = hAzzle.select(selector, this.elems);
            } else {
                elements = this.elems.reduce(function (elements, element) {
                    return elements.concat(hAzzle.select(selector, element));
                }, []);
            }
        } else {
            var _ = this;
            elements = hAzzle(selector).filter(function () {
                var node = this;
                return _.elems.some.call(_, function (parent) {
                    return hAzzle.contains(parent, node);
                });
            });
        }
        return hAzzle(elements);
    }
});

hAzzle.extend(hAzzle, {

    filter: function (expr, elems, not) {

        if (not) {
            expr = ":not(" + expr + ")";
        }
        return elems.length === 1 ?
            hAzzle.matchesSelector(elems[0], expr) ? [elems[0]] : [] :
            hAzzle.matches(expr, elems);
    },

    matches: function (expr, elements) {
        return hAzzle.find(expr, null, null, elements);
    },
    matchesSelector: function (elem, expr) {
        return matches.call(elem, expr);
    },

    find: function (selector, context, results, seed) {
        var elem, nodeType,
            i = 0;

        results = results || [];
        context = context || document;

        // Same basic safeguard as Sizzle
        if (!selector || typeof selector !== "string") {
            return results;
        }

        // Early return if context is not an element or document
        if ((nodeType = context.nodeType) !== 1 && nodeType !== 9) {
            return [];
        }

        if (seed) {
            while ((elem = seed[i++])) {
                if (hAzzle.matchesSelector(elem, selector)) {
                    results.push(elem);
                }
            }
        } else {

            hAzzle.merge(results, context.querySelectorAll(selector));
        }

        return results;
    }
});