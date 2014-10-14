// traversing.js
hAzzle.define('Traversing', function() {

    var _jiesa = hAzzle.require('Jiesa'),
        _dom = hAzzle.require('Dom'),
        _matches = hAzzle.require('Matches'),
        _collection = hAzzle.require('Collection'),
        _core = hAzzle.require('Core'),
        _util = hAzzle.require('Util');

    this.contains = function(selector) {
        var matches;
        return _dom._create(_collection.reduce(this.elements, function(elements, element) {
            matches = _jiesa.find(element, selector);
            return elements.concat(matches.length ? element : null);
        }, []));
    };

    this.is = function(selector) {
        return this.length > 0 && this.filter(selector).length > 0;
    };

    this.not = function(selector) {
        return this.filter(selector, true);
    };

    // Determine the position of an element within the set
    this.index = function(selector) {
        return selector == null ?
            this.parent().children().indexOf(this.elements[0]) :
            this.elements.indexOf(new hAzzle(selector).elements[0]);
    };

    this.add = function(selector, ctx) {
        var elements = selector;
        if (typeof selector === 'string') {
            elements = new hAzzle(selector, ctx).elements;
        }
        return this.concat(elements);
    };

    this.has = function(selector) {
        return _dom._create(_util.filter(
            this.elements,
            _util.isElement(selector) ? function(el) {
                return _core.contains(selector, el);
            } : typeof selector === 'string' && selector.length ? function(el) {
                return _jiesa.find(selector, el).length;
            } : function() {
                return false;
            }
        ));
    };

    // Returns `element`'s first following sibling

    this.next = function(selector) {
        return this.map(function(elem) {
            return elem.nextElementSibling;
        }).filter(selector || '*');
    };

    // Returns `element`'s first previous sibling

    this.prev = function(selector) {
        return this.map(function(elem) {
            return elem.previousElementSibling;
        }).filter(selector || '*');
    };

    this.first = function(index) {
        return index ? this.slice(0, index) : this.eq(0);
    };

    this.last = function(index) {
        return index ? this.slice(this.length - index) : this.eq(-1);
    };

    // Returns all sibling elements for nodes
    // Optionally takes a query to filter the sibling elements.

    this.siblings = function(selector) {

        var ret = [],
            i, nodes;

        this.each(function(element) {

            nodes = element.parentElement.children;

            i = nodes.length;

            while (i--) {
                if (nodes[i] !== element) {
                    ret.push(nodes[i]);
                }
            }
        });
        return _dom._create(ret, selector);
    };

    // Returns immediate parent elements
    // Optionally takes a query to filter the parent elements.

    this.parent = function(selector) {
        return _dom._create(_util.map(this.elements, function(t) {
            return t.parentElement
        }), selector);
    };

    // Returns all parent elements for nodes
    // Optionally takes a query to filter the child elements.

    this.parents = function(selector) {
        var ancestors = [],
            elements = this.elements,
            fn = function(elem) {
                if (elem && (elem = elem.parentElement) && elem !== document && _util.indexOf(ancestors, elem) < 0) {
                    ancestors.push(elem);
                    return elem;
                }
            };

        while (elements.length > 0 && elements[0] !== undefined) {
            elements = _util.map(elements, fn);
        }

        if (this.length > 1) {
            // Remove duplicates
            _core.uniqueSort(ancestors);
            // Reverse order for parents
            ancestors.reverse();
        }
        return _dom._create(ancestors, selector);
    };

    // Returns closest parent that matches query

    this.closest = function(selector, ctx) {
        var cur,
            i = 0,
            l = this.length,
            matched = [];

        for (; i < l; i++) {
            for (cur = this.elements[i]; cur && cur !== ctx; cur = cur.parentNode) {
                // Always skip document fragments
                if (cur.nodeType < 11 &&
                    cur.nodeType === 1 &&
                    _matches.matches(cur, selector)) {

                    matched.push(cur);
                    break;
                }
            }
        }

        return hAzzle(matched.length > 1 ? _core.uniqueSort(matched) : matched);
    };

    // Returns all immediate child elements for nodes

    this.children = function(selector) {
        return _dom._create(_collection.reduce(this.elements, function(els, elem) {
            var children = _collection.slice(elem.children);
            return els.concat(children);
        }, []), selector);
    };

    return {};
});