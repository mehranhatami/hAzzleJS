// traversing.js
var hAzzle = window.hAzzle || (window.hAzzle = {});

hAzzle.define('Traversing', function() {

    var _jiesa = hAzzle.require('Jiesa'),
        _collection = hAzzle.require('Collection'),
        _types = hAzzle.require('Types'),
        _core = hAzzle.require('Core'),
        _util = hAzzle.require('Util'),

        // Return correct index value

        inVal = function(sel, index) {
            return typeof sel === 'undefined' && !_types.isNumber(index) ? 0 :
                _types.isNumber(sel) ? sel : _types.isNumber(index) ? index : null;
        },
        gather = function(els, fn) {
            var ret = [],
                res, i = 0,
                j, len = els.length,
                f;
            for (; i < len;) {
                for (j = 0, f = (res = fn(els[i], i++)).length; j < f;) {
                    ret.push(res[j++]);
                }
            }
            return ret;
        },
        traverse = function(els, method, sel, index) {
            index = inVal(sel, index);
            return gather(els, function(el, elind) {
                var matches, i = index || 0,
                    ret = [],
                    elem = el[method];
                while (elem && (index === null || i >= 0)) {
                    matches = _jiesa.matches(elem, typeof sel === 'string' ? sel : '*')
                    if (_types.isElement(elem) && matches && (index === null || i-- === 0)) {
                        if (index === null && method !== 'nextElementSibling' && method !== 'parentElement') {
                            ret.unshift(elem);
                        } else {
                            ret.push(elem);
                        }
                    }
                    elem = elem[method];
                }
                return ret;
            });
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
    
    // Return the closest parent of an element based on a selector

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

    // Traverse up the DOM tree
    // E.g hAzzle('test').up(2) or hAzzle('test').up('li', 2) 

    this.up = function(sel, index) {
        return hAzzle(traverse(this.elements, 'parentElement', sel, index));
    };

    // Traverse down the DOM tree 
    // E.g hAzzle('test').down(2) or hAzzle('test').down('nav') 

    this.down = function(sel, index) {
        index = inVal(sel, index);
        return hAzzle(gather(this.elements, function(elem) {
            var jf = _jiesa.find(typeof sel === 'string' ? sel : '*', elem);
            return index === null ? jf : ([jf[index]] || []);
        }));
    };

    // This methods will overwrite the existing first() and prev() methods already
    // included in the Core, and add extra features.
    // E.g hAzzle('test').next('nav', 4) or hAzzle('test').prev('nav') 

    _util.each({
        next: 'nextElementSibling',
        prev: 'previousElementSibling'
    }, function(value, prop) {
        this[prop] = function(sel, index) {
            if (index) {
                return hAzzle(traverse(this.elements, value, sel, index));
            } else {
                return this.map(function(elem) {
                    return elem[value];
                }).filter(sel);
            }
        };
    }.bind(this));

    return {};
});