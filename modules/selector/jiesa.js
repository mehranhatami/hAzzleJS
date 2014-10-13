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

    this.jiesa = Jiesa;

    return {
        find: Jiesa
    };
});