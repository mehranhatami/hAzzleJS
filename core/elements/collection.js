// collection.js
hAzzle.define('Collection', function() {

    var _util = hAzzle.require('Util'),
        _types = hAzzle.require('Types'),
        _arrayProto = Array.prototype,
        _keys = Object.keys,
        _concat = _arrayProto.concat,
        _push = _arrayProto.push,
        inArray = function(elem, array, i) {
            return array === undefined ? -1 : _arrayProto.indexOf.call(array, elem, i);
        },
        makeArray = function(arr, results) {
            var ret = results || [];

            if (arr !== undefined) {
                if (_types.isArrayLike(Object(arr))) {
                    _util.merge(ret, _types.isString(arr) ? [arr] : arr);
                } else {
                    _push.call(ret, arr);
                }
            }

            return ret;
        },

        //  Reduces a collection
        // Replacement for reduce -  ECMAScript 5 15.4.4.21     
        reduce = function(collection, fn, accumulator, args) {

            if (!collection) {
                collection = [];
            }

            fn = _util.createCallback(fn, args, 4);

            var keys = collection.length !== +collection.length && _keys(collection),
                length = (keys || collection).length,
                index = 0,
                currentKey;

            if (arguments.length < 3) {

                if (!length) {
                    hAzzle.err(true, 7, ' no collection length exist in collection.reduce()');
                }

                accumulator = collection[keys ? keys[index++] : index++];
            }
            for (; index < length; index++) {
                currentKey = keys ? keys[index] : index;
                accumulator = fn(accumulator, collection[currentKey], currentKey, collection);
            }
            return accumulator;
        },

        slice = function(array, start, end) {
            if (typeof start === 'undefined') {
                start = 0;
            }
            if (typeof end === 'undefined') {
                end = array ? array.length : 0;
            }
            var index = -1,
                length = end - start || 0,
                result = Array(length < 0 ? 0 : length);

            while (++index < length) {
                result[index] = array[start + index];
            }
            return result;
        };

    /* ------------- INTERNAL ARRAY METHODS ------------------------------- */

    // Convert hAzzle '.elements Array' to a jQuery / Zepto array
    // where 'this' contains the elements. The '.elements Array 
    // will be kept, but it will be possible to run jQuery / Zepto functions

    this.toJqueryZepto = function() {
            var i = this.length,
                els = this.elements;
            while (i--) {
                this[i] = els[i];
            }
            return this;
        };

        // Return an array or a specific DOM element matched by the hAzzle object

        this.get = function(index) {
            var result;
            if (index === undefined) {
                result = slice(this.elements, 0);
            } else if (index < 0) {
                result = this.elements[this.length + index];
            } else {
                result = this.elements[index];
            }
            return result;
        };

    // Get the element at position specified by index from the current collection.
    this.eq = function(index) {
        return index === -1 ? hAzzle(slice(this.elements, this.length - 1)) : hAzzle(slice(this.elements, index, index + 1));
    };

    this.reduce = function(fn, accumulator, args) {
        return reduce(this.elements, fn, accumulator, args);
    };

    this.indexOf = function(elem, arr, i) {
        return arr == null ? -1 : _arrayProto.indexOf.call(arr, elem, i);
    };

    this.map = function(fn, args) {
        return hAzzle(_util.map(this.elements, fn, args));
    };

    this.each = function(fn, args, rev) {
        _util.each(this.elements, fn, args, rev);
        return this;
    };

    this.slice = function(start, end) {
        return new hAzzle(slice(this.elements, start, end));
    };

    // Concatenate two elements lists
    this.concat = function() {
        var args = _util.map(slice(arguments), function(arr) {
            return arr instanceof hAzzle ? arr.elements : arr;
        });
        return hAzzle(_concat.apply(this.elements, args));
    };

    this.is = function(sel) {
        return this.length > 0 && this.filter(sel).length > 0;
    };

    // Get elements in list but not with this selector

    this.not = function(sel) {
        return this.filter(sel, true);
    };

    // Determine the position of an element within the set

    this.index = function(node) {
        var els = this.elements;
        if (!node) {
            return (els[0] && els[0].parentElement) ? this.first().prevAll().length : -1;
        }

        // Index in selector
        if (typeof node === 'string') {
            return _util.indexOf(hAzzle(node).elements, els[0]);
        }

        // Locate the position of the desired element
        return _util.indexOf(els, node instanceof hAzzle ? node.elements[0] : node);
    };

    this.add = function(sel, ctx) {
        var elements = sel;
        if (typeof sel === 'string') {
            elements = hAzzle(sel, ctx).elements;
        }
        return this.concat(elements);
    };

    this.first = function(index) {
        return index ? this.slice(0, index) : this.eq(0);
    };

    this.last = function(index) {
        return index ? this.slice(this.length - index) : this.eq(-1);
    };

    this.size = function() {
        return this.length;
    };

    // First() and prev()
    _util.each({
        next: 'nextElementSibling',
        prev: 'previousElementSibling'
    }, function(value, prop) {
        this[prop] = function(sel) {
            return this.map(function(elem) {
                return elem[value];
            }).filter(sel);
        };
    }.bind(this));

    // prevAll() and nextAll()
    _util.each({
        prevAll: 'previousElementSibling',
        nextAll: 'nextElementSibling'
    }, function(value, prop) {
        this[prop] = function() {
            var matched = [];
            this.each(function(elem) {
                while ((elem = elem[value]) && elem.nodeType !== 9) {
                    matched.push(elem);
                }
            });
            return hAzzle(matched);
        };
    }.bind(this));


    return {
        makeArray: makeArray,
        slice: slice,
        reduce: reduce,
        inArray: inArray
    };
});