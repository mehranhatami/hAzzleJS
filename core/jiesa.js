// jiesa.js
hAzzle.include([
    'util',
    'core',
    'collection',
    'types',
    'has',
    'selector'
], function(_util, _core, _collection, _types, _has, _selector) {

    var // RegEx

        _relativeSel = /^\s*[+~]/,
        _reSpace = /[\n\t\r]/g,
        _idClassTagNameExp = /^(?:#([\w-]+)|\.([\w-]+)|(\w+))$/,
        _tagNameAndOrIdAndOrClassExp = /^(\w+)(?:#([\w-]+)|)(?:\.([\w-]+)|)$/,
        _unionSplit = /([^\s,](?:"(?:\\.|[^"])+"|'(?:\\.|[^'])+'|[^,])*)/g,
        _rattributeQuotes = /=[\x20\t\r\n\f]*([^\]'"]*?)[\x20\t\r\n\f]*\]/g,

        fixedRoot = function(context, query, method) {
            var oldContext = context,
                old = context.getAttribute('id'),
                nid = old || '__hAzzle__',
                hasParent = context.parentNode,
                relativeHierarchySelector = _relativeSel.test(query);

            if (relativeHierarchySelector && !hasParent) {
                return [];
            }
            if (!old) {
                context.setAttribute('id', nid);
            } else {
                nid = nid.replace(/'/g, '\\$&');
            }
            if (relativeHierarchySelector && hasParent) {
                context = context.parentNode;
            }
            var selectors = query.match(_unionSplit);
            for (var i = 0; i < selectors.length; i++) {
                selectors[i] = "[id='" + nid + "'] " + selectors[i];
            }
            query = selectors.join(",");

            try {
                return method.call(context, query);
            } finally {
                if (!old) {
                    oldContext.removeAttribute('id');
                }
            }
        },

        // Dependencies: DOM Level 4 matches()

        matchesSelector = function(elem, sel, ctx) {

            if (ctx && ctx.nodeType !== 9) {
                // doesn't support three args, use rooted id trick
                return fixedRoot(ctx, sel, function(query) {
                    return elem.matches(query);
                });
            }
            // We have a native matchesSelector, use that
            return elem.matches(sel);
        },

        // Determine if the element contains the klass.
        // Uses the `classList` api if it's supported.

        containsClass = function(el, cls) {
            if (_has.has('classList')) {
                return el.classList.contains(cls);
            } else {
                return (' ' + el.className + ' ').replace(_reSpace, ' ').indexOf(cls) >= 0;
            }
        },

        normalizeCtx = function(root) {
            if (!root) {
                return document;
            }
            if (typeof root === 'string') {
                return Jiesa(root);
            }
            if (!root.nodeType && _types.isArrayLike(root)) {
                return root[0];
            }
            return root;
        },

        // Find elements by selectors.

        Jiesa = function(sel, ctx) {
            var m, nodeType, elem, results = [];

            ctx = normalizeCtx(ctx);

            if (!sel || typeof sel !== 'string') {
                return results;
            }

            if ((nodeType = ctx.nodeType) !== 1 && nodeType !== 9 && nodeType !== 11) {
                return [];
            }

            // Split selectors by comma if it's exists.
            if (_util.indexOf(sel, ',') !== -1 && (m = sel.split(','))) {
                // Comma separated selectors. E.g $('p, a');
                // unique result, e.g 'ul id=foo class=foo' should not appear two times.
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

                if ((m = _idClassTagNameExp.exec(sel))) {
                    if ((sel = m[1])) {
                        if (nodeType === 9) {
                            elem = ctx.getElementById(sel);
                            if (elem && elem.id === sel) {
                                return [elem];
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
                } else if ((m = _tagNameAndOrIdAndOrClassExp.exec(sel))) {
                    var result = ctx.getElementsByTagName(m[1]),
                        id = m[2],
                        className = m[3];
                    _util.each(result, function(el) {
                        if (el.id === id || containsClass(el, className)) {
                            results.push(el);
                        }
                    });
                    return results;
                }
                // Fallback to QSA if the native selector engine are not installed
                if (!hAzzle.installed.selector && _has.has('qsa') && (!_core.brokenCheckedQSA ||
                        !_core.ioASaf ||
                        !_core.brokenEmptyAttributeQSA)) {
                    try {
                        return qsa(sel, ctx);
                    } catch (e) {}

                }
            }
            // We are dealing with HTML / XML documents, so check if the native selector engine are installed 
            // To avoid bloating the hAzzle Core - the main selector engine are a separate module            

            hAzzle.err(!hAzzle.installed.selector, 22, ' the selector.js module need to be installed');

            return _selector.find(sel, ctx);
        },
        qsa = function(sel, ctx) {
            var ret;
            if (ctx.nodeType === 1 && ctx.nodeName.toLowerCase() !== 'object') {
                ret = fixedRoot(ctx, sel, ctx.querySelectorAll);
            } else {
                // we can use the native qSA
                ret = ctx.querySelectorAll(sel);
            }
            return _collection.slice(ret);
        },
        matches = function(elem, sel, ctx) {

            if (sel.nodeType) {
                return elem === sel;
            }
            // Set document vars if needed
            if ((elem.ownerDocument || elem) !== document) {
                _core.setDocument(elem);
            }

            // Make sure that attribute selectors are quoted
            sel = typeof sel === 'string' ? sel.replace(_rattributeQuotes, "='$1']") : sel;

            // If instance of hAzzle

            if (sel instanceof hAzzle) {
                return _util.some(sel.elements, function(sel) {
                    return matches(elem, sel);
                });
            }

            if (elem === document) {
                return false;
            }

            if (_core.nativeMatches && _core.isHTML) {

                try {
                    var ret = matchesSelector(elem, sel, ctx);

                    // IE 9's matchesSelector returns false on disconnected nodes
                    if (ret || _core.disconnectedMatch ||

                        // As well, disconnected nodes are said to be in a document
                        // fragment in IE 9
                        elem.document && elem.document.nodeType !== 11) {
                        return ret;
                    }
                } catch (e) {}
            }
            // FIX ME!! Fallback solution need to be developed here!
        };

    // Find is not the same as 'Jiesa', but a optimized version for 
    // better performance

    this.find = function(selector, context, /*internal*/ internal) {

        // Only for use by hAzzle.js module

        if (internal) {
            return Jiesa(selector, context);
        }

        if (typeof selector === 'string') {

            // Single look-up should always be faster then multiple look-ups

            if (this.length === 1) {
                return hAzzle(Jiesa(selector, this.elements[0]));
            } else {
                return _util.reduce(this.elements, function(els, element) {
                    return hAzzle(els.concat(_collection.slice(Jiesa(selector, element))));
                }, []);
            }
        }

        var i, len = this.length,
            self = this.elements;

        return hAzzle(_util.filter(hAzzle(selector).elements, function(node) {
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

            return hAzzle(els);

        } else {
            return this.filter(function() {
                return matchesSelector(this, selector) !== (not || false);
            });
        }
    };

    return {
        matchesSelector: matchesSelector,
        matches: matches,
        qsa: qsa,
        find: Jiesa
    };
});
