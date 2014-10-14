// collection.js
hAzzle.define('Collection', function() {

    var _util = hAzzle.require('Util'),
        _types = hAzzle.require('Types'),
        _arrayProto = Array.prototype,
        _keys = Object.keys,
        _concat = _arrayProto.concat,
        _push = _arrayProto.push,
        inArray = function(elem, arr, i) {
            return arr == null ? -1 : _arrayProto.indexOf.call(arr, elem, i);
        },
        makeArray = function(arr, results) {
            var ret = results || [];

            if (arr != null) {
                if (_types.isArrayLike(Object(arr))) {
                    _util.merge(ret, _util.isString(arr) ? [arr] : arr);
                } else {
                    _push.call(ret, arr);
                }
            }

            return ret;
        },
        removeValue = function(array, value) {
            var index = indexOf(array, value);
            if (index >= 0) {
                array.splice(index, 1);
            }
            return value;
        },
        //  Reduces a collection
        reduce = function(collection, fn, accumulator, args) {

            if (collection == null) {
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

            var e = end,
                length = array.length,
                result = [];

            start = fixedIndex(length, Math.max(-array.length, start), 0);

            e = fixedIndex(end < 0 ? length : length + 1, end, length);

            end = e === null || e > length ? end < 0 ? 0 : length : e;

            while (start !== null && start < end) {
                result.push(array[start++]);
            }
            return result;
        },

        // Given an index & length, return a 'fixed' index, fixes non-numbers & negative indexes

        fixedIndex = function(length, index, def) {
            if (index < 0) {
                index = length + index;
            } else if (index < 0 || index >= length) {
                return null;
            }
            return !index && index !== 0 ? def : index;
        },
        // Determines the number of elements in an array, the number of properties an object has, or
        // the length of a string.
        size = function(obj, ownPropsOnly) {
            var count = 0,
                key;

            if (_types.isArray(obj) || _types.isString(obj)) {
                return obj.length;
            } else if (_types.isObject(obj)) {
                for (key in obj)
                    if (!ownPropsOnly || _util.has(key)) {
                        count++;
                    }
            }

            return count;
        };

    // Core function, so this one has to be fast!!!!!!
    this.get = function(index) {
        return index == null ? slice(this.elements) :
            this.elements[fixedIndex(this.length, index, 0)];
    };

    this.eq = function(index) {
        // We have to explicitly null the selection since .get()
        // returns the whole collection when called without arguments.
        return hAzzle(index == null ? '' : this.get(index));
    };

    this.reduce = function(fn, accumulator, args) {
        return reduce(this.elements, fn, accumulator, args);
    };

    this.indexOf = function(elem, arr, i) {
        return arr == null ? -1 : _arrayProto.indexOf.call(arr, elem, i);
    };

    this.map = function(fn, args) {
        return new hAzzle(_util.map(this.elements, fn, args));
    };

    this.each = function(fn, args, rev) {
        _util.each(this.elements, fn, args, rev);
        return this;
    };

    this.iterate = function(fn, args) {
        return function(a, b, c, d) {
            return this.each(function(element) {
                fn.call(args, element, a, b, c, d);
            });
        };
    };

    this.slice = function(start, end) {
        return new hAzzle(slice(this.elements, start, end));
    };

    // Concatenate two elements lists
    this.concat = function() {
        var args = _util.map(slice(arguments), function(arr) {
            return arr instanceof hAzzle ? arr.elements : arr;
        });
        return new hAzzle(_concat.apply(this.elements, args));
    };

    return {
        makeArray: makeArray,
        removeValue: removeValue,
        slice: slice,
        reduce: reduce,
        size: size,
        inArray: inArray
    };
});