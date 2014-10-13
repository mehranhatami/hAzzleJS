// dom.js
hAzzle.define('Dom', function() {

    var _util = hAzzle.require('Util'),
        _core = hAzzle.require('Core'),
        _collection = hAzzle.require('Collection'),
        _matches = hAzzle.require('Matches'),
        _jiesa = hAzzle.require('Jiesa'),

        rquick = /^(?:(\w+)|\.([\w\-]+))$/,

        // Creates a new hAzzle instance applying a filter if necessary
        _create = function(elements, selector) {
            return selector == null ? new hAzzle(elements) : new hAzzle(elements).filter(selector);
        };

    this.find = function(selector) {

        if (typeof selector === 'string') {

            var elements;

        } else {

            if (this.length === 1) {

                var elem = this.elements[0],
                    quickMatch = rquick.exec(selector)

                if (quickMatch) {
                    
                    if (quickMatch[1]) {
                        // speed-up: 'TAG'
                        elem = _create(elem.getElementsByTagName(selector));
                        
                    } else {
                        // speed-up: '.CLASS'
                        elem = _create(node.getElementsByClassName(quickMatch[2]));
                    }
                }

                return _create(_collection.slice(_jiesa.find(selector, this.elements[0])));
                
            } else {
                elements = _collection.reduce(this.elements, function(elements, element) {
                    return _create(_core.uniqueSort(elements.concat(_collection.slice(_jiesa.find(selector, element)))));
                }, []);
            }
        }
        var i,
            len = this.length,
            self = this.elements;

        return _create(_util.filter(hAzzle(selector).elements, function(node) {
            for (i = 0; i < len; i++) {
                if (_core.contains(self[i], node)) {
                    return true;
                }
            }
        }));
    };

    // Implement the identical functionality for filter and not
    this.filter = function(selector, not) {
        var elems = this.elements;

        if (typeof selector === 'function') {
            var fn = selector;
            return _create(_util.filter(elems, function(elem, index) {
                return fn.call(elem, elem, index) != (not || false);
            }));
        }
        if (selector && selector[0] === '!') {
            selector = selector.slice(1);
            not = true;
        }

        return _create(_util.filter(elems, function(elem) {
            return _matches.matches(elem, selector) != (not || false);
        }));
    };

    return {
        _create: _create

    };
});