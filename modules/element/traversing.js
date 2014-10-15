// traversing.js
hAzzle.define('Traversing', function() {

    var _jiesa = hAzzle.require('Jiesa'),
        _collection = hAzzle.require('Collection'),
        _core = hAzzle.require('Core'),
        _util = hAzzle.require('Util');

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
        return selector === undefined ? hAzzle(ret) : hAzzle(ret).filter(selector);
    };

    // Get immediate parents of each element in the collection.
    // If CSS selector is given, filter results to include only ones matching the selector.

    this.parent = function(sel) {
        var matched = this.map(function(elem) {
            var parent = elem.parentElement;
            return parent && parent.nodeType !== 11 ? parent : null;
        }).filter(sel);

        if (this.length > 1) {
            // Remove duplicates
            _core.uniqueSort(matched.elements);
        }
        return matched;
    };

    // Returns all parent elements for nodes
    // Optionally takes a query to filter the child elements.

    this.parents = function(selector) {
        var ancestors = [],
            elements = this.elements;
        while (elements.length > 0 && elements[0] !== undefined) {
            elements = _util.map(elements, function(elem) {
                if (elem && (elem = elem.parentElement) && elem.nodeType !== 9) {
                    ancestors.push(elem);
                    return elem;
                }
            });
        }

        if (this.length > 1) {
            // Remove duplicates
            _core.uniqueSort(ancestors);
            // Reverse order for parents
            ancestors.reverse();
        }
        return selector === undefined ? hAzzle(ancestors) : hAzzle(ancestors).filter(selector);
    };

    // Get the first element that matches the selector, beginning at 
    // the current element and progressing up through the DOM tree.

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
                    _jiesa.matches(cur, selector)) {

                    matched.push(cur);
                    break;
                }
            }
        }

        return hAzzle(matched.length > 1 ? _core.uniqueSort(matched) : matched);
    };

    // Get immediate children of each element in the current collection.
    // If selector is given, filter the results to only include ones matching the CSS selector.

    this.children = function(selector) {
        var children = [];
        this.each(function(elem) {
            _util.each(_collection.slice(elem.children), function(value) {
                children.push(value);
            });
        });
        return selector === undefined ? hAzzle(children) : hAzzle(children).filter(selector);
    };

    // Return elements that is a descendant of another.

    this.contains = function(selector) {
        var matches;
        return new hAzzle(_collection.reduce(this.elements, function(elements, element) {
            matches = _jiesa.find(element, selector);
            return elements.concat(matches.length ? element : null);
        }, []));
    };

    // Reduce the set of matched elements to those that have a descendant that matches the 
    //selector or DOM element.

    this.has = function(sel) {
        return hAzzle(_util.filter(
            this.elements,
            _util.isElement(sel) ? function(el) {
                return _core.contains(sel, el);
            } : typeof sel === 'string' && sel.length ? function(el) {
                return _jiesa.find(sel, el).length;
            } : function() {
                return false;
            }
        ));
    };


    return {};
});