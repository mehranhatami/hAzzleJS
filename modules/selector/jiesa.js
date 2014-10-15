// jiesa.js
hAzzle.define('Jiesa', function() {

    var _util = hAzzle.require('Util'),
        _core = hAzzle.require('Core'),
        _collection = hAzzle.require('Collection'),
        _support = hAzzle.require('Support'),

        reSpace = /[\n\t\r]/g,
        idClassTagNameExp = /^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/,
        tagNameAndOrIdAndOrClassExp = /^(\w+)(?:#([\w-]+)|)(?:\.([\w-]+)|)$/;

    /**
     * Determine if the element contains the klass.
     * Uses the `classList` api if it's supported.
     * https://developer.mozilla.org/en-US/docs/Web/API/Element.classList
     *
     * @param {Object} el
     * @param {String} klass
     *
     * @return {Array}
     */

    function containsClass(el, klass) {
        if (_support.classList) {
            return el.classList.contains(klass);
        } else {
            return (' ' + el.className + ' ').replace(reSpace, ' ').indexOf(klass) >= 0;
        }
    }

    /**
     * Find elements by selectors.
     *
     * Supported:
     * - #foo
     * - .foo
     * - div (tagname)
     *
     * @param {String} sel The selector string
     * @param {Object} ctx The context. Default is document.
     * @param {Bool} c Save to cache? Default is true.
     */

    function Jiesa(sel, ctx) {
        var m, nodeType, elem, results = [];

        ctx = ctx || document;

        if (!sel || typeof sel !== 'string') {
            return results;
        }

        if ((nodeType = ctx.nodeType) !== 1 && nodeType !== 9 && nodeType !== 11) {
            return [];
        }

        // Split selectors by comma if it's exists.
        if (_util.indexOf(sel, ',') !== -1 && (m = sel.split(','))) {
            // Comma separated selectors. E.g $('p, a');
            // unique result, e.g "ul id=foo class=foo" should not appear two times.
            _util.each(m, function(el) {
                _util.each(Jiesa(el), function(el) {
                    // FIXME! For better performance, do a test to see if we only can
                    // use inArray() here, and not bother the DOM.
                    if (!_core.contains(results, el)) {
                        results.push(el);
                    }
                });
            });
            return results;
        }

        if (_core.isHTML) {

            if ((m = idClassTagNameExp.exec(sel))) {
                if ((sel = m[1])) {
                    if (nodeType === 9) {
                        elem = ctx.getElementById(sel);
                        if (elem && elem.parentNode) {
                            if (elem.id === sel) {
                                return [elem];
                            }
                        } else {
                            return [];
                        }
                    } else {
                        // Context is not a document
                        if (ctx.ownerDocument && (elem = ctx.ownerDocument.getElementById(sel)) &&
                            _core.contains(ctx, elem) && elem.id === m) {
                            return [elem];
                        }
                    }
                } else if ((sel = m[2])) {
                    return _collection.slice(ctx.getElementsByClassName(sel));
                } else if ((sel = m[3])) {
                    return _collection.slice(ctx.getElementsByTagName(sel));
                }
                // E.g. hAzzle( 'span.selected' )  
            } else if ((m = tagNameAndOrIdAndOrClassExp.exec(sel))) {
                var result = ctx.getElementsByTagName(m[1]),
                    id = m[2],
                    className = m[3];
                _util.each(result, function(el) {
                    if (el.id === id || containsClass(el, className)) {
                        results.push(el);
                    }
                });
                return results;
            } else {
                return _collection.slice(document.querySelectorAll(sel));
            }
        }
    }

    // Find is not the same as 'Jiesa', but a optimized version for 
    // better performance

    this.find = function(selector, context, /*internal*/ internal) {

        // Only for use by hAzzle.js module

        if (internal) {
            return Jiesa(selector, context)
        }

        if (typeof selector === 'string') {

            // Single look-up should always be faster then multiple look-ups

            if (this.length === 1) {
                return new hAzzle(Jiesa(selector, this.elements[0]));
            } else {
                elements = _collection.reduce(this.elements, function(els, element) {
                    return new hAzzle(els.concat(_collection.slice(Jiesa(selector, element))));
                }, []);
            }
        }

        var i,
            len = this.length,
            self = this.elements;

        return new hAzzle(_util.filter(hAzzle(selector).elements, function(node) {
            for (i = 0; i < len; i++) {
                if (_core.contains(self[i], node)) {
                    return true;
                }
            }
        }));
    };

    // Filter element collection

    this.filter = function(selector, not) {
        if (selector === undefined) {
            return this;
        }
        if (typeof selector === 'function') {
            var els = [];
            this.each(function(el, index) {
                if (selector.call(el, index)) {
                    els.push(el);
                }
            });

            return new hAzzle(els);
        } else {
            return this.filter(function() {
                return matches(this, selector) != (not || false);
            });
        }
    };

    function matches(element, selector) {
        var match;

        if (!element || !_util.isElement(element) || !selector) {
            return false;
        }

        if (selector.nodeType) {
            return element === selector;
        }

        // If instance of hAzzle

        if (selector instanceof hAzzle) {
            return _util.some(selector.elements, function(selector) {
                return matches(element, selector);
            });
        }

        if (element === document) {
            return false;
        }

        return element.matches(selector)

    }

    return {
        matches: matches,
        find: Jiesa
    };
});