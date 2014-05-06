/**
 *
 * WORK IN PROGRESS!!!
 *
 * I'm working on this. This is the beginning of the new selector engine
 *
 */
var push = Array.prototype.push;

// Native matchSelector;

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
                elements = hAzzle.find(selector, this.elems);
            } else {
                elements = this.elems.reduce(function (elements, element) {
                    return elements.concat(hAzzle.find(selector, element));
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

        var match, elem, m, nodeType,
            // QSA vars
            i, groups, old, nid, newContext, newSelector;


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


        if (!seed) {

            // Shortcuts
            if ((match = /^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/.exec(selector))) {

                // #id
                if ((sel = match[1])) {

                    elem = context.getElementById(sel);

                    if (elem && elem.parentNode) {
                        // Handle the case where IE, Opera, and Webkit return items
                        // by name instead of ID
                        if (elem.id === m) {

                            results.push(elem);
                            return results;
                        }
                    } else {

                        return results;
                    }

                    // .class	

                } else if ((sel = match[2])) {

                    push.apply(results, context.getElementsByClassName(sel));
                    return results;

                    // tag

                } else if ((sel = match[3])) {

                    push.apply(results, context.getElementsByTagName(selector));
                    return results;
                }
            }

            results = context.querySelectorAll(selector);

            // Seed

        } else {
            while ((elem = seed[i++])) {
                if (hAzzle.matchesSelector(elem, selector)) {
                    results.push(elem);
                }
            }
        }

        return hAzzle.isNodeList(results) ? slice.call(results) : hAzzle.isElement(results) ? [results] : results;
    }
});