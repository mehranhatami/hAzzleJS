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

    // Retrieve the DOM elements matched by the hAzzle object.
    this.get = function(index) {
        return index === undefined ? slice(this.elements) : this.elements[index >= 0 ? index : index + this.length];
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

    this.index = function(sel) {
        return sel === undefined ?
            this.parent().children().indexOf(this.elements[0]) :
            this.elements.indexOf(hAzzle(sel).elements[0]);
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

    this.parentElement = function() {
        return this.parent().children();
    };

    this.firstElementChild = function() {
        return this.children().first();
    };

    this.lastElementChild = function() {
        return this.children().last();
    };

    this.previousElementSibling = function() {
        return this.prev().last();
    };

    this.nextElementSibling = function() {
        return this.next().first();
    };

    this.childElementCount = function() {
        return this.children().length;
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
            // Note! The native 'bind' method do not give the best performance, but
            // this happen only on pageload. Anyone who wan't to fix this?
    }.bind(this));

    return {
        makeArray: makeArray,
        slice: slice,
        reduce: reduce,
        inArray: inArray
    };
});